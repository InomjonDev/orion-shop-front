'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, ShieldCheck } from 'lucide-react'
import type { CatalogProduct } from '@/lib/types'
import { getBackend } from '@/lib/backend'
import { useI18n } from '@/lib/i18n'
import { shopEnv } from '@/lib/config'
import { ProductCard } from '@/components/ProductCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

type Sort = 'new' | 'low' | 'high'

export default function CatalogPage(): React.ReactElement {
  const { t } = useI18n()
  const [products, setProducts] = useState<CatalogProduct[] | null>(null)
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('all')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState<Sort>('new')

  useEffect(() => {
    let active = true
    getBackend()
      .then((b) => b.listCatalog())
      .then((list) => active && setProducts(list))
    return () => {
      active = false
    }
  }, [])

  const brands = useMemo(
    () => [...new Set((products ?? []).map((p) => p.brand).filter(Boolean) as string[])].sort(),
    [products]
  )
  const categories = useMemo(
    () => [...new Set((products ?? []).map((p) => p.category).filter(Boolean) as string[])].sort(),
    [products]
  )

  const filtered = useMemo(() => {
    let list = products ?? []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((p) => (p.name + ' ' + (p.brand ?? '')).toLowerCase().includes(q))
    if (brand !== 'all') list = list.filter((p) => p.brand === brand)
    if (category !== 'all') list = list.filter((p) => p.category === category)
    list = [...list].sort((a, b) => {
      if (sort === 'low') return a.price - b.price
      if (sort === 'high') return b.price - a.price
      return b.updatedAt - a.updatedAt
    })
    return list
  }, [products, search, brand, category, sort])

  const hasFilters = search || brand !== 'all' || category !== 'all'

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-10">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <ShieldCheck className="size-4" />
          {t('nav.tagline')}
        </div>
        <h1 className="mt-3 max-w-2xl font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {shopEnv.name}
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Dahua · Hikvision · Sonoff · Moes · Wiking — {t('common.currencyNote')}.
        </p>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 -mx-4 mt-6 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t('catalog.searchPh')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="w-[46%] sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('catalog.allBrands')}</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[46%] sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('catalog.allCategories')}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="hidden w-40 sm:flex">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="new">{t('catalog.sortNew')}</SelectItem>
                <SelectItem value="low">{t('catalog.sortLow')}</SelectItem>
                <SelectItem value="high">{t('catalog.sortHigh')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-5">
        {products === null ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border">
                <Skeleton className="aspect-square rounded-none" />
                <div className="space-y-2 p-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Search className="size-6" />
            </div>
            <p className="font-medium">{t('catalog.none')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('catalog.noneHint')}</p>
            {hasFilters && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch('')
                  setBrand('all')
                  setCategory('all')
                }}
              >
                {t('catalog.clear')}
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              {filtered.length === 1
                ? t('catalog.resultsOne')
                : t('catalog.results', { n: filtered.length })}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
