import { NextRequest, NextResponse } from 'next/server'
import { verifyTelegramAuth, type TelegramAuthData } from '@/lib/telegram'
import { getAdminAuth, adminConfigured } from '@/lib/adminApp'
import { checkRateLimit } from '@/lib/rateLimit'

// firebase-admin needs the Node runtime (not Edge).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await checkRateLimit(req, 'telegram-auth', { limit: 20, windowMs: 60_000 })
  if (limited) return limited

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken || !adminConfigured()) {
    return NextResponse.json(
      { error: 'Telegram login is not configured on the server.' },
      { status: 503 }
    )
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
