'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut, Package2, ShoppingCart, User } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import { shopEnv } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { LangSwitch } from '@/components/LangSwitch'
import { CartSheet } from '@/components/CartSheet'

export function SiteHeader(): React.ReactElement {
  const { t } = useI18n()
  const { count } = useCart()
  const { user, signOut } = useAuth()
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <div className="leading-tight">
            <div className="font-heading text-base font-semibold tracking-tight">{shopEnv.name}</div>
            <div className="hidden text-[11px] text-muted-foreground sm:block">{t('nav.tagline')}</div>
          </div>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <Package2 className="size-4" />
              {t('nav.catalog')}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/orders">{t('nav.orders')}</Link>
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <LangSwitch />

          {user ? (
            <Button variant="ghost" size="icon-sm" title={t('nav.logout')} onClick={() => signOut()}>
              <LogOut className="size-4" />
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <User className="size-4" />
                <span className="hidden sm:inline">{t('nav.login')}</span>
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            size="icon-sm"
            className="relative"
            onClick={() => setCartOpen(true)}
            aria-label={t('nav.cart')}
          >
            <ShoppingCart className="size-4" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground tabular-nums">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  )
}
