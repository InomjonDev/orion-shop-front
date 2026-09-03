'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { getBackend } from '@/lib/backend'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
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
  const [phone, setPhone] = useState('+998 ')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (ready && !user) {
      router.replace('/login?next=' + encodeURIComponent('/profile'))
      return
    }
    if (!user) return
    setName((prev) => prev || user.name || '')
    getBackend()
      .then((b) => b.getCustomerProfile(user.uid))
      .then((p) => {
        if (p?.name) setName(p.name)
        if (p?.phone) setPhone(p.phone)
        if (p?.address) setAddress(p.address)
      })
  }, [user, ready, router])

  async function save(): Promise<void> {
    if (!user) return
    if (!name.trim()) {
      toast.error(t('checkout.nameReq'))
      return
    }
    const normPhone = phone.replace(/\s+/g, '')
    if (!/^\+?\d{9,15}$/.test(normPhone)) {
      toast.error(t('checkout.phoneReq'))
      return
    }
    setSaving(true)
    try {
      const b = await getBackend()
      await b.saveCustomerProfile({
        uid: user.uid,
        phone: normPhone,
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
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t('checkout.phone')}</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
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
          <Button className="w-full" size="lg" disabled={saving} onClick={save}>
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
