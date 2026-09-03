'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ChevronLeft, MapPin, Store, Truck, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import type { Order } from '@/lib/types'
import { getBackend } from '@/lib/backend'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { formatMoney, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'

function OrderInner(): React.ReactElement {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const isNew = search.get('new') === '1'
  const { t, lang } = useI18n()
  const { user, ready } = useAuth()
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  async function handleCancel(): Promise<void> {
    if (!user || !order) return
    setCancelling(true)
    try {
      const b = await getBackend()
      await b.cancelOrder(order.id, user.uid)
      toast.success(t('order.cancelled'))
      setOrder({ ...order, status: 'cancelled' })
      setConfirming(false)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setCancelling(false)
    }
  }

  useEffect(() => {
    if (!ready) return
    if (!user) {
      setOrder(null)
      return
    }
    let active = true
    getBackend()
      .then((b) => b.getOrder(params.id, user.uid))
      .then((o) => active && setOrder(o))
    return () => {
      active = false
    }
  }, [params.id, user, ready])

  if (order === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (order === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="font-medium">{t('product.notFound')}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/orders">{t('orders.title')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {t('orders.title')}
      </Link>

      {isNew && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
          <div>
            <p className="font-medium text-emerald-700 dark:text-emerald-300">{t('order.thankYou')}</p>
            <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
              {t('order.confirmHint', { phone: order.phone })}
            </p>
          </div>
        </div>
      )}

      <Card className="mt-4">
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="text-lg">{t('order.number', { id: order.id })}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {t('order.placedOn', { date: formatDate(order.createdAt, lang) })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </CardHeader>
        <CardContent>
          <h3 className="text-sm font-semibold">{t('order.items')}</h3>
          <ul className="mt-2 space-y-2">
            {order.items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3 text-sm">
                <span>
                  <span className="text-muted-foreground">{i.quantity}× </span>
                  {i.name}
                </span>
                <span className="tabular-nums">{formatMoney(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="font-medium">{t('order.total')}</span>
            <span className="font-heading text-xl font-bold tabular-nums">{formatMoney(order.total)}</span>
          </div>

          <Separator className="my-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('order.fulfillment')}
              </h3>
              <div className="mt-1.5 flex items-center gap-2 text-sm">
                {order.fulfillment.type === 'delivery' ? (
                  <Truck className="size-4 text-muted-foreground" />
                ) : (
                  <Store className="size-4 text-muted-foreground" />
                )}
                {t(order.fulfillment.type === 'delivery' ? 'checkout.delivery' : 'checkout.pickup')}
              </div>
              {order.fulfillment.address && (
                <div className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  {order.fulfillment.address}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('order.payment')}
              </h3>
              <div className="mt-1.5 flex items-center gap-2 text-sm">
                <Wallet className="size-4 text-muted-foreground" />
                {t('checkout.cod')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(order.status === 'new' || order.status === 'confirmed') &&
        (confirming ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
            <span className="text-sm font-medium">{t('order.cancelConfirm')}</span>
            <Button
              size="sm"
              variant="destructive"
              className="ml-auto"
              disabled={cancelling}
              onClick={handleCancel}
            >
              {t('order.cancel')}
            </Button>
            <Button size="sm" variant="outline" disabled={cancelling} onClick={() => setConfirming(false)}>
              {t('order.keep')}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="mt-4 w-full text-destructive hover:text-destructive"
            onClick={() => setConfirming(true)}
          >
            {t('order.cancel')}
          </Button>
        ))}

      <div className="mt-4 flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">{t('order.backToShop')}</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/orders">{t('order.viewOrders')}</Link>
        </Button>
      </div>
    </div>
  )
}

export default function OrderDetailPage(): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <OrderInner />
    </Suspense>
  )
}
