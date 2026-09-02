import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import './globals.css'
import { Providers } from '@/components/Providers'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { shopEnv } from '@/lib/config'

export const metadata: Metadata = {
  title: `${shopEnv.name} — Security & CCTV shop`,
  description:
    'Buy CCTV cameras, NVRs, PoE switches and security equipment. Dahua, Hikvision, Sonoff, Moes and more.'
}

export const viewport: Viewport = {
  themeColor: '#0e7490',
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
}
