// Shared shape of the data the storefront reads/writes in the cloud. The desktop
// admin app publishes `CatalogProduct` docs and reads `Order` docs; these types are
// the contract between the two. Internal fields (cost price, shelf) never appear here.

export interface CatalogProduct {
  id: string // barcode (stable id used by both apps)
  name: string
  brand: string | null
  category: string | null
  price: number
  currency: string // e.g. 'USD'
  images: string[] // Cloudinary URLs (may be empty)
  inStock: boolean
  stockQty: number | null
  description: string | null
  updatedAt: number // epoch ms
}

export interface ShopConfig {
  name: string
  phone: string | null
  address: string | null
  currency: string
  brands: string[]
  categories: string[]
}

export type FulfillmentType = 'pickup' | 'delivery'
export type PaymentMethod = 'cod' | 'card'
export type PaymentStatus = 'pending' | 'paid'
export type OrderStatus = 'new' | 'confirmed' | 'fulfilled' | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  uid: string
  phone: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  total: number
  currency: string
  fulfillment: {
    type: FulfillmentType
    address: string | null
    note: string | null
  }
  payment: {
    method: PaymentMethod
    status: PaymentStatus
  }
  status: OrderStatus
  createdAt: number
  adminSaleId: number | null
}

/** Fields the customer supplies at checkout (the rest is derived server-side). */
export interface NewOrderInput {
  customerName: string
  items: OrderItem[]
  fulfillment: {
    type: FulfillmentType
    address: string | null
    note: string | null
  }
  paymentMethod: PaymentMethod
}

export interface CustomerProfile {
  uid: string
  phone: string
  name: string | null
  address: string | null
}

export type Lang = 'uz' | 'ru' | 'en'

/** Payload the Telegram Login Widget returns to the browser. */
export interface TelegramAuthData {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}
