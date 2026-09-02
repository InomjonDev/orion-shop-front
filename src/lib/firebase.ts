// Client-side Firebase initialization. Only imported when Firebase is configured
// (see backend.ts / auth.tsx), and only ever runs in the browser.
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { firebaseConfig, firestoreDatabaseId } from './config'

let app: FirebaseApp | null = null

export function getFirebaseApp(): FirebaseApp {
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return app
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp())
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp(), firestoreDatabaseId)
}
