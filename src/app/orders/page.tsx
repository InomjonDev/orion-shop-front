'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, LogIn, PackageOpen } from 'lucide-react'
import type { Order } from '@/lib/types'
import { getBackend } from '@/lib/backend'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { formatMoney, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'

export default function OrdersPage(): React.ReactElement {
  const { t, lang } = useI18n()
  const { user, ready } = useAuth()
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    if (!user) {
      setOrders([])
      return
    }
    let active = true
    getBackend()
      .then((b) => b.listMyOrders(user.uid))
      .then((list) => active && setOrders(list))
    return () => {
      active = false
    }
  }, [user])

  if (ready && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <LogIn className="size-6" />
        </div>
        <p className="font-medium">{t('orders.signInHint')}</p>
        <Button asChild className="mt-4">
          <Link href="/login?next=/orders">{t('nav.login')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight">{t('orders.title')}</h1>

      <div className="mt-5 space-y-3">
        {orders === null ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <PackageOpen className="size-6" />
            </div>
            <p className="font-medium">{t('orders.empty')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('orders.emptyHint')}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/">{t('nav.catalog')}</Link>
            </Button>
          </div>
        ) : (
          orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`}>
              <Card className="flex items-center gap-4 p-4 transition-colors hover:bg-accent/40">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t('order.number', { id: o.id })}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {t('order.placedOn', { date: formatDate(o.createdAt, lang) })}
                  </div>
                  <div className="mt-1 truncate text-sm text-muted-foreground">
                    {o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums">{formatMoney(o.total)}</div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
