'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import { getTransactionsGroupedByDate } from '@/lib/computed'
import { formatZAR } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { TransactionRow } from '@/components/transaction-row'
import { DateGroupHeader } from '@/components/date-group-header'

export default function SearchTransactionsPage() {
  const router = useRouter()
  const transactions = useBudgetStore((s) => s.transactions)
  const envelopes = useBudgetStore((s) => s.envelopes)
  const accounts = useBudgetStore((s) => s.accounts)
  const [query, setQuery] = useState('')

  // Filter posted transactions by query
  const filtered = transactions.filter((tx) => {
    if (tx.isScheduled) return false
    if (!query.trim()) return false
    const q = query.toLowerCase()
    // Search by payee, payer, note, amount, envelope name, account name
    if (tx.payee?.toLowerCase().includes(q)) return true
    if (tx.payer?.toLowerCase().includes(q)) return true
    if (tx.note?.toLowerCase().includes(q)) return true
    if (formatZAR(tx.amount).includes(query)) return true
    if (String(tx.amount).includes(query)) return true
    const env = envelopes.find((e) => e.id === tx.envelopeId)
    if (env?.name.toLowerCase().includes(q)) return true
    const acc = accounts.find((a) => a.id === tx.accountId)
    if (acc?.name.toLowerCase().includes(q)) return true
    return false
  })

  const dateGroups = getTransactionsGroupedByDate(filtered)

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
        center="Search Transactions"
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Search input */}
        <div className="px-4 py-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword, amount..."
            className="w-full bg-budget-card text-budget-text px-3 py-2.5 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-budget-green placeholder:text-budget-text-secondary"
            autoFocus
          />
        </div>

        {/* Results */}
        {query.trim() && dateGroups.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <p className="text-budget-text-secondary text-sm">
              No results found
            </p>
          </div>
        )}

        {dateGroups.map(({ date, transactions: txs }) => (
          <div key={date}>
            <DateGroupHeader date={date} />
            {txs.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
