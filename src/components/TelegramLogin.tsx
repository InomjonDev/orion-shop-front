'use client'

import { useEffect, useRef } from 'react'
import type { TelegramAuthData } from '@/lib/types'
import { telegramBotUsername } from '@/lib/config'

/**
 * Renders Telegram's official "Log in with Telegram" widget. Telegram calls a
 * global callback with the signed auth payload; we forward it to `onAuth`.
 * The widget only works on the domain configured for the bot via @BotFather.
 */
export function TelegramLoginButton({
  onAuth
}: {
  onAuth: (data: TelegramAuthData) => void
}): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const cbRef = useRef(onAuth)
  cbRef.current = onAuth

  useEffect(() => {
    const el = ref.current
    if (!telegramBotUsername || !el) return
    ;(window as unknown as { onTelegramAuth: (u: TelegramAuthData) => void }).onTelegramAuth = (u) =>
      cbRef.current(u)
    el.innerHTML = ''
    const s = document.createElement('script')
    s.src = 'https://telegram.org/js/telegram-widget.js?22'
    s.async = true
    s.setAttribute('data-telegram-login', telegramBotUsername)
    s.setAttribute('data-size', 'large')
    s.setAttribute('data-radius', '8')
    s.setAttribute('data-onauth', 'onTelegramAuth(user)')
    s.setAttribute('data-request-access', 'write')
    el.appendChild(s)
    return () => {
      el.innerHTML = ''
    }
  }, [])

  return <div ref={ref} className="flex min-h-[46px] justify-center" />
}
