'use client'

import { ReactNode } from 'react'
import { ChevronLeft, X, Check } from 'lucide-react'

interface PickerOverlayProps {
  title: string
  onClose: () => void
  /** If provided, shows Save button that calls this */
  onSave?: () => void
  /** Use X instead of < for close button */
  useX?: boolean
  children: ReactNode
}

export function PickerOverlay({
  title,
  onClose,
  onSave,
  useX = false,
  children,
}: PickerOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-budget-bg flex flex-col max-w-md mx-auto">
      <header className="flex items-center justify-between bg-budget-header px-4 py-3 min-h-[52px] shrink-0">
        <button onClick={onClose} className="text-budget-text touch-manipulation min-w-[60px]">
          {useX ? (
            <X className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </button>
        <span className="text-budget-text font-semibold text-lg flex-1 text-center">
          {title}
        </span>
        <div className="min-w-[60px] flex justify-end">
          {onSave && (
            <button
              onClick={onSave}
              className="bg-budget-green text-white text-sm font-semibold px-4 py-1.5 rounded-full touch-manipulation"
            >
              Save
            </button>
          )}
        </div>
      </header>
      <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
    </div>
  )
}

/** A single picker row with optional checkmark */
interface PickerRowProps {
  label: string
  sublabel?: string
  isSelected?: boolean
  onTap: () => void
  disabled?: boolean
  className?: string
}

export function PickerRow({
  label,
  sublabel,
  isSelected,
  onTap,
  disabled = false,
  className = '',
}: PickerRowProps) {
  return (
    <button
      onClick={disabled ? undefined : onTap}
      disabled={disabled}
      className={`flex items-center justify-between w-full px-4 py-3 border-b border-budget-divider touch-manipulation ${
        disabled ? 'opacity-40' : 'active:bg-budget-card/50'
      } ${className}`}
    >
      <div>
        <span className="text-budget-text text-[15px]">{label}</span>
        {sublabel && (
          <span className="text-budget-text-secondary text-xs block mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
      {isSelected && <Check className="h-5 w-5 text-budget-blue" />}
    </button>
  )
}
