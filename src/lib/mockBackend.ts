import type { Backend } from './backend'
import type { CatalogProduct, ShopConfig, Order, NewOrderInput, CustomerProfile } from './types'
import { shopEnv } from './config'

// Sample catalog for offline preview (real data arrives when the desktop app
// publishes to Firebase). Security-shop brands, matching the storage app.
const IMG = (label: string, c = '0e7490') =>
  `https://placehold.co/600x600/${c}/ffffff/png?text=${encodeURIComponent(label)}`

const CATALOG: CatalogProduct[] = [
  ['5001', 'Dahua IPC-HFW2431S', 'Dahua', 'Fixed Bullet', 89, 14, '4MP bullet camera, IR 80m, IP67 weatherproof.'],
  ['5002', 'Hikvision DS-2CD1043', 'Hikvision', 'Fixed Bullet', 76, 22, '4MP fixed bullet, PoE, night vision.'],
  ['5003', 'Hikvision DS-7608NI NVR', 'Hikvision', 'NVR', 149, 6, '8-channel NVR, 4K, 1x SATA.'],
  ['5004', 'Dahua NVR4108-8P', 'Dahua', 'NVR', 168, 4, '8-channel PoE NVR, up to 8MP.'],
  ['5005', 'Sonoff Cam Slim Wi-Fi', 'Sonoff', 'Tilt Wifi', 29, 40, 'Compact indoor Wi-Fi camera, 1080p, 2-way audio.'],
  ['5006', 'Moes Tuya 4G Camera', 'Moes', 'Tilt 4G', 58, 12, 'Outdoor 4G PTZ camera, solar-ready.'],
  ['5007', 'Dahua PFM320D PoE Switch', 'Dahua', 'POE', 42, 18, '4-port PoE switch for IP cameras.'],
  ['5008', 'Hikvision DS-2CD2T47 Turret', 'Hikvision', 'Fixed Bullet', 112, 0, '4MP turret, ColorVu full-colour night vision.'],
  ['5009', 'Wiking 24" CCTV Monitor', 'Wiking', 'Monitor', 96, 5, '24-inch 1080p monitor with HDMI/VGA/BNC.'],
  ['5010', 'Dahua ASI7213 Terminal', 'Dahua', 'Terminal', 210, 3, 'Face-recognition access terminal.']
].map(
  ([id, name, brand, category, price, qty, description]) =>
    ({
      id: String(id),
      name: String(name),
      brand: String(brand),
      category: String(category),
      price: Number(price),
      currency: 'USD',
      images: [IMG(String(brand))],
      inStock: Number(qty) > 0,
      stockQty: Number(qty),
      description: String(description),
      updatedAt: Date.now()
    }) as CatalogProduct
)

const CONFIG: ShopConfig = {
  name: shopEnv.name,
  phone: shopEnv.phone ?? '+998 90 000 00 00',
  address: shopEnv.address ?? 'Tashkent, Uzbekistan',
  currency: 'USD',
  brands: [...new Set(CATALOG.map((p) => p.brand!).filter(Boolean))],
  categories: [...new Set(CATALOG.map((p) => p.category!).filter(Boolean))]
}

const ORDERS_KEY = 'orion.mock.orders'
const PROFILE_KEY = 'orion.mock.profile'

function readOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[]
  } catch {
    return []
  }
}
function writeOrders(list: Order[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

export const mockBackend: Backend = {
  async listCatalog() {
    await delay()
    return CATALOG
  },
  async getProduct(id) {
    await delay(150)
    return CATALOG.find((p) => p.id === id) ?? null
  },
  async getShopConfig() {
    return CONFIG
  },
  async createOrder(input: NewOrderInput, uid: string, phone: string) {
    await delay(400)
    const subtotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0)
    const order: Order = {
      id: 'M' + Date.now().toString(36).toUpperCase(),
      uid,
      phone,
      customerName: input.customerName,
      items: input.items,
      subtotal,
      total: subtotal,
      currency: CONFIG.currency,
      fulfillment: input.fulfillment,
      payment: { method: input.paymentMethod, status: 'pending' },
      status: 'new',
      createdAt: Date.now(),
      adminSaleId: null
    }
    writeOrders([order, ...readOrders()])
    return order
  },
  async listMyOrders(uid) {
    await delay(200)
    return readOrders().filter((o) => o.uid === uid)
  },
  async getOrder(id, uid) {
    await delay(150)
    return readOrders().find((o) => o.id === id && o.uid === uid) ?? null
  },
  async cancelOrder(id, uid) {
    await delay(200)
    const list = readOrders()
    const o = list.find((x) => x.id === id && x.uid === uid)
    if (!o) throw new Error('Order not found.')
    if (o.status !== 'new' && o.status !== 'confirmed') {
      throw new Error('This order can no longer be cancelled.')
    }
    o.status = 'cancelled'
    writeOrders(list)
  },
  async getCustomerProfile(uid) {
    try {
      const raw = localStorage.getItem(PROFILE_KEY)
      if (!raw) return null
      const p = JSON.parse(raw) as CustomerProfile
      return p.uid === uid ? p : null
    } catch {
      return null
    }
  },
  async saveCustomerProfile(profile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    } catch {
      /* ignore */
    }
  }
}
