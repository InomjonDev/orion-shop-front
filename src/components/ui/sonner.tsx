'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { CircleCheck, Info, TriangleAlert, OctagonX } from 'lucide-react'

export function Toaster(props: ToasterProps): React.ReactElement {
  return (
    <Sonner
      position="bottom-center"
      icons={{
        success: <CircleCheck className="size-4" />,
        info: <Info className="size-4" />,
        warning: <TriangleAlert className="size-4" />,
        error: <OctagonX className="size-4" />
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)'
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
