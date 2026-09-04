import type { Backend } from './backend'
import { firebaseBackend } from './firebaseBackend'
import { mockBackend } from './mockBackend'

/**
 * Local / guest mode backend.
 *
 * Used when Firebase is configured (so the real published catalog is available)
 * but no login provider is (e.g. local `next dev`, where the Telegram widget
 * can't run because the bot's domain is the production site). It reads the real
 * catalog and shop config from Firestore — those are public, so they need no
 * login — while keeping the signed-in user's private data (profile + orders) in
 * the browser.
 *
 * This means the shop is fully usable locally with the guest login and no
 * Firestore "insufficient permissions" errors, and local test orders never land
 * in the live shop's data. Production (Telegram login) always uses
 * `firebaseBackend` directly and is unaffected.
 */
export const guestBackend: Backend = {
  ...mockBackend,
  // Real published data (public reads, no auth required):
  listCatalog: firebaseBackend.listCatalog,
  getProduct: firebaseBackend.getProduct,
  getShopConfig: firebaseBackend.getShopConfig
}
