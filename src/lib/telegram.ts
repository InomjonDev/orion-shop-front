import crypto from 'node:crypto'
import type { TelegramAuthData } from './types'

export type { TelegramAuthData }

/**
 * Verify that the payload really came from Telegram and wasn't tampered with,
 * per https://core.telegram.org/widgets/login#checking-authorization.
 * The bot token is the shared secret — never exposed to the browser.
 */
export function verifyTelegramAuth(data: TelegramAuthData, botToken: string): boolean {
  const { hash, ...fields } = data
  const record = fields as Record<string, unknown>
  const dataCheckString = Object.keys(record)
    .filter((k) => record[k] !== undefined && record[k] !== null && record[k] !== '')
    .sort()
    .map((k) => `${k}=${record[k]}`)
    .join('\n')

  const secretKey = crypto.createHash('sha256').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  if (hmac !== hash) return false

  // Reject stale logins (older than 24h).
  const ageSeconds = Math.floor(Date.now() / 1000) - Number(data.auth_date)
  return ageSeconds >= 0 && ageSeconds < 86400
}
