import { NextRequest, NextResponse } from 'next/server'
import { verifyTelegramAuth, type TelegramAuthData } from '@/lib/telegram'

// firebase-admin needs the Node runtime (not Edge).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Cache the admin Auth instance across warm invocations.
let adminAuthPromise: Promise<import('firebase-admin/auth').Auth> | null = null
async function getAdminAuth(): Promise<import('firebase-admin/auth').Auth> {
  if (!adminAuthPromise) {
    adminAuthPromise = (async () => {
      const { initializeApp, getApps, cert } = await import('firebase-admin/app')
      const { getAuth } = await import('firebase-admin/auth')
      const sa = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT || '{}')
      const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(sa) })
      return getAuth(app)
    })()
  }
  return adminAuthPromise
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken || !process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    return NextResponse.json({ error: 'Telegram login is not configured on the server.' }, { status: 503 })
  }

  let data: TelegramAuthData
  try {
    data = (await req.json()) as TelegramAuthData
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
  }

  if (!data?.id || !data?.hash || !verifyTelegramAuth(data, botToken)) {
    return NextResponse.json({ error: 'Invalid Telegram signature.' }, { status: 401 })
  }

  try {
    const auth = await getAdminAuth()
    const uid = 'tg_' + data.id
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ')
    const token = await auth.createCustomToken(uid, {
      provider: 'telegram',
      tgUsername: data.username || '',
      name
    })
    return NextResponse.json({ token, name })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
