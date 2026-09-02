'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ImageOff, Minus, Plus, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import type { CatalogProduct } from '@/lib/types'
import { getBackend } from '@/lib/backend'
import { useCart } from '@/lib/cart'
import { useI18n } from '@/lib/i18n'
import { formatMoney } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductPage(): React.ReactElement {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { t } = useI18n()
  const { add } = useCart()
  const [product, setProduct] = useState<CatalogProduct | null | undefined>(undefined)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    let active = true
    getBackend()
      .then((b) => b.getProduct(id))
      .then((p) => active && setProduct(p))
    return () => {
      active = false
    }
  }, [id])

  if (product === undefined) {
    return (
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (product === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-heading text-xl font-semibold">{t('product.notFound')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('product.notFoundHint')}</p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/">
            <ArrowLeft className="size-4" />
            {t('product.back')}
          </Link>
        </Button>
      </div>
    )
  }

  const img = product.images[0] ?? null
  const low = product.inStock && product.stockQty != null && product.stockQty <= 5

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t('product.back')}
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
          {img ? (
            <Image src={img} alt={product.name} fill sizes="(max-width:768px) 100vw, 480px" className="object-contain p-6" />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground/40">
              <ImageOff className="size-12" />
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.brand && <Badge variant="outline">{product.brand}</Badge>}
            {product.category && <Badge variant="secondary">{product.category}</Badge>}
            {product.inStock ? (
              low ? (
                <Badge variant="amber">{t('stock.left', { n: product.stockQty! })}</Badge>
              ) : (
                <Badge variant="success">{t('stock.in')}</Badge>
              )
            ) : (
              <Badge variant="destructive">{t('stock.out')}</Badge>
            )}
          </div>

          <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {product.name}
          </h1>
          <div className="mt-3 font-heading text-3xl font-bold tabular-nums text-primary">
            {formatMoney(product.price)}
          </div>

          {product.description && (
            <div className="mt-5">
              <h2 className="text-sm font-semibold">{t('product.description')}</h2>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <button
                className="grid size-10 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={!product.inStock}
                aria-label="decrease"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center tabular-nums">{qty}</span>
              <button
                className="grid size-10 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                onClick={() => setQty((q) => q + 1)}
                disabled={!product.inStock}
                aria-label="increase"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              disabled={!product.inStock}
              onClick={() => {
                add(product, qty)
                toast.success(t('product.added'), { description: product.name })
              }}
            >
              <ShoppingCart className="size-5" />
              {t('product.addToCart')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
