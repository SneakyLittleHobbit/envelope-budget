'use client'

import { formatDateGroupDay, formatDateGroupFull } from '@/lib/format'

interface DateGroupHeaderProps {
  date: string
}

export function DateGroupHeader({ date }: DateGroupHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-budget-section border-b border-budget-divider/50">
      <span className="text-budget-text font-serif font-semibold text-sm">
        {formatDateGroupDay(date)}
      </span>
      <span className="text-budget-text-secondary font-medium text-xs">
        {formatDateGroupFull(date)}
      </span>
    </div>
  )
}
