import type { CatalogProduct, ShopConfig, Order, NewOrderInput, CustomerProfile } from './types'
import { isFirebaseConfigured, isTelegramConfigured } from './config'

/** Data operations the storefront performs. Auth lives separately in auth.tsx. */
export interface Backend {
  listCatalog(): Promise<CatalogProduct[]>
  getProduct(id: string): Promise<CatalogProduct | null>
  getShopConfig(): Promise<ShopConfig>
  createOrder(input: NewOrderInput, uid: string, phone: string): Promise<Order>
  listMyOrders(uid: string): Promise<Order[]>
  getOrder(id: string, uid: string): Promise<Order | null>
  cancelOrder(id: string, uid: string): Promise<void>
  getCustomerProfile(uid: string): Promise<CustomerProfile | null>
  /** Saves only fields the customer owns. The phone is set by the server (via
   *  Telegram verification) and can never be written from the client. */
  saveCustomerProfile(profile: { uid: string; name: string | null; address: string | null }): Promise<void>
  /** Local/offline only: mark a typed phone as verified so the flow can be
   *  exercised without a real Telegram round-trip. Absent on the real backend. */
  setVerifiedPhoneForTest?(uid: string, phone: string): Promise<void>
}

let cached: Backend | null = null

/**
 * Picks the data layer:
 * - Firebase + a login provider (production) → full Firebase backend.
 * - Firebase but no login provider (local `next dev`) → real catalog from
 *   Firestore, but the signed-in user's private data kept in the browser, so the
 *   shop works with the guest login and no permission errors.
 * - No Firebase at all → fully offline mock.
 */
export async function getBackend(): Promise<Backend> {
  if (cached) return cached
  if (isFirebaseConfigured && isTelegramConfigured) {
    cached = (await import('./firebaseBackend')).firebaseBackend
  } else if (isFirebaseConfigured) {
    cached = (await import('./guestBackend')).guestBackend
  } else {
    cached = (await import('./mockBackend')).mockBackend
  }
  return cached
}
