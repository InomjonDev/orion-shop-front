import type { CatalogProduct, ShopConfig, Order, NewOrderInput, CustomerProfile } from './types'
import { isFirebaseConfigured } from './config'

/** Data operations the storefront performs. Auth lives separately in auth.tsx. */
export interface Backend {
  listCatalog(): Promise<CatalogProduct[]>
  getProduct(id: string): Promise<CatalogProduct | null>
  getShopConfig(): Promise<ShopConfig>
  createOrder(input: NewOrderInput, uid: string, phone: string): Promise<Order>
  listMyOrders(uid: string): Promise<Order[]>
  getOrder(id: string, uid: string): Promise<Order | null>
  getCustomerProfile(uid: string): Promise<CustomerProfile | null>
  saveCustomerProfile(profile: CustomerProfile): Promise<void>
}

let cached: Backend | null = null

/** Returns the Firebase-backed implementation when configured, else the mock. */
export async function getBackend(): Promise<Backend> {
  if (cached) return cached
  if (isFirebaseConfigured) {
    cached = (await import('./firebaseBackend')).firebaseBackend
  } else {
    cached = (await import('./mockBackend')).mockBackend
  }
  return cached
}
