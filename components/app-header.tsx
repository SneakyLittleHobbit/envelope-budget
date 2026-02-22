'use client'

import { ReactNode } from 'react'

interface AppHeaderProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
}

export function AppHeader({ left, center, right }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between bg-budget-header px-4 py-3 min-h-[52px] shrink-0">
      <div className="flex items-center min-w-[60px]">{left}</div>
      <div className="flex-1 text-center">
        <span className="text-budget-text font-semibold text-lg">{center}</span>
      </div>
      <div className="flex items-center justify-end min-w-[60px]">{right}</div>
    </header>
  )
}
