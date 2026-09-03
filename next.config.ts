import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  // This app is its own deploy root (parent repo has a separate lockfile).
  outputFileTracingRoot: path.resolve(),
  // firebase-admin (used by the Telegram-auth API route) must not be bundled.
  serverExternalPackages: ['firebase-admin'],
  images: {
    // Product images come from Cloudinary (already optimized), so skip Next's
    // optimizer — keeps us off Vercel's image-optimization quota (stays free).
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'placehold.co' }
    ]
  }
}

export default nextConfig
