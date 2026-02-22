'use client'

import type { Envelope } from '@/lib/types'
import { formatZAR } from '@/lib/format'
import { EnvelopeRow } from './envelope-row'

interface EnvelopeGroupProps {
  groupName: string
  groupTotal: number
  envelopes: Envelope[]
  balances: Record<string, number>
}

export function EnvelopeGroup({
  groupName,
  groupTotal,
  envelopes,
  balances,
}: EnvelopeGroupProps) {
  return (
    <div>
      {/* Group header */}
      <div className="flex items-baseline justify-between px-4 py-2.5">
        <span className="text-budget-text font-bold text-lg">{groupName}</span>
        <span className="text-budget-text font-bold text-lg tabular-nums">
          {formatZAR(groupTotal)}
        </span>
      </div>
      {/* Envelope rows */}
      {envelopes.map((env) => (
        <EnvelopeRow
          key={env.id}
          id={env.id}
          name={env.name}
          balance={balances[env.id] ?? 0}
          budgetAmount={env.budgetAmount}
        />
      ))}
    </div>
  )
}
