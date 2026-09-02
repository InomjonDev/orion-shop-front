'use client'

import React from 'react'
import { I18nProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth'
import { CartProvider } from '@/lib/cart'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <I18nProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster richColors closeButton />
        </CartProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
