'use client'

import { ReactNode } from 'react'

interface FormSectionProps {
  label?: string
  children: ReactNode
}

export function FormSection({ label, children }: FormSectionProps) {
  return (
    <div className="mt-3">
      {label && (
        <div className="px-4 py-1.5">
          <span className="text-budget-text-secondary text-xs uppercase tracking-wide">
            {label}
          </span>
        </div>
      )}
      <div className="rounded-lg overflow-hidden mx-0">{children}</div>
    </div>
  )
}
