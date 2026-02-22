'use client'

import { ChevronRight } from 'lucide-react'

interface FormFieldProps {
  label: string
  value?: string
  placeholder?: string
  onTap?: () => void
  showChevron?: boolean
  /** Direct text input mode instead of tap-to-pick */
  inputMode?: boolean
  inputType?: string
  onChange?: (value: string) => void
  rightAlign?: boolean
  className?: string
  /** Display-only mode (no interaction) */
  disabled?: boolean
}

export function FormField({
  label,
  value,
  placeholder,
  onTap,
  showChevron = false,
  inputMode = false,
  inputType = 'text',
  onChange,
  rightAlign = false,
  className = '',
  disabled = false,
}: FormFieldProps) {
  if (inputMode) {
    return (
      <div
        className={`flex items-center justify-between px-4 py-3 bg-budget-card border-b border-budget-divider ${className}`}
      >
        <span className="text-budget-text text-[15px] shrink-0 mr-4">
          {label}
        </span>
        <input
          type={inputType}
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className={`bg-transparent text-budget-text text-[15px] focus:outline-none w-full ${
            rightAlign ? 'text-right' : ''
          }`}
        />
      </div>
    )
  }

  // Display-only mode for disabled fields
  if (disabled) {
    return (
      <div
        className={`flex items-center justify-between px-4 py-3 bg-budget-card border-b border-budget-divider ${className}`}
      >
        <span className="text-budget-text text-[15px]">{label}</span>
        <span className={`text-[15px] text-budget-text-secondary ${rightAlign ? 'text-right' : ''}`}>
          {value || placeholder || ''}
        </span>
      </div>
    )
  }

  return (
    <button
      onClick={onTap}
      className={`flex items-center justify-between w-full px-4 py-3 bg-budget-card border-b border-budget-divider touch-manipulation ${className}`}
    >
      <span className="text-budget-text text-[15px]">{label}</span>
      <span className="flex items-center gap-1">
        <span
          className={`text-[15px] ${
            value
              ? 'text-budget-text'
              : 'text-budget-text-secondary'
          }`}
        >
          {value || placeholder || ''}
        </span>
        {showChevron && (
          <ChevronRight className="h-4 w-4 text-budget-text-secondary" />
        )}
      </span>
    </button>
  )
}
