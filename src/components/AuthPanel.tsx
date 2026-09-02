'use client'

import { useState } from 'react'
import { ArrowLeft, MessageSquare, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AuthPanel({ onSignedIn }: { onSignedIn?: () => void }): React.ReactElement {
  const { t } = useI18n()
  const { sendCode, verifyCode, isDemo } = useAuth()
  const [phase, setPhase] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('+998 ')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const normalizedPhone = phone.replace(/\s+/g, '')

  async function onSend(): Promise<void> {
    if (!/^\+\d{9,15}$/.test(normalizedPhone)) {
      toast.error(t('auth.invalidPhone'))
      return
    }
    setBusy(true)
    try {
      await sendCode(normalizedPhone)
      setPhase('code')
    } catch (e) {
      toast.error((e as Error).message || t('auth.failed'))
    } finally {
      setBusy(false)
    }
  }

  async function onVerify(): Promise<void> {
    if (!/^\d{6}$/.test(code.trim())) {
      toast.error(t('auth.invalidCode'))
      return
    }
    setBusy(true)
    try {
      await verifyCode(code.trim())
      onSignedIn?.()
    } catch {
      toast.error(t('auth.failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {phase === 'phone' ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t('auth.phone')}</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                className="pl-9"
                placeholder={t('auth.phonePh')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSend()}
              />
            </div>
          </div>
          <Button className="w-full" size="lg" disabled={busy} onClick={onSend}>
            {busy ? t('auth.sending') : t('auth.sendCode')}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {t('auth.codeSent', { phone: normalizedPhone })}
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="code">{t('auth.code')}</Label>
            <div className="relative">
              <MessageSquare className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="code"
                inputMode="numeric"
                autoFocus
                maxLength={6}
                className="pl-9 tracking-[0.4em]"
                placeholder={t('auth.codePh')}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && onVerify()}
              />
            </div>
          </div>
          <Button className="w-full" size="lg" disabled={busy} onClick={onVerify}>
            {busy ? t('auth.verifying') : t('auth.verify')}
          </Button>
          <button
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              setPhase('phone')
              setCode('')
            }}
          >
            <ArrowLeft className="size-3.5" />
            {t('auth.change')}
          </button>
        </>
      )}

      {isDemo && (
        <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          {t('auth.demoNote')}
        </p>
      )}
    </div>
  )
}
