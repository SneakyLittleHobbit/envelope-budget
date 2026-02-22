'use client'

import { ReactNode } from 'react'

interface AppHeaderProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
}

export function AppHeader({ left, center, right }: AppHeaderProps) {
  return (
    <header className="relative flex items-center justify-between bg-budget-header px-4 py-3 min-h-[56px] shrink-0 border-b border-budget-divider bg-header-botanical">
      <div className="relative z-10 flex items-center min-w-[60px]">{left}</div>
      <div className="relative z-10 flex-1 text-center">
        <span className="text-budget-text font-serif font-semibold text-lg tracking-wide">{center}</span>
      </div>
      <div className="relative z-10 flex items-center justify-end min-w-[60px]">{right}</div>
    </header>
  )
}
