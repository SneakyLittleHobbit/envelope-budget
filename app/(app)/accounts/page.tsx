'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, GripVertical, MinusCircle } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import { getOnBudgetAccountTotal, getDebtAccountTotal } from '@/lib/computed'
import { formatZAR } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { EmptyHint } from '@/components/empty-hint'
import { ConfirmDialog } from '@/components/confirm-dialog'

export default function AccountsPage() {
  const accounts = useBudgetStore((s) => s.accounts)
  const deleteAccount = useBudgetStore((s) => s.deleteAccount)
  const [editMode, setEditMode] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const onBudgetAccounts = accounts
    .filter((a) => a.isOnBudget)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const debtAccounts = accounts
    .filter((a) => a.type === 'debt' || a.type === 'credit_card')
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const onBudgetTotal = getOnBudgetAccountTotal(accounts)
  const debtTotal = getDebtAccountTotal(accounts)
  const allTotal = onBudgetTotal + debtTotal

  function handleDeleteClick(id: string, name: string) {
    setDeleteTarget({ id, name })
  }

  function confirmDelete() {
    if (deleteTarget) {
      deleteAccount(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <AppHeader
        left={
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-budget-text text-sm font-medium touch-manipulation"
          >
            {editMode ? 'Done' : 'Edit'}
          </button>
        }
        center="Accounts"
        right={
          <Link
            href="/accounts/add"
            className="text-budget-amber touch-manipulation"
            aria-label="Add account"
          >
            <Plus className="h-5 w-5" />
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* All Accounts total */}
        <div className="flex justify-end px-4 py-1.5">
          <span className="text-budget-text-secondary text-xs tabular-nums">
            All Accounts: {formatZAR(allTotal)}
          </span>
        </div>

        {/* Checking, Savings, Cash section */}
        <div className="flex items-baseline justify-between px-4 py-2.5 bg-budget-section border-b border-budget-divider/50">
          <span className="text-budget-text-secondary text-sm font-serif font-medium">
            Checking, Savings, Cash
          </span>
          <span className="text-budget-text-secondary text-sm tabular-nums">
            {formatZAR(onBudgetTotal)}
          </span>
        </div>

        {onBudgetAccounts.length === 0 && (
          <EmptyHint
            title="No accounts yet"
            description="Tap the pencil icon to add your first account."
          />
        )}

        {onBudgetAccounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center px-4 py-3 border-b border-budget-divider"
          >
            {editMode && (
              <button
                onClick={() => handleDeleteClick(account.id, account.name)}
                className="mr-3 text-budget-red-delete touch-manipulation"
                aria-label={`Delete ${account.name}`}
              >
                <MinusCircle className="h-5 w-5" />
              </button>
            )}
            <Link
              href={editMode ? `/accounts/${account.id}/edit` : `/accounts/${account.id}`}
              className="flex-1 flex items-baseline justify-between touch-manipulation"
            >
              <span className="text-budget-text text-[15px]">
                {account.name}
              </span>
              <span className="text-budget-text text-[15px] tabular-nums font-medium">
                {formatZAR(account.balance)}
              </span>
            </Link>
            {editMode && (
              <GripVertical className="ml-3 h-5 w-5 text-budget-text-secondary" />
            )}
          </div>
        ))}

        {/* Debt section */}
        <div className="flex items-baseline justify-between px-4 py-2.5 bg-budget-section mt-2 border-b border-budget-divider/50">
          <span className="text-budget-text-secondary text-sm font-serif font-medium">
            Debt
          </span>
          <span className="text-budget-text-secondary text-sm tabular-nums">
            {formatZAR(debtTotal)}
          </span>
        </div>

        {debtAccounts.length === 0 && (
          <EmptyHint
            title="Tap Edit to add a Debt Account"
            description="Track your debt balance and payoff progress."
          />
        )}

        {debtAccounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center px-4 py-3 border-b border-budget-divider"
          >
            {editMode && (
              <button
                onClick={() => handleDeleteClick(account.id, account.name)}
                className="mr-3 text-budget-red-delete touch-manipulation"
                aria-label={`Delete ${account.name}`}
              >
                <MinusCircle className="h-5 w-5" />
              </button>
            )}
            <Link
              href={editMode ? `/accounts/${account.id}/edit` : `/accounts/${account.id}`}
              className="flex-1 flex items-baseline justify-between touch-manipulation"
            >
              <span className="text-budget-text text-[15px]">
                {account.name}
              </span>
              <span className="text-budget-text text-[15px] tabular-nums font-medium">
                {formatZAR(account.balance)}
              </span>
            </Link>
            {editMode && (
              <GripVertical className="ml-3 h-5 w-5 text-budget-text-secondary" />
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  )
}
