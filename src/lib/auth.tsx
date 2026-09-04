'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { TelegramAuthData } from './types'
import { isFirebaseConfigured, isTelegramConfigured } from './config'

export interface ShopUser {
  uid: string
  phone: string
  name: string
}

interface AuthCtx {
  user: ShopUser | null
  ready: boolean
  telegramEnabled: boolean
  /** Sign in from a verified Telegram Login Widget payload. */
  loginWithTelegram: (data: TelegramAuthData) => Promise<void>
  /** Local-only fallback used when Telegram isn't configured (dev/preview). */
  demoSignIn: (name?: string) => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)
const USER_KEY = 'orion.shop.user'

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<ShopUser | null>(null)
  const [ready, setReady] = useState(false)

  // Restore session.
  useEffect(() => {
    let unsub: undefined | (() => void)
    ;(async () => {
      if (isFirebaseConfigured) {
        const { getFirebaseAuth } = await import('./firebase')
        const { onAuthStateChanged } = await import('firebase/auth')
        unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
          if (u) {
            setUser({ uid: u.uid, phone: u.phoneNumber ?? '', name: u.displayName ?? '' })
          } else {
            // No Firebase session. In local/guest mode a demo user may be stored;
            // restore it so the guest login survives a page reload. (In production
            // nothing writes this key, so signed-out users stay signed out.)
            try {
              const raw = localStorage.getItem(USER_KEY)
              setUser(raw ? (JSON.parse(raw) as ShopUser) : null)
            } catch {
              setUser(null)
            }
          }
          setReady(true)
        })
      } else {
        try {
          const raw = localStorage.getItem(USER_KEY)
          if (raw) setUser(JSON.parse(raw) as ShopUser)
        } catch {
          /* ignore */
        }
        setReady(true)
      }
    })()
    return () => unsub?.()
  }, [])

  const loginWithTelegram = useCallback(async (data: TelegramAuthData) => {
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ')
    if (!isFirebaseConfigured) {
      const demo: ShopUser = { uid: 'tg_' + data.id, phone: '', name }
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(demo))
      } catch {
        /* ignore */
      }
      setUser(demo)
      return
    }
    // Exchange the signed Telegram payload for a Firebase custom token.
    const res = await fetch('/api/telegram-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = (await res.json()) as { token?: string; name?: string; error?: string }
    if (!res.ok || !json.token) throw new Error(json.error || 'Telegram login failed.')

    const { getFirebaseAuth } = await import('./firebase')
    const { signInWithCustomToken, updateProfile } = await import('firebase/auth')
    const cred = await signInWithCustomToken(getFirebaseAuth(), json.token)
    const displayName = json.name || name
    if (displayName && !cred.user.displayName) {
      try {
        await updateProfile(cred.user, { displayName })
      } catch {
        /* non-fatal */
      }
    }
    setUser({ uid: cred.user.uid, phone: '', name: displayName })
  }, [])

  const demoSignIn = useCallback(async (name = 'Demo') => {
    const demo: ShopUser = { uid: 'demo_' + Date.now().toString(36), phone: '', name }
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(demo))
    } catch {
      /* ignore */
    }
    setUser(demo)
  }, [])

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured) {
      const { getFirebaseAuth } = await import('./firebase')
      const { signOut: fbSignOut } = await import('firebase/auth')
      try {
        await fbSignOut(getFirebaseAuth())
      } catch {
        /* ignore */
      }
    }
    try {
      localStorage.removeItem(USER_KEY)
    } catch {
      /* ignore */
    }
    setUser(null)
  }, [])

  return (
    <Ctx.Provider
      value={{
        user,
        ready,
        telegramEnabled: isTelegramConfigured,
        loginWithTelegram,
        demoSignIn,
        signOut
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
