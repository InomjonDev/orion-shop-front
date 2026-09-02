import { cn } from '@/lib/utils'

/** The OrionStorage lens mark — same identity as the desktop app icon. */
export function Logo({ className }: { className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 48 48" className={cn('size-9', className)} aria-hidden="true">
      <defs>
        <linearGradient id="orion-lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22c5e0" />
          <stop offset="1" stopColor="#0b6880" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="48" height="48" rx="11" fill="url(#orion-lens)" />
      <circle cx="24" cy="24" r="10.5" fill="none" stroke="#fff" strokeWidth="4.4" />
      <circle cx="24" cy="24" r="3.1" fill="#fff" />
    </svg>
  )
}
