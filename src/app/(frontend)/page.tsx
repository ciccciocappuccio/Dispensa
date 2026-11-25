import config from '@payload-config'
import { getPayload } from 'payload'
import { appAuth } from '@/lib/app-auth'
import { AuthScreen } from './AuthScreen'
import PantryApp from './PantryApp'

export default async function HomePage() {
  const user = await appAuth.currentUser()
  if (!user) return <AuthScreen />

  const payload = await getPayload({ config })
  const [items, events] = await Promise.all([
    payload.find({
      collection: 'pantry-items',
      where: { owner: { equals: user.id } },
      sort: 'expiresAt',
      limit: 100,
      pagination: false,
      user,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'pantry-events',
      where: { owner: { equals: user.id } },
      sort: '-occurredAt',
      limit: 100,
      pagination: false,
      user,
      overrideAccess: false,
    }),
  ])

  return (
    <PantryApp
      currentUser={{
        email: user.email,
        name: user.name,
        alertDays: user.alertDays ?? '2',
        dailyLimit: user.dailyLimit ?? true,
        quietHours: user.quietHours ?? true,
      }}
      initialEvents={events.docs.map((event) => ({
        id: String(event.id),
        productName: event.productName,
        outcome: event.outcome,
        occurredAt: event.occurredAt,
      }))}
      initialProducts={items.docs.map((item) => ({
        id: String(item.id),
        name: item.name,
        quantity: item.quantity ?? '',
        place: item.place,
        expiresAt: item.expiresAt,
        iconKey: item.iconKey,
        tone: item.tone,
      }))}
    />
  )
}
