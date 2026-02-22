'use client'

import Link from 'next/link'
import { Search, Plus, PlusCircle, CheckCircle } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import {
  getTransactionsGroupedByDate,
  getUpcomingTransactions,
} from '@/lib/computed'
import { formatZAR, formatScheduleDate } from '@/lib/format'
import { SCHEDULE_FREQUENCY_LABELS } from '@/lib/types'
import { AppHeader } from '@/components/app-header'
import { TransactionRow } from '@/components/transaction-row'
import { DateGroupHeader } from '@/components/date-group-header'

export default function TransactionsPage() {
  const transactions = useBudgetStore((s) => s.transactions)
  const envelopes = useBudgetStore((s) => s.envelopes)
  const updateTransaction = useBudgetStore((s) => s.updateTransaction)

  const upcoming = getUpcomingTransactions(transactions)
  const dateGroups = getTransactionsGroupedByDate(transactions)

  // Get today's date for comparison
  const today = new Date().toISOString().slice(0, 10)

  // Check if a scheduled transaction is due (date <= today)
  function isDue(date: string): boolean {
    return date <= today
  }

  return (
    <>
      <AppHeader
        left={
          <Link
            href="/transactions/search"
            className="text-budget-text-secondary touch-manipulation"
            aria-label="Search transactions"
          >
            <Search className="h-5 w-5" />
          </Link>
        }
        center="Transactions"
        right={
          <Link
            href="/transactions/add"
            className="text-budget-amber touch-manipulation"
            aria-label="Add transaction"
          >
            <Plus className="h-5 w-5" />
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Upcoming section */}
        {upcoming.length > 0 && (
          <div>
            <div className="px-4 py-2.5 bg-budget-section border-b border-budget-divider/50">
              <span className="text-budget-text font-serif font-semibold text-sm">
                Upcoming
              </span>
            </div>
            {upcoming.map((tx) => {
              const freqLabel = tx.scheduleFrequency
                ? SCHEDULE_FREQUENCY_LABELS[tx.scheduleFrequency]
                : ''
              const fillCount = tx.fills?.length || 0
              const envelopeName =
                fillCount > 1
                  ? '[Multiple]'
                  : fillCount === 1
                    ? envelopes.find((e) => e.id === tx.fills![0].envelopeId)
                        ?.name || ''
                    : envelopes.find((e) => e.id === tx.envelopeId)?.name || ''

              return (
                <div
                  key={tx.id}
                  className="flex items-start gap-3 px-4 py-2.5"
                >
                  <button
                    className={`mt-0.5 touch-manipulation ${isDue(tx.date) ? 'text-budget-green' : 'text-budget-text-secondary'}`}
                    onClick={() => {
                      // Post scheduled transaction (simplified: just unschedule it)
                      updateTransaction(tx.id, {
                        isScheduled: false,
                        date: isDue(tx.date) ? today : tx.date,
                      })
                    }}
                    aria-label={isDue(tx.date) ? 'Post now' : 'Schedule'}
                  >
                    {isDue(tx.date) ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <PlusCircle className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <p className="text-budget-text-secondary text-[15px] truncate">
                        <span className="italic">[Scheduled]</span>{' '}
                        {freqLabel} Fill
                        {isDue(tx.date) && (
                          <span className="text-budget-green ml-1 font-medium">
                            • Due
                          </span>
                        )}
                      </p>
                      <span className="text-budget-positive text-[15px] font-medium tabular-nums ml-2 shrink-0">
                        +{formatZAR(tx.amount)}
                      </span>
                    </div>
                    <p className="text-budget-text-secondary text-xs mt-0.5">
                      {formatScheduleDate(tx.date)} | {envelopeName}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Posted transactions by date */}
        {dateGroups.map(({ date, transactions: txs }) => (
          <div key={date}>
            <DateGroupHeader date={date} />
            {txs.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        ))}

        {dateGroups.length === 0 && upcoming.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <p className="text-budget-text-secondary text-sm">
              No transactions yet
            </p>
          </div>
        )}
      </div>
    </>
  )
}
