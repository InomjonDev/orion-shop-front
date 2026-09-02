'use client'

import { Phone, MapPin } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { shopEnv } from '@/lib/config'
import { Logo } from '@/components/Logo'

export function SiteFooter(): React.ReactElement {
  const { t } = useI18n()
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Logo className="size-8" />
          <div>
            <div className="font-heading text-sm font-semibold">{shopEnv.name}</div>
            <div className="text-xs text-muted-foreground">{t('nav.tagline')}</div>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          {shopEnv.phone && (
            <span className="flex items-center gap-2">
              <Phone className="size-4" /> {shopEnv.phone}
            </span>
          )}
          {shopEnv.address && (
            <span className="flex items-center gap-2">
              <MapPin className="size-4" /> {shopEnv.address}
            </span>
          )}
        </div>
      </div>
      <div className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {shopEnv.name} · {t('footer.builtWith')}
      </div>
    </footer>
  )
}
