'use client'

import Link from 'next/link'
import { Leaf } from 'lucide-react'
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
      className="flex items-start gap-3 px-4 py-3 touch-manipulation active:bg-budget-card/60 border-b border-budget-divider/30 transition-colors"
    >
      <div className="mt-0.5 w-7 h-7 rounded-lg bg-budget-card-elevated flex items-center justify-center shrink-0">
        <Leaf className="h-3.5 w-3.5 text-budget-green" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
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
        <div className="mt-2">
          <ProgressBar current={balance} budget={budgetAmount} />
        </div>
        <div className="flex justify-end mt-1">
          <span className="text-budget-text-secondary text-xs tabular-nums">
            of {formatZAR(budgetAmount)}
          </span>
        </div>
      </div>
    </Link>
  )
}
