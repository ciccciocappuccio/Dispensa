'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import { appAuth } from '@/lib/app-auth'

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }

const places = ['Frigo', 'Dispensa', 'Freezer'] as const
const iconKeys = ['glass', 'wheat', 'bowl', 'leaf', 'package', 'snowflake'] as const
const tones = ['cream', 'rose', 'sand', 'blue', 'green', 'mint', 'yellow'] as const

type PantryInput = {
  name: string
  quantity?: string
  place: (typeof places)[number]
  expiresAt: string
  iconKey: (typeof iconKeys)[number]
  tone: (typeof tones)[number]
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validatePantryInput(input: PantryInput): PantryInput {
  const name = cleanText(input.name, 100)
  const quantity = cleanText(input.quantity, 80)
  const expiresAt = new Date(input.expiresAt)

  if (!name) throw new Error('Inserisci il nome del prodotto.')
  if (!places.includes(input.place)) throw new Error('Scegli un luogo valido.')
  if (!iconKeys.includes(input.iconKey)) throw new Error('Icona prodotto non valida.')
  if (!tones.includes(input.tone)) throw new Error('Colore prodotto non valido.')
  if (Number.isNaN(expiresAt.getTime())) throw new Error('Inserisci una scadenza valida.')

  return {
    name,
    quantity: quantity || undefined,
    place: input.place,
    expiresAt: expiresAt.toISOString(),
    iconKey: input.iconKey,
    tone: input.tone,
  }
}

async function requireUser() {
  const user = await appAuth.currentUser()
  if (!user) throw new Error('La sessione è scaduta. Accedi di nuovo.')
  return user
}

function itemDTO(item: {
  id: string | number
  name: string
  quantity?: string | null
  place: string
  expiresAt: string
  iconKey: string
  tone: string
}) {
  return {
    id: String(item.id),
    name: item.name,
    quantity: item.quantity ?? '',
    place: item.place,
    expiresAt: item.expiresAt,
    iconKey: item.iconKey,
    tone: item.tone,
  }
}

function eventDTO(event: {
  id: string | number
  productName: string
  outcome: string
  occurredAt: string
}) {
  return {
    id: String(event.id),
    productName: event.productName,
    outcome: event.outcome,
    occurredAt: event.occurredAt,
  }
}

export async function signupAction(input: {
  name: string
  email: string
  password: string
}): Promise<ActionResult<{ name: string; email: string }>> {
  try {
    const name = cleanText(input.name, 40)
    const email = cleanText(input.email, 254).toLowerCase()
    const password = typeof input.password === 'string' ? input.password : ''

    if (!name) throw new Error('Inserisci il nome con cui vuoi essere chiamato.')
    if (!validEmail(email)) throw new Error('Inserisci un indirizzo email valido.')
    if (password.length < 8) throw new Error('La password deve contenere almeno 8 caratteri.')

    const user = await appAuth.signup({ email, name, password })
    return { ok: true, data: { email: user.email, name: user.name } }
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    return {
      ok: false,
      error: message.includes('unique') || message.includes('already')
        ? 'Esiste già un account con questa email.'
        : message || 'Non è stato possibile creare l’account.',
    }
  }
}

export async function loginAction(input: {
  email: string
  password: string
}): Promise<ActionResult<{ name: string; email: string }>> {
  try {
    const email = cleanText(input.email, 254).toLowerCase()
    const password = typeof input.password === 'string' ? input.password : ''
    if (!validEmail(email) || !password) throw new Error('Inserisci email e password.')

    const user = await appAuth.login({ email, password })
    return { ok: true, data: { email: user.email, name: user.name } }
  } catch {
    return { ok: false, error: 'Email o password non corretti.' }
  }
}

export async function logoutAction(): Promise<ActionResult> {
  await appAuth.logout()
  return { ok: true, data: undefined }
}

export async function createPantryItemAction(
  input: PantryInput,
): Promise<ActionResult<ReturnType<typeof itemDTO>>> {
  try {
    const user = await requireUser()
    const payload = await getPayload({ config })
    const item = await payload.create({
      collection: 'pantry-items',
      data: { ...validatePantryInput(input), owner: user.id },
      draft: false,
      user,
      overrideAccess: false,
    })
    return { ok: true, data: itemDTO(item) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Prodotto non salvato.' }
  }
}

export async function updatePantryItemAction(
  id: string,
  input: { quantity?: string; expiresAt?: string },
): Promise<ActionResult<ReturnType<typeof itemDTO>>> {
  try {
    const user = await requireUser()
    const data: { quantity?: string | null; expiresAt?: string } = {}

    if ('quantity' in input) data.quantity = cleanText(input.quantity, 80) || null
    if ('expiresAt' in input) {
      const expiresAt = new Date(input.expiresAt ?? '')
      if (Number.isNaN(expiresAt.getTime())) throw new Error('Inserisci una scadenza valida.')
      data.expiresAt = expiresAt.toISOString()
    }
    if (!Object.keys(data).length) throw new Error('Nessuna modifica valida.')

    const payload = await getPayload({ config })
    const item = await payload.update({
      collection: 'pantry-items',
      id,
      data,
      user,
      overrideAccess: false,
    })
    return { ok: true, data: itemDTO(item) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Modifica non salvata.' }
  }
}

export async function deletePantryItemAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser()
    const payload = await getPayload({ config })
    await payload.delete({
      collection: 'pantry-items',
      id,
      user,
      overrideAccess: false,
    })
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Prodotto non eliminato.' }
  }
}

export async function recordOutcomeAction(
  itemId: string,
  productName: string,
  outcome: 'saved' | 'wasted',
): Promise<ActionResult<ReturnType<typeof eventDTO>>> {
  let eventId: string | number | undefined
  try {
    const user = await requireUser()
    const payload = await getPayload({ config })
    const event = await payload.create({
      collection: 'pantry-events',
      data: {
        owner: user.id,
        productName: cleanText(productName, 100),
        outcome,
        occurredAt: new Date().toISOString(),
      },
      draft: false,
      user,
      overrideAccess: false,
    })
    eventId = event.id
    await payload.delete({
      collection: 'pantry-items',
      id: itemId,
      user,
      overrideAccess: false,
    })
    return { ok: true, data: eventDTO(event) }
  } catch (error) {
    if (eventId !== undefined) {
      const user = await appAuth.currentUser()
      if (user) {
        const payload = await getPayload({ config })
        await payload.delete({
          collection: 'pantry-events',
          id: eventId,
          user,
          overrideAccess: false,
        }).catch(() => undefined)
      }
    }
    return { ok: false, error: error instanceof Error ? error.message : 'Esito non salvato.' }
  }
}

export async function undoOutcomeAction(
  item: PantryInput,
  eventId: string,
): Promise<ActionResult<ReturnType<typeof itemDTO>>> {
  let restoredId: string | number | undefined
  try {
    const user = await requireUser()
    const payload = await getPayload({ config })
    const restored = await payload.create({
      collection: 'pantry-items',
      data: { ...validatePantryInput(item), owner: user.id },
      draft: false,
      user,
      overrideAccess: false,
    })
    restoredId = restored.id
    await payload.delete({
      collection: 'pantry-events',
      id: eventId,
      user,
      overrideAccess: false,
    })
    return { ok: true, data: itemDTO(restored) }
  } catch (error) {
    if (restoredId !== undefined) {
      const user = await appAuth.currentUser()
      if (user) {
        const payload = await getPayload({ config })
        await payload.delete({
          collection: 'pantry-items',
          id: restoredId,
          user,
          overrideAccess: false,
        }).catch(() => undefined)
      }
    }
    return { ok: false, error: error instanceof Error ? error.message : 'Ripristino non riuscito.' }
  }
}

export async function updateOutcomeAction(
  id: string,
  outcome: 'saved' | 'wasted',
): Promise<ActionResult<ReturnType<typeof eventDTO>>> {
  try {
    const user = await requireUser()
    const payload = await getPayload({ config })
    const event = await payload.update({
      collection: 'pantry-events',
      id,
      data: { outcome },
      user,
      overrideAccess: false,
    })
    return { ok: true, data: eventDTO(event) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Storico non aggiornato.' }
  }
}

export async function updatePreferencesAction(input: {
  alertDays: string
  dailyLimit: boolean
  quietHours: boolean
}): Promise<ActionResult> {
  try {
    const user = await requireUser()
    if (!['1', '2', '3'].includes(input.alertDays)) throw new Error('Soglia avvisi non valida.')
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        alertDays: input.alertDays as '1' | '2' | '3',
        dailyLimit: Boolean(input.dailyLimit),
        quietHours: Boolean(input.quietHours),
      },
      user,
      overrideAccess: false,
    })
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Preferenze non salvate.' }
  }
}
