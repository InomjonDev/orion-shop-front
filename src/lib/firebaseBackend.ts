import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  setDoc,
  Timestamp
} from 'firebase/firestore'
import type { Backend } from './backend'
import type { CatalogProduct, ShopConfig, Order, NewOrderInput, CustomerProfile } from './types'
import { getDb } from './firebase'
import { shopEnv } from './config'

function toMillis(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis()
  if (typeof v === 'number') return v
  return Date.now()
}

function mapCatalog(id: string, d: Record<string, unknown>): CatalogProduct {
  return {
    id,
    name: (d.name as string) ?? '',
    brand: (d.brand as string) ?? null,
    category: (d.category as string) ?? null,
    price: (d.price as number) ?? 0,
    currency: (d.currency as string) ?? 'USD',
    images: (d.images as string[]) ?? [],
    inStock: (d.inStock as boolean) ?? false,
    stockQty: (d.stockQty as number) ?? null,
    description: (d.description as string) ?? null,
    updatedAt: toMillis(d.updatedAt)
  }
}

function mapOrder(id: string, d: Record<string, unknown>): Order {
  return {
    id,
    uid: (d.uid as string) ?? '',
    phone: (d.phone as string) ?? '',
    customerName: (d.customerName as string) ?? '',
    items: (d.items as Order['items']) ?? [],
    subtotal: (d.subtotal as number) ?? 0,
    total: (d.total as number) ?? 0,
    currency: (d.currency as string) ?? 'USD',
    fulfillment: (d.fulfillment as Order['fulfillment']) ?? {
      type: 'pickup',
      address: null,
      note: null
    },
    payment: (d.payment as Order['payment']) ?? { method: 'cod', status: 'pending' },
    status: (d.status as Order['status']) ?? 'new',
    createdAt: toMillis(d.createdAt),
    adminSaleId: (d.adminSaleId as number) ?? null
  }
}

export const firebaseBackend: Backend = {
  async listCatalog() {
    const db = getDb()
    const q = query(
      collection(db, 'catalog'),
      where('shopVisible', '==', true),
      orderBy('name')
    )
    const snap = await getDocs(q)
    return snap.docs.map((s) => mapCatalog(s.id, s.data()))
  },

  async getProduct(id) {
    const db = getDb()
    const snap = await getDoc(doc(db, 'catalog', id))
    return snap.exists() ? mapCatalog(snap.id, snap.data()) : null
  },

  async getShopConfig() {
    const db = getDb()
    const snap = await getDoc(doc(db, 'shopMeta', 'config'))
    const d = snap.exists() ? (snap.data() as Record<string, unknown>) : {}
    return {
      name: (d.name as string) ?? shopEnv.name,
      phone: (d.phone as string) ?? shopEnv.phone,
      address: (d.address as string) ?? shopEnv.address,
      currency: (d.currency as string) ?? 'USD',
      brands: (d.brands as string[]) ?? [],
      categories: (d.categories as string[]) ?? []
    } as ShopConfig
  },

  async createOrder(input: NewOrderInput, uid: string, phone: string) {
    const db = getDb()
    const subtotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0)
    const payload = {
      uid,
      phone,
      customerName: input.customerName,
      items: input.items,
      subtotal,
      total: subtotal,
      currency: 'USD',
      fulfillment: input.fulfillment,
      payment: { method: input.paymentMethod, status: 'pending' as const },
      status: 'new' as const,
      createdAt: serverTimestamp(),
      adminSaleId: null
    }
    const ref = await addDoc(collection(db, 'orders'), payload)
    return { ...mapOrder(ref.id, { ...payload, createdAt: Date.now() }) }
  },

  async listMyOrders(uid) {
    const db = getDb()
    const q = query(
      collection(db, 'orders'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map((s) => mapOrder(s.id, s.data()))
  },

  async getOrder(id, uid) {
    const db = getDb()
    const snap = await getDoc(doc(db, 'orders', id))
    if (!snap.exists()) return null
    const order = mapOrder(snap.id, snap.data())
    return order.uid === uid ? order : null
  },

  async getCustomerProfile(uid) {
    const db = getDb()
    const snap = await getDoc(doc(db, 'customers', uid))
    if (!snap.exists()) return null
    const d = snap.data()
    return {
      uid,
      phone: (d.phone as string) ?? '',
      name: (d.name as string) ?? null,
      address: (d.address as string) ?? null
    }
  },

  async saveCustomerProfile(profile) {
    const db = getDb()
    await setDoc(
      doc(db, 'customers', profile.uid),
      {
        phone: profile.phone,
        name: profile.name,
        address: profile.address,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    )
  }
}
