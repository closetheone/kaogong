import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title?: string
  className?: string
  paddingBottom?: boolean
}

export default function PageContainer({ children, title, className = '', paddingBottom = true }: Props) {
  return (
    <div className={`min-h-screen bg-gray-50 max-w-md mx-auto ${paddingBottom ? 'pb-20' : ''} ${className}`}>
      {title && (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 px-4 h-12 flex items-center">
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        </header>
      )}
      {children}
    </div>
  )
}
