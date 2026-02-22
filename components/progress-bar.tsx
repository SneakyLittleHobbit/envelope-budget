'use client'

interface ProgressBarProps {
  current: number
  budget: number
  height?: number // px, default 5
}

/**
 * Organic-styled progress bar:
 * - Muted olive track
 * - Soft green fill for positive, warm amber at high usage, red if overspent
 * - Rounded ends with subtle inner glow
 */
export function ProgressBar({ current, budget, height = 5 }: ProgressBarProps) {
  if (budget <= 0) {
    return (
      <div className="relative w-full rounded-full overflow-hidden" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 bg-budget-divider" />
      </div>
    )
  }

  const isOverspent = current < 0
  const ratio = Math.abs(current) / budget
  const fillPercent = Math.min(ratio, 1) * 100

  // Color transitions: green -> amber -> red
  let fillColor = 'bg-budget-green'
  if (isOverspent) {
    fillColor = 'bg-budget-red'
  } else if (ratio > 0.85) {
    fillColor = 'bg-budget-amber'
  }

  return (
    <div className="relative w-full rounded-full overflow-hidden" style={{ height: `${height}px` }}>
      {/* Track background */}
      <div className="absolute inset-0 bg-budget-divider" />
      {/* Fill bar */}
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${fillColor}`}
        style={{ width: `${fillPercent}%` }}
      />
    </div>
  )
}
