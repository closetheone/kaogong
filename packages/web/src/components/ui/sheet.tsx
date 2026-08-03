import * as React from 'react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: 'left' | 'right' | 'top' | 'bottom'
  children: React.ReactNode
  className?: string
}

export function Sheet({ open, onOpenChange, side = 'left', children, className }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const sideClass = {
    left: 'inset-y-0 left-0 w-72 border-r animate-in slide-in-from-left',
    right: 'inset-y-0 right-0 w-72 border-l animate-in slide-in-from-right',
    top: 'inset-x-0 top-0 border-b',
    bottom: 'inset-x-0 bottom-0 border-t',
  }[side]

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div className={cn('fixed bg-background shadow-lg z-50', sideClass, className)}>
        {children}
      </div>
    </div>
  )
}
