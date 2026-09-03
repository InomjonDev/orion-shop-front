'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { TelegramAuthData } from '@/lib/types'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { TelegramLoginButton } from '@/components/TelegramLogin'

export function AuthPanel({ onSignedIn }: { onSignedIn?: () => void }): React.ReactElement {
  const { t } = useI18n()
  const { loginWithTelegram, demoSignIn, telegramEnabled } = useAuth()
  const [busy, setBusy] = useState(false)

  async function handleTelegram(data: TelegramAuthData): Promise<void> {
    setBusy(true)
    try {
      await loginWithTelegram(data)
      onSignedIn?.()
    } catch (e) {
      toast.error((e as Error).message || t('auth.failed'))
    } finally {
      setBusy(false)
    }
  }

  async function handleDemo(): Promise<void> {
    setBusy(true)
    try {
      await demoSignIn()
      onSignedIn?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {telegramEnabled ? (
        <>
          <div className={busy ? 'pointer-events-none opacity-60' : ''}>
            <TelegramLoginButton onAuth={handleTelegram} />
          </div>
          <p className="text-center text-xs text-muted-foreground">{t('auth.telegramHint')}</p>
        </>
      ) : (
        <>
          <Button className="w-full" size="lg" disabled={busy} onClick={handleDemo}>
            {t('auth.demoContinue')}
          </Button>
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            {t('auth.demoNote')}
          </p>
        </>
      )}
    </div>
  )
}
