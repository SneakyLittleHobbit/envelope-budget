'use client'

interface ProgressBarProps {
  current: number
  budget: number
  height?: number // px, default 4
}

/**
 * Progress bar matching the inspiration screenshot:
 * - Dark gray track for the full budget width
 * - Green fill from left showing amount spent/remaining
 * - Red fill if overspent (balance < 0)
 * - Small white tick mark at the left edge as budget marker
 */
export function ProgressBar({ current, budget, height = 4 }: ProgressBarProps) {
  if (budget <= 0) {
    // No budget set, show empty bar
    return (
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 rounded-full bg-[#374740]" />
      </div>
    )
  }

  const isOverspent = current < 0
  // For positive balance: show fill as percentage of budget
  // For negative balance: show red fill as percentage of budget
  const fillPercent = Math.min(Math.abs(current) / budget, 1) * 100

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      {/* Track background */}
      <div className="absolute inset-0 rounded-full bg-[#374740]" />
      {/* Fill bar */}
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all ${
          isOverspent ? 'bg-budget-red' : 'bg-budget-green'
        }`}
        style={{ width: `${fillPercent}%` }}
      />
      {/* Budget marker tick at left edge */}
      <div
        className="absolute top-0 left-0 bg-budget-text rounded-full"
        style={{ width: '2px', height: `${height}px` }}
      />
    </div>
  )
}
