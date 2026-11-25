import 'server-only'

import config from '@payload-config'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'

const APP_SESSION_COOKIE = 'app-session'
const APP_USER_COLLECTION = 'users' as const

type Credentials = {
  email: string
  password: string
}

export function createAppAuth() {
  return {
    async currentUser() {
      const token = (await cookies()).get(APP_SESSION_COOKIE)?.value
      if (!token) return null

      const payload = await getPayload({ config })
      const authHeaders = new Headers({ Authorization: `JWT ${token}` })
      const { user } = await payload.auth({ headers: authHeaders })

      if (!user || user.collection !== APP_USER_COLLECTION) return null
      return user
    },

    async login({ email, password }: Credentials) {
      const payload = await getPayload({ config })
      const result = await payload.login({
        collection: APP_USER_COLLECTION,
        data: { email, password },
      })

      if (!result.token || !result.user) throw new Error('Accesso non riuscito')

      const cookieStore = await cookies()
      cookieStore.set(APP_SESSION_COOKIE, result.token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })

      return result.user
    },

    async signup({ email, password, name }: Credentials & { name: string }) {
      const payload = await getPayload({ config })
      await payload.create({
        collection: APP_USER_COLLECTION,
        data: { email, name, password },
        overrideAccess: false,
      })
      return this.login({ email, password })
    },

    async logout() {
      const cookieStore = await cookies()
      cookieStore.delete(APP_SESSION_COOKIE)
    },
  }
}

export const appAuth = createAppAuth()
