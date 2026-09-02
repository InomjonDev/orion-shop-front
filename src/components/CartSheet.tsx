'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useI18n } from '@/lib/i18n'
import { formatMoney } from '@/lib/format'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

export function CartSheet({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}): React.ReactElement {
  const { t } = useI18n()
  const { lines, subtotal, count, setQty, remove } = useCart()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            {t('cart.title')}
            {count > 0 && <span className="text-muted-foreground">· {count}</span>}
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <ShoppingBag className="size-6" />
            </div>
            <p className="font-medium">{t('cart.empty')}</p>
            <p className="text-sm text-muted-foreground">{t('cart.emptyHint')}</p>
            <SheetClose asChild>
              <Button variant="outline" className="mt-2">
                {t('cart.keepShopping')}
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-3">
                {lines.map((l) => (
                  <li key={l.id} className="flex gap-3 rounded-lg border border-border p-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {l.image && (
                        <Image src={l.image} alt={l.name} fill sizes="64px" className="object-contain" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-sm font-medium">{l.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {t('cart.each', { price: formatMoney(l.price) })}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-md border border-border">
                          <button
                            className="grid size-7 place-items-center text-muted-foreground hover:text-foreground"
                            onClick={() => setQty(l.id, l.quantity - 1)}
                            aria-label="decrease"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">{l.quantity}</span>
                          <button
                            className="grid size-7 place-items-center text-muted-foreground hover:text-foreground"
                            onClick={() => setQty(l.id, l.quantity + 1)}
                            aria-label="increase"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          className="ml-auto grid size-7 place-items-center text-muted-foreground hover:text-destructive"
                          onClick={() => remove(l.id)}
                          aria-label={t('cart.remove')}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {formatMoney(l.price * l.quantity)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('cart.subtotal')}</span>
                <span className="text-lg font-semibold tabular-nums">{formatMoney(subtotal)}</span>
              </div>
              <Separator className="my-3" />
              <Link
                href="/checkout"
                onClick={() => onOpenChange(false)}
                className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
              >
                {t('cart.checkout')}
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
