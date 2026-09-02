'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ImageOff, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { CatalogProduct } from '@/lib/types'
import { useCart } from '@/lib/cart'
import { useI18n } from '@/lib/i18n'
import { formatMoney } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function ProductCard({ product }: { product: CatalogProduct }): React.ReactElement {
  const { t } = useI18n()
  const { add } = useCart()
  const img = product.images[0] ?? null
  const low = product.inStock && product.stockQty != null && product.stockQty <= 5

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-muted">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground/40">
            <ImageOff className="size-8" />
          </div>
        )}
        {!product.inStock && (
          <div className="absolute left-2 top-2">
            <Badge variant="secondary">{t('stock.out')}</Badge>
          </div>
        )}
        {low && (
          <div className="absolute left-2 top-2">
            <Badge variant="amber">{t('stock.left', { n: product.stockQty! })}</Badge>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        {product.brand && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </span>
        )}
        <Link href={`/product/${product.id}`} className="mt-0.5 line-clamp-2 text-sm font-medium hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-heading text-lg font-semibold tabular-nums">
            {formatMoney(product.price)}
          </span>
          <Button
            size="icon-sm"
            disabled={!product.inStock}
            onClick={() => {
              add(product)
              toast.success(t('product.added'), { description: product.name })
            }}
            aria-label={t('product.addToCart')}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
