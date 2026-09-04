import type { App } from 'firebase-admin/app'
import type { Auth } from 'firebase-admin/auth'
import type { Firestore } from 'firebase-admin/firestore'

/**
 * Server-side Firebase Admin singletons, shared by the API routes.
 *
 * The service-account JSON lives only in the `FIREBASE_ADMIN_SERVICE_ACCOUNT`
 * env var (set on the host, never shipped to the browser). The Admin SDK
 * bypasses Firestore security rules, so it is the only thing that may write the
 * verified `phone` onto a customer document.
 */

// This project's Firestore database is literally named "default" (not the
// standard "(default)"), so it must be targeted explicitly.
const DATABASE_ID = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || 'default'

let appPromise: Promise<App> | null = null
let authPromise: Promise<Auth> | null = null
let dbPromise: Promise<Firestore> | null = null

export function adminConfigured(): boolean {
  return Boolean(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)
}

async function getApp(): Promise<App> {
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, getApps, cert } = await import('firebase-admin/app')
      if (getApps().length) return getApps()[0]
      const sa = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT || '{}')
      return initializeApp({ credential: cert(sa) })
    })()
  }
  return appPromise
}

export async function getAdminAuth(): Promise<Auth> {
  if (!authPromise) {
    authPromise = (async () => {
      const { getAuth } = await import('firebase-admin/auth')
      return getAuth(await getApp())
    })()
  }
  return authPromise
}

export async function getAdminDb(): Promise<Firestore> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const { getFirestore } = await import('firebase-admin/firestore')
      return getFirestore(await getApp(), DATABASE_ID)
    })()
  }
  return dbPromise
}
