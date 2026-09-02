'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { isFirebaseConfigured } from './config'

export interface ShopUser {
  uid: string
  phone: string
}

interface AuthCtx {
  user: ShopUser | null
  ready: boolean
  isDemo: boolean
  /** Begin phone verification. In Firebase mode this triggers an SMS. */
  sendCode: (phone: string) => Promise<void>
  /** Complete verification with the 6-digit code. */
  verifyCode: (code: string) => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

const USER_KEY = 'orion.shop.user'
const RECAPTCHA_ID = 'recaptcha-container'

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<ShopUser | null>(null)
  const [ready, setReady] = useState(false)

  // Firebase handles (typed loosely to avoid importing firebase in demo mode).
  const confirmationRef = useRef<{ confirm: (code: string) => Promise<{ user: { uid: string; phoneNumber: string | null } }> } | null>(null)
  const recaptchaRef = useRef<unknown>(null)
  const pendingPhoneRef = useRef<string>('')

  // Restore session.
  useEffect(() => {
    let unsub: undefined | (() => void)
    ;(async () => {
      if (isFirebaseConfigured) {
        const { getFirebaseAuth } = await import('./firebase')
        const { onAuthStateChanged } = await import('firebase/auth')
        unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
          setUser(u ? { uid: u.uid, phone: u.phoneNumber ?? '' } : null)
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

  const sendCode = useCallback(async (phone: string) => {
    const clean = phone.trim()
    pendingPhoneRef.current = clean
    if (!isFirebaseConfigured) {
      // Demo mode: no SMS, any 6 digits will verify.
      return
    }
    const { getFirebaseAuth } = await import('./firebase')
    const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth')
    const auth = getFirebaseAuth()
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, RECAPTCHA_ID, { size: 'invisible' })
    }
    confirmationRef.current = (await signInWithPhoneNumber(
      auth,
      clean,
      recaptchaRef.current as import('firebase/auth').RecaptchaVerifier
    )) as unknown as typeof confirmationRef.current
  }, [])

  const verifyCode = useCallback(async (code: string) => {
    if (!isFirebaseConfigured) {
      const phone = pendingPhoneRef.current || '+000'
      const demoUser: ShopUser = {
        uid: 'demo-' + phone.replace(/\D/g, ''),
        phone
      }
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(demoUser))
      } catch {
        /* ignore */
      }
      setUser(demoUser)
      return
    }
    if (!confirmationRef.current) throw new Error('No verification in progress.')
    const cred = await confirmationRef.current.confirm(code)
    setUser({ uid: cred.user.uid, phone: cred.user.phoneNumber ?? pendingPhoneRef.current })
  }, [])

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured) {
      const { getFirebaseAuth } = await import('./firebase')
      const { signOut: fbSignOut } = await import('firebase/auth')
      await fbSignOut(getFirebaseAuth())
    } else {
      try {
        localStorage.removeItem(USER_KEY)
      } catch {
        /* ignore */
      }
      setUser(null)
    }
  }, [])

  return (
    <Ctx.Provider value={{ user, ready, isDemo: !isFirebaseConfigured, sendCode, verifyCode, signOut }}>
      {children}
      {/* Invisible reCAPTCHA mount point for Firebase Phone Auth. */}
      <div id={RECAPTCHA_ID} />
    </Ctx.Provider>
  )
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
