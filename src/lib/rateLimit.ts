import { NextResponse, type NextRequest } from 'next/server'

/**
 * Small rate limiter for the API routes, so no single client can hammer them.
 *
 * By default it uses an in-process sliding window — free, zero-setup, and enough
 * to blunt bursts against a warm serverless instance. If Upstash Redis env vars
 * are present (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN) it switches to
 * a shared Redis counter, which holds across all instances. Nothing else changes.
 */

export interface RateResult {
  ok: boolean
  retryAfter: number // seconds until the window resets
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN
const useUpstash = Boolean(upstashUrl && upstashToken)

// --- In-memory fallback -----------------------------------------------------
// Map of key -> sorted hit timestamps (ms). Pruned on read; capped in size.
const hits = new Map<string, number[]>()
const MAX_KEYS = 5000

function memoryLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now()
  const since = now - windowMs
  const arr = (hits.get(key) ?? []).filter((t) => t > since)
  arr.push(now)
  hits.set(key, arr)

  // Opportunistically bound memory under load.
  if (hits.size > MAX_KEYS) {
    for (const [k, v] of hits) {
      if (v[v.length - 1] <= since) hits.delete(k)
      if (hits.size <= MAX_KEYS) break
    }
  }

  if (arr.length > limit) {
    const retryAfter = Math.ceil((arr[0] + windowMs - now) / 1000)
    return { ok: false, retryAfter: Math.max(1, retryAfter) }
  }
  return { ok: true, retryAfter: 0 }
}

async function upstashLimit(key: string, limit: number, windowMs: number): Promise<RateResult> {
  try {
    const res = await fetch(`${upstashUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ['INCR', key],
        ['PEXPIRE', key, String(windowMs), 'NX']
      ]),
      cache: 'no-store'
    })
    if (!res.ok) return { ok: true, retryAfter: 0 } // fail open, never block real users on infra hiccups
    const out = (await res.json()) as Array<{ result: number }>
    const count = Number(out?.[0]?.result ?? 0)
    if (count > limit) return { ok: false, retryAfter: Math.ceil(windowMs / 1000) }
    return { ok: true, retryAfter: 0 }
  } catch {
    return { ok: true, retryAfter: 0 }
  }
}

/** The caller's best-effort IP (Vercel sets x-forwarded-for). */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

/**
 * Enforce a limit for `name` keyed by the caller's IP. Returns a 429
 * NextResponse when the caller is over the limit, otherwise null (proceed).
 */
export async function checkRateLimit(
  req: NextRequest,
  name: string,
  opts: { limit: number; windowMs: number }
): Promise<NextResponse | null> {
  const key = `rl:${name}:${clientIp(req)}`
  const r = useUpstash
    ? await upstashLimit(key, opts.limit, opts.windowMs)
    : memoryLimit(key, opts.limit, opts.windowMs)
  if (r.ok) return null
  return NextResponse.json(
    { error: 'Too many requests. Please slow down.' },
    { status: 429, headers: { 'Retry-After': String(r.retryAfter) } }
  )
}
