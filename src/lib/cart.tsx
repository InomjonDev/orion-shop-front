'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { CatalogProduct } from './types'

export interface CartLine {
  id: string
  name: string
  price: number
  image: string | null
  quantity: number
}

interface CartCtx {
  lines: CartLine[]
  count: number
  subtotal: number
  add: (p: CatalogProduct, qty?: number) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
}

const Ctx = createContext<CartCtx | null>(null)
const KEY = 'orion.shop.cart'

export function CartProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [lines, setLines] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setLines(JSON.parse(raw) as CartLine[])
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(KEY, JSON.stringify(lines))
    } catch {
      /* ignore */
    }
  }, [lines, hydrated])

  const add = useCallback((p: CatalogProduct, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === p.id)
      if (existing) {
        return prev.map((l) => (l.id === p.id ? { ...l, quantity: l.quantity + qty } : l))
      }
      return [
        ...prev,
        { id: p.id, name: p.name, price: p.price, image: p.images[0] ?? null, quantity: qty }
      ]
    })
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, quantity: Math.max(1, qty) } : l))
    )
  }, [])

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const count = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines])
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.price * l.quantity, 0), [lines])

  return (
    <Ctx.Provider value={{ lines, count, subtotal, add, setQty, remove, clear }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
