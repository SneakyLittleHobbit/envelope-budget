'use client'

import { useMemo } from 'react'
import { useBudgetStore } from '@/lib/store'
import { getGroupedEnvelopes } from '@/lib/computed'
import { formatZAR } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { ProgressBar } from '@/components/progress-bar'
import { useEnvelopeBalances } from '@/hooks/use-envelope-balances'

export default function ReportsPage() {
  const envelopes = useBudgetStore((s) => s.envelopes)
  const envelopeGroups = useBudgetStore((s) => s.envelopeGroups)
  const transactions = useBudgetStore((s) => s.transactions)
  const accounts = useBudgetStore((s) => s.accounts)

  // Memoized envelope balances
  const envelopeBalances = useEnvelopeBalances(envelopes, transactions)

  // Calculate spending by envelope for the current month
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  const reportData = useMemo(() => {
    // Filter transactions for current month
    const monthlyTransactions = transactions.filter(
      (t) => !t.isScheduled && t.date.startsWith(currentMonth)
    )

    // Calculate spending by envelope
    const spendingByEnvelope: Record<string, number> = {}
    for (const tx of monthlyTransactions) {
      if (tx.type === 'expense' && tx.envelopeId && !tx.isCredit) {
        spendingByEnvelope[tx.envelopeId] = (spendingByEnvelope[tx.envelopeId] || 0) + tx.amount
      }
    }

    // Calculate total income for the month
    const totalIncome = monthlyTransactions
      .filter((t) => t.type === 'add_income')
      .reduce((sum, t) => sum + t.amount, 0)

    // Calculate total expenses for the month
    const totalExpenses = monthlyTransactions
      .filter((t) => t.type === 'expense' && !t.isCredit)
      .reduce((sum, t) => sum + t.amount, 0)

    // Get top spending envelopes
    const envelopeSpending = envelopes
      .map((env) => ({
        id: env.id,
        name: env.name,
        spent: spendingByEnvelope[env.id] || 0,
        budget: env.budgetAmount,
        balance: envelopeBalances[env.id] || 0,
      }))
      .filter((e) => e.spent > 0)
      .sort((a, b) => b.spent - a.spent)

    // Calculate account totals
    const onBudgetTotal = accounts
      .filter((a) => a.isOnBudget)
      .reduce((sum, a) => sum + a.balance, 0)

    const debtTotal = accounts
      .filter((a) => a.type === 'debt' || a.type === 'credit_card')
      .reduce((sum, a) => sum + a.balance, 0)

    return {
      totalIncome,
      totalExpenses,
      envelopeSpending,
      onBudgetTotal,
      debtTotal,
    }
  }, [transactions, envelopes, accounts, currentMonth, envelopeBalances])

  const grouped = getGroupedEnvelopes(envelopeGroups, envelopes)

  // Format month for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const displayMonth = `${monthNames[parseInt(currentMonth.slice(5, 7)) - 1]} ${currentMonth.slice(0, 4)}`

  return (
    <>
      <AppHeader center="Reports" />
      <div className="flex-1 overflow-y-auto no-scrollbar bg-wildflower">
        {/* Month Header */}
        <div className="px-4 py-3 bg-budget-section border-b border-budget-divider/50">
          <h2 className="text-budget-text font-serif font-medium">{displayMonth}</h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 p-4">
          <div className="bg-budget-card rounded-xl p-4 card-glow border border-budget-divider/30">
            <p className="text-budget-text-secondary text-xs uppercase tracking-wide">Income</p>
            <p className="text-budget-positive text-xl font-semibold mt-1">
              {formatZAR(reportData.totalIncome)}
            </p>
          </div>
          <div className="bg-budget-card rounded-xl p-4 card-glow border border-budget-divider/30">
            <p className="text-budget-text-secondary text-xs uppercase tracking-wide">Expenses</p>
            <p className="text-budget-red text-xl font-semibold mt-1">
              {formatZAR(reportData.totalExpenses)}
            </p>
          </div>
        </div>

        {/* Net Income */}
        <div className="px-4 pb-4">
          <div className="bg-budget-card rounded-xl p-4 card-glow border border-budget-divider/30">
            <p className="text-budget-text-secondary text-xs uppercase tracking-wide">Net Income</p>
            <p className={`text-xl font-semibold mt-1 ${reportData.totalIncome - reportData.totalExpenses >= 0 ? 'text-budget-positive' : 'text-budget-red'}`}>
              {formatZAR(reportData.totalIncome - reportData.totalExpenses)}
            </p>
          </div>
        </div>

        {/* Account Summary */}
        <div className="px-4 py-2.5 bg-budget-section border-b border-budget-divider/50">
          <span className="text-budget-text-secondary text-xs uppercase tracking-wide font-serif">Account Summary</span>
        </div>
        <div className="px-4 py-3 border-b border-budget-divider">
          <div className="flex justify-between">
            <span className="text-budget-text text-[15px]">On-Budget Accounts</span>
            <span className="text-budget-text text-[15px] tabular-nums font-medium">
              {formatZAR(reportData.onBudgetTotal)}
            </span>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-budget-divider">
          <div className="flex justify-between">
            <span className="text-budget-text text-[15px]">Debt Accounts</span>
            <span className="text-budget-red text-[15px] tabular-nums font-medium">
              {formatZAR(reportData.debtTotal)}
            </span>
          </div>
        </div>

        {/* Spending by Envelope */}
        <div className="px-4 py-2.5 bg-budget-section mt-2 border-b border-budget-divider/50">
          <span className="text-budget-text-secondary text-xs uppercase tracking-wide font-serif">Spending by Envelope</span>
        </div>

        {reportData.envelopeSpending.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-budget-text-secondary text-sm">No spending this month</p>
          </div>
        ) : (
          reportData.envelopeSpending.slice(0, 10).map((env) => (
            <div key={env.id} className="px-4 py-3 border-b border-budget-divider">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-budget-text text-[15px]">{env.name}</span>
                <span className="text-budget-text text-[15px] tabular-nums font-medium">
                  {formatZAR(env.spent)}
                </span>
              </div>
              {env.budget > 0 && (
                <div className="mt-1">
                  <ProgressBar current={env.spent} budget={env.budget} />
                  <div className="flex justify-between mt-0.5">
                    <span className="text-budget-text-secondary text-xs">
                      {env.spent > env.budget ? 'Over budget' : `${Math.round((env.spent / env.budget) * 100)}% used`}
                    </span>
                    <span className="text-budget-text-secondary text-xs tabular-nums">
                      {formatZAR(env.budget)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Envelope Balances */}
        <div className="px-4 py-2.5 bg-budget-section mt-2 border-b border-budget-divider/50">
          <span className="text-budget-text-secondary text-xs uppercase tracking-wide font-serif">Envelope Balances</span>
        </div>

        {grouped.map(({ group, envelopes: groupEnvs }) => (
          <div key={group.id}>
            <div className="px-4 py-1.5 bg-budget-card">
              <span className="text-budget-text-secondary text-xs">{group.name}</span>
            </div>
            {groupEnvs.map((env) => {
              const balance = envelopeBalances[env.id] || 0
              return (
                <div key={env.id} className="px-4 py-2.5 border-b border-budget-divider">
                  <div className="flex justify-between items-baseline">
                    <span className="text-budget-text text-[15px]">{env.name}</span>
                    <span className={`text-[15px] tabular-nums font-medium ${balance >= 0 ? 'text-budget-text' : 'text-budget-red'}`}>
                      {formatZAR(balance)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <ProgressBar current={balance} budget={env.budgetAmount} />
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        <div className="h-8" />
      </div>
    </>
  )
}
