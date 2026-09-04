'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, Store, Truck, Wallet, ShoppingBag, LogIn, BadgeCheck, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import type { FulfillmentType, NewOrderInput, PaymentMethod } from '@/lib/types'
import { getBackend } from '@/lib/backend'
import { useAuth } from '@/lib/auth'
import { useCart } from '@/lib/cart'
import { useI18n } from '@/lib/i18n'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthPanel } from '@/components/AuthPanel'

export default function CheckoutPage(): React.ReactElement {
  const { t } = useI18n()
  const router = useRouter()
  const { user, ready } = useAuth()
  const { lines, subtotal, clear } = useCart()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [fulfillment, setFulfillment] = useState<FulfillmentType>('pickup')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [payment] = useState<PaymentMethod>('cod')
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    if (!user) return
    getBackend()
      .then((b) => b.getCustomerProfile(user.uid))
      .then((p) => {
        if (p?.name) setName(p.name)
        setPhone(p?.phone ?? '')
        setPhoneVerified(Boolean(p?.phoneVerified))
        if (p?.address) setAddress(p.address)
      })
  }, [user])

  async function placeOrder(): Promise<void> {
    if (!user) return
    if (lines.length === 0) {
      toast.error(t('checkout.emptyCart'))
      return
    }
    if (!name.trim()) {
      toast.error(t('checkout.nameReq'))
      return
    }
    if (!phoneVerified || !phone) {
      toast.error(t('checkout.verifyPhoneReq'))
      router.push('/profile?next=' + encodeURIComponent('/checkout'))
      return
    }
    if (fulfillment === 'delivery' && !address.trim()) {
      toast.error(t('checkout.addressReq'))
      return
    }

    setPlacing(true)
    try {
      const backend = await getBackend()
      const input: NewOrderInput = {
        customerName: name.trim(),
        items: lines.map((l) => ({
          productId: l.id,
          name: l.name,
          price: l.price,
          quantity: l.quantity
        })),
        fulfillment: {
          type: fulfillment,
          address: fulfillment === 'delivery' ? address.trim() : null,
          note: note.trim() || null
        },
        paymentMethod: payment
      }
      const order = await backend.createOrder(input, user.uid, phone)
      await backend.saveCustomerProfile({
        uid: user.uid,
        name: name.trim(),
        address: fulfillment === 'delivery' ? address.trim() : null
      })
      clear()
      router.replace(`/orders/${order.id}?new=1`)
    } catch (e) {
      toast.error((e as Error).message)
      setPlacing(false)
    }
  }

  // Empty cart
  if (lines.length === 0 && !placing) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <ShoppingBag className="size-6" />
        </div>
        <p className="font-medium">{t('cart.empty')}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">{t('cart.keepShopping')}</Link>
        </Button>
      </div>
    )
  }

  // Not signed in → inline auth
  if (ready && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mb-1 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <LogIn className="size-5" />
            </div>
            <CardTitle className="text-xl">{t('checkout.signInFirst')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('checkout.signInHint')}</p>
          </CardHeader>
          <CardContent>
            <AuthPanel />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight">{t('checkout.title')}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('checkout.contact')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t('checkout.name')}</Label>
                <Input
                  id="name"
                  placeholder={t('checkout.namePh')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('checkout.phone')}</Label>
                {phoneVerified && phone ? (
                  <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm">
                    <BadgeCheck className="size-4 shrink-0 text-primary" />
                    <span className="font-medium tabular-nums">{phone}</span>
                    <span className="ml-auto text-xs text-primary">{t('profile.phoneVerified')}</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-md border border-dashed border-amber-500/50 bg-amber-500/5 px-3 py-2.5 text-sm">
                    <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    <div className="flex-1">
                      <p className="text-muted-foreground">{t('checkout.phoneUnverified')}</p>
                      <Button asChild variant="link" className="h-auto p-0 text-primary">
                        <Link href={'/profile?next=' + encodeURIComponent('/checkout')}>
                          {t('checkout.verifyNow')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fulfillment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('checkout.fulfillment')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <OptionCard
                  active={fulfillment === 'pickup'}
                  onClick={() => setFulfillment('pickup')}
                  icon={<Store className="size-5" />}
                  title={t('checkout.pickup')}
                  hint={t('checkout.pickupHint')}
                />
                <OptionCard
                  active={fulfillment === 'delivery'}
                  onClick={() => setFulfillment('delivery')}
                  icon={<Truck className="size-5" />}
                  title={t('checkout.delivery')}
                  hint={t('checkout.deliveryHint')}
                />
              </div>
              {fulfillment === 'delivery' && (
                <div className="space-y-1.5">
                  <Label htmlFor="address">{t('checkout.address')}</Label>
                  <Input
                    id="address"
                    placeholder={t('checkout.addressPh')}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="note">
                  {t('checkout.note')}{' '}
                  <span className="text-muted-foreground">({t('common.optional')})</span>
                </Label>
                <Input
                  id="note"
                  placeholder={t('checkout.notePh')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('checkout.payment')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <OptionCard
                active
                onClick={() => {}}
                icon={<Wallet className="size-5" />}
                title={t('checkout.cod')}
                hint={t('checkout.codHint')}
              />
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4 opacity-70">
                <CreditCard className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{t('checkout.card')}</div>
                </div>
                <Badge variant="secondary">{t('checkout.cardSoon')}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('checkout.summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lines.map((l) => (
                  <li key={l.id} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="text-muted-foreground">{l.quantity}× </span>
                      {l.name}
                    </span>
                    <span className="tabular-nums">{formatMoney(l.price * l.quantity)}</span>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('cart.total')}</span>
                <span className="font-heading text-xl font-bold tabular-nums">
                  {formatMoney(subtotal)}
                </span>
              </div>
              <Button
                className="mt-4 w-full"
                size="lg"
                disabled={placing || !phoneVerified}
                onClick={placeOrder}
              >
                {placing ? t('checkout.placing') : t('checkout.place')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function OptionCard({
  active,
  onClick,
  icon,
  title,
  hint
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  hint: string
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
        active ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:bg-accent'
      )}
    >
      <span className={cn('mt-0.5', active ? 'text-primary' : 'text-muted-foreground')}>{icon}</span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      </span>
    </button>
  )
}
