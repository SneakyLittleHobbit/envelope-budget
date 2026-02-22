'use client'

import { formatDateGroupDay, formatDateGroupFull } from '@/lib/format'

interface DateGroupHeaderProps {
  date: string
}

export function DateGroupHeader({ date }: DateGroupHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-budget-section">
      <span className="text-budget-text font-semibold text-sm">
        {formatDateGroupDay(date)}
      </span>
      <span className="text-budget-text font-semibold text-sm">
        {formatDateGroupFull(date)}
      </span>
    </div>
  )
}
