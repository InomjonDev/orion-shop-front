'use client'

import { Suspense, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBackend } from '@/lib/backend'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { AuthPanel } from '@/components/AuthPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/Logo'

function LoginInner(): React.ReactElement {
  const { t } = useI18n()
  const { user } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/'

  // After sign-in, first-time users (no name/phone yet) must complete their profile.
  const routeAfterAuth = useCallback(async () => {
    if (!user) return
    const profile = await (await getBackend()).getCustomerProfile(user.uid)
    const complete = Boolean(profile?.name && profile?.phoneVerified)
    router.replace(complete ? next : '/profile?next=' + encodeURIComponent(next))
  }, [user, next, router])

  useEffect(() => {
    if (user) routeAfterAuth()
  }, [user, routeAfterAuth])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-14">
      <Logo className="size-12" />
      <Card className="mt-6 w-full">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-xl">{t('auth.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('auth.subtitle')}</p>
        </CardHeader>
        <CardContent>
          {/* Routing after sign-in is handled by the effect (profile-completeness gate). */}
          <AuthPanel />
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage(): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
