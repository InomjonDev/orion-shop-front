import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  // This app is its own deploy root (parent repo has a separate lockfile).
  outputFileTracingRoot: path.resolve(),
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
