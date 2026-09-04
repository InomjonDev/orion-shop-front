'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { BadgeCheck, Loader2, Send } from 'lucide-react'
import { getBackend } from '@/lib/backend'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { isTelegramConfigured, telegramBotUsername } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/Logo'

function ProfileInner(): React.ReactElement {
  const { t } = useI18n()
  const { user, ready } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/'

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [testPhone, setTestPhone] = useState('+998 ')
  const [waiting, setWaiting] = useState(false)
  const [saving, setSaving] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadProfile = useCallback(async (uid: string) => {
    const p = await (await getBackend()).getCustomerProfile(uid)
    if (p?.name) setName(p.name)
    if (p?.address) setAddress(p.address)
    setPhone(p?.phone ?? '')
    setPhoneVerified(Boolean(p?.phoneVerified))
    return p
  }, [])

  useEffect(() => {
    if (ready && !user) {
      router.replace('/login?next=' + encodeURIComponent('/profile'))
      return
    }
    if (!user) return
    setName((prev) => prev || user.name || '')
    loadProfile(user.uid)
  }, [user, ready, router, loadProfile])

  // Stop polling on unmount.
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  // Open the bot and poll until the verified phone arrives from the server.
  function verifyViaTelegram(): void {
    if (!telegramBotUsername) return
    window.open(`https://t.me/${telegramBotUsername}?start=verify`, '_blank', 'noopener')
    setWaiting(true)
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      if (!user) return
      const p = await loadProfile(user.uid)
      if (p?.phoneVerified) {
        if (pollRef.current) clearInterval(pollRef.current)
        setWaiting(false)
        toast.success(t('profile.verifiedToast'))
      }
    }, 3000)
  }

  // Local/offline testing only: mark a typed number as verified.
  async function verifyForTest(): Promise<void> {
    if (!user) return
    const norm = testPhone.replace(/\s+/g, '')
    if (!/^\+?\d{9,15}$/.test(norm)) {
      toast.error(t('checkout.phoneReq'))
      return
    }
    const b = await getBackend()
    await b.setVerifiedPhoneForTest?.(user.uid, norm)
    await loadProfile(user.uid)
  }

  async function save(): Promise<void> {
    if (!user) return
    if (!name.trim()) {
      toast.error(t('checkout.nameReq'))
      return
    }
    if (!phoneVerified) {
      toast.error(t('profile.verifyRequired'))
      return
    }
    setSaving(true)
    try {
      const b = await getBackend()
      await b.saveCustomerProfile({
        uid: user.uid,
        name: name.trim(),
        address: address.trim() || null
      })
      toast.success(t('profile.saved'))
      router.replace(next)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <Logo className="size-12" />
      <Card className="mt-6 w-full">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-xl">{t('profile.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('profile.subtitle')}</p>
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

          {/* Phone — verified through Telegram, never typed on the site. */}
          <div className="space-y-1.5">
            <Label>{t('checkout.phone')}</Label>
            {phoneVerified ? (
              <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm">
                <BadgeCheck className="size-4 shrink-0 text-primary" />
                <span className="font-medium tabular-nums">{phone}</span>
                <span className="ml-auto text-xs text-primary">{t('profile.phoneVerified')}</span>
              </div>
            ) : isTelegramConfigured ? (
              <div className="space-y-2">
                <Button type="button" variant="outline" className="w-full" onClick={verifyViaTelegram}>
                  {waiting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {waiting ? t('profile.waiting') : t('profile.verifyTelegram')}
                </Button>
                <p className="text-xs text-muted-foreground">{t('profile.verifyHint')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    inputMode="tel"
                    placeholder="+998 90 123 45 67"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                  <Button type="button" variant="outline" className="shrink-0" onClick={verifyForTest}>
                    {t('profile.verifyTest')}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t('profile.verifyTestHint')}</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">{t('profile.location')}</Label>
            <Input
              id="address"
              placeholder={t('checkout.addressPh')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <Button className="w-full" size="lg" disabled={saving || !phoneVerified} onClick={save}>
            {t('profile.save')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfilePage(): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <ProfileInner />
    </Suspense>
  )
}
