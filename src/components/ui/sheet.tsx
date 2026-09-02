'use client'

import * as React from 'react'
import { Dialog as SheetPrimitive } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'right' | 'left'
}): React.ReactElement {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <SheetPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-xl transition-transform',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          side === 'right' &&
            'right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          side === 'left' &&
            'left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring/40">
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('border-b border-border p-5', className)} {...props} />
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>): React.ReactElement {
  return (
    <SheetPrimitive.Title
      className={cn('font-heading text-lg font-semibold', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>): React.ReactElement {
  return <SheetPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription }
