import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb, adminConfigured } from '@/lib/adminApp'
import { checkRateLimit } from '@/lib/rateLimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// --- Telegram helpers -------------------------------------------------------
interface TgContact {
  phone_number: string
  user_id?: number
}
interface TgUser {
  id: number
  first_name?: string
  language_code?: string
}
interface TgMessage {
  chat: { id: number }
  from?: TgUser
  text?: string
  contact?: TgContact
}
interface TgUpdate {
  message?: TgMessage
}

async function tg(method: string, body: unknown): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    })
  } catch {
    /* Telegram will retry; nothing to surface to a browser here. */
  }
}

// Prompt shown when the user opens the bot: a one-tap "share my number" button.
// Telegram itself vouches for the number, so it can't be spoofed.
function sharePrompt(chatId: number): Promise<void> {
  return tg('sendMessage', {
    chat_id: chatId,
    text:
      'Raqamingizni tasdiqlash uchun quyidagi tugmani bosing 👇\n' +
      'Нажмите кнопку ниже, чтобы подтвердить номер 👇\n' +
      'Tap the button below to verify your phone 👇',
    reply_markup: {
      keyboard: [[{ text: '📱 Share my phone number', request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  })
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '')
  return digits ? '+' + digits : raw
}

/**
 * One-time (idempotent) webhook registration. Hitting
 * `/api/telegram-webhook?secret=<TELEGRAM_WEBHOOK_SECRET>` tells Telegram to send
 * updates here with that secret. The bot token never leaves the server. Guarded
 * by the same secret so only we can trigger it.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  const token = process.env.TELEGRAM_BOT_TOKEN
  const url = new URL(req.url)
  if (!secret || url.searchParams.get('secret') !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Bot token not configured.' }, { status: 503 })
  }
  const hook = `https://${req.headers.get('host')}/api/telegram-webhook`
  const setRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: hook,
      secret_token: secret,
      allowed_updates: ['message'],
      drop_pending_updates: true
    })
  })
  const set = await setRes.json()
  const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`)
  const info = (await infoRes.json()) as { result?: Record<string, unknown> }
  return NextResponse.json({
    registered: set,
    webhook: {
      url: info.result?.url,
      pending: info.result?.pending_update_count,
      lastError: info.result?.last_error_message ?? null
    }
  })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Telegram sends this secret with every call (set when we register the webhook).
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!secret || req.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const limited = await checkRateLimit(req, 'telegram-webhook', { limit: 60, windowMs: 60_000 })
  if (limited) return limited

  let update: TgUpdate
  try {
    update = (await req.json()) as TgUpdate
  } catch {
    return NextResponse.json({ ok: true }) // ack malformed updates so Telegram stops retrying
  }

  const msg = update.message
  if (!msg?.from) return NextResponse.json({ ok: true })

  // The customer tapped "Share my phone number".
  if (msg.contact) {
    // Only accept a contact the sender shared about themselves.
    if (msg.contact.user_id && msg.contact.user_id !== msg.from.id) {
      await tg('sendMessage', {
        chat_id: msg.chat.id,
        text: 'Iltimos, faqat oʻz raqamingizni ulashing. / Please share your own number.'
      })
      return NextResponse.json({ ok: true })
    }

    const phone = normalizePhone(msg.contact.phone_number)
    if (adminConfigured()) {
      try {
        const db = await getAdminDb()
        await db.collection('customers').doc('tg_' + msg.from.id).set(
          {
            phone,
            phoneVerified: true,
            phoneVerifiedAt: Date.now(),
            tgId: msg.from.id,
            updatedAt: Date.now()
          },
          { merge: true }
        )
      } catch {
        await tg('sendMessage', {
          chat_id: msg.chat.id,
          text: 'Xatolik yuz berdi, birozdan soʻng qayta urinib koʻring. / Something went wrong, please try again.'
        })
        return NextResponse.json({ ok: true })
      }
    }

    await tg('sendMessage', {
      chat_id: msg.chat.id,
      text:
        `✅ Raqamingiz tasdiqlandi: ${phone}\nDoʻkonga qaytib, buyurtmani davom ettiring.\n\n` +
        `✅ Ваш номер подтверждён: ${phone}\nВернитесь в магазин, чтобы продолжить.\n\n` +
        `✅ Your number is verified: ${phone}\nReturn to the shop to continue.`,
      reply_markup: { remove_keyboard: true }
    })
    return NextResponse.json({ ok: true })
  }

  // Any text (typically "/start" from the deep link) → show the share button.
  await sharePrompt(msg.chat.id)
  return NextResponse.json({ ok: true })
}
