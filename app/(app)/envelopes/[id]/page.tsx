'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Pencil, Leaf } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import { getEnvelopeBalance, getTransactionsGroupedByDate } from '@/lib/computed'
import { formatZAR } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { ProgressBar } from '@/components/progress-bar'
import { TransactionRow } from '@/components/transaction-row'
import { DateGroupHeader } from '@/components/date-group-header'

export default function EnvelopeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const envelope = useBudgetStore((s) => s.envelopes.find((e) => e.id === id))
  const transactions = useBudgetStore((s) => s.transactions)

  if (!envelope) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-budget-text-secondary">Envelope not found</p>
      </div>
    )
  }

  const balance = getEnvelopeBalance(id, transactions)

  // Filter transactions for this envelope
  const envelopeTransactions = transactions.filter((tx) => {
    if (tx.isScheduled) return false
    if (tx.envelopeId === id) return true
    if (tx.fills?.some((f) => f.envelopeId === id)) return true
    if (tx.fromEnvelopeId === id || tx.toEnvelopeId === id) return true
    return false
  })

  const dateGroups = getTransactionsGroupedByDate(envelopeTransactions)

  // Status message
  const surplus = balance - 0 // relative to 0 spent
  let statusMessage = 'On track'
  let statusColor = 'text-budget-text-secondary'
  if (balance > 0) {
    statusMessage = `Great! You're ahead by ${formatZAR(balance)}`
    statusColor = 'text-budget-positive'
  } else if (balance < 0) {
    statusMessage = `Over budget by ${formatZAR(Math.abs(balance))}`
    statusColor = 'text-budget-negative'
  }

  return (
    <>
      <AppHeader
        left={
          <button
            onClick={() => router.back()}
            className="text-budget-text touch-manipulation"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        }
        center={envelope.name}
        right={
          <Link
            href={`/envelopes/${id}/edit`}
            className="text-budget-text touch-manipulation"
          >
            <Pencil className="h-5 w-5" />
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Summary card */}
        <div className="px-4 py-4 bg-budget-card mx-3 mt-3 rounded-xl card-glow border border-budget-divider/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-budget-card-elevated flex items-center justify-center shrink-0 border border-budget-divider/30">
              <Leaf className="h-5 w-5 text-budget-green" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-budget-text font-serif font-semibold text-lg">
                  {envelope.name}
                </span>
                <span
                  className={`text-lg font-bold tabular-nums ${
                    balance < 0 ? 'text-budget-negative' : 'text-budget-text'
                  }`}
                >
                  {formatZAR(balance)}
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar
                  current={balance}
                  budget={envelope.budgetAmount}
                  height={6}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs ${statusColor}`}>
                  {statusMessage}
                </span>
                <span className="text-budget-text-secondary text-xs tabular-nums">
                  {formatZAR(envelope.budgetAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction list for this envelope */}
        <div className="mt-3">
          {dateGroups.map(({ date, transactions: txs }) => (
            <div key={date}>
              <DateGroupHeader date={date} />
              {txs.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  contextIsEnvelope
                />
              ))}
            </div>
          ))}

          {dateGroups.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="text-budget-text-secondary text-sm">
                No transactions for this envelope
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
