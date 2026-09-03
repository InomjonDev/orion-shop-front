// Reads public env config. When Firebase isn't configured we fall back to a mock
// backend so the UI is fully previewable offline (mirrors the desktop app's devMock).

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? ''
}

/** True only when the essential Firebase keys are present. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
)

// Firestore database id. Standard projects use "(default)"; this project's DB
// happens to be named "default", so it's set via env.
export const firestoreDatabaseId =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || '(default)'

export const shopEnv = {
  name: process.env.NEXT_PUBLIC_SHOP_NAME || 'OrionStorage',
  phone: process.env.NEXT_PUBLIC_SHOP_PHONE || null,
  address: process.env.NEXT_PUBLIC_SHOP_ADDRESS || null,
  cloudinaryCloud: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || null
}

// Telegram login. When a bot username is set, the storefront shows the
// "Log in with Telegram" widget instead of the (paid) SMS flow.
export const telegramBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || ''
export const isTelegramConfigured = Boolean(telegramBotUsername)
