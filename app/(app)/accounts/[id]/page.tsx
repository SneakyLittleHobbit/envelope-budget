'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Pencil } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import { getTransactionsGroupedByDate } from '@/lib/computed'
import { formatZAR } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { TransactionRow } from '@/components/transaction-row'
import { DateGroupHeader } from '@/components/date-group-header'

export default function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const account = useBudgetStore((s) => s.accounts.find((a) => a.id === id))
  const transactions = useBudgetStore((s) => s.transactions)

  if (!account) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-budget-text-secondary">Account not found</p>
      </div>
    )
  }

  // Filter transactions for this account
  const accountTransactions = transactions.filter((tx) => {
    if (tx.isScheduled) return false
    if (tx.accountId === id) return true
    if (tx.fromAccountId === id || tx.toAccountId === id) return true
    if (tx.debtAccountId === id) return true
    return false
  })

  const dateGroups = getTransactionsGroupedByDate(accountTransactions)

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
        center={account.name}
        right={
          <Link
            href={`/accounts/${id}/edit`}
            className="text-budget-text touch-manipulation"
          >
            <Pencil className="h-5 w-5" />
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Account balance summary */}
        <div className="flex items-baseline justify-between px-4 py-4 border-b border-budget-divider">
          <span className="text-budget-text font-semibold text-lg">
            {account.name}
          </span>
          <span className="text-budget-text font-bold text-lg tabular-nums">
            {formatZAR(account.balance)}
          </span>
        </div>

        {/* Transaction list for this account */}
        {dateGroups.map(({ date, transactions: txs }) => (
          <div key={date}>
            <DateGroupHeader date={date} />
            {txs.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                contextIsAccount
              />
            ))}
          </div>
        ))}

        {dateGroups.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <p className="text-budget-text-secondary text-sm">
              No transactions for this account
            </p>
          </div>
        )}
      </div>
    </>
  )
}
