'use client'

import Link from 'next/link'
import { formatZAR } from '@/lib/format'
import { ProgressBar } from './progress-bar'

interface EnvelopeRowProps {
  id: string
  name: string
  balance: number
  budgetAmount: number
}

export function EnvelopeRow({ id, name, balance, budgetAmount }: EnvelopeRowProps) {
  const isNegative = balance < 0

  return (
    <Link
      href={`/envelopes/${id}`}
      className="block px-4 py-2.5 touch-manipulation active:bg-budget-card/50"
    >
      <div className="flex items-baseline justify-between">
        <span className="text-budget-text text-[15px]">{name}</span>
        <span
          className={`text-[15px] font-medium tabular-nums ${
            isNegative ? 'text-budget-negative' : 'text-budget-text'
          }`}
        >
          {formatZAR(balance)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="flex-1">
          <ProgressBar current={balance} budget={budgetAmount} />
        </div>
      </div>
      <div className="flex justify-end mt-0.5">
        <span className="text-budget-text-secondary text-xs tabular-nums">
          {formatZAR(budgetAmount)}
        </span>
      </div>
    </Link>
  )
}
