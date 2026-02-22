'use client'

import { Info } from 'lucide-react'

interface EmptyHintProps {
  title: string
  description?: string
}

export function EmptyHint({ title, description }: EmptyHintProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Info className="h-5 w-5 text-budget-text-secondary shrink-0 mt-0.5" />
      <div>
        <p className="text-budget-text-secondary text-sm">{title}</p>
        {description && (
          <p className="text-budget-text-secondary text-xs mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}
