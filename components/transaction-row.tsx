'use client'

import Link from 'next/link'
import { formatZAR } from '@/lib/format'
import { useBudgetStore } from '@/lib/store'
import type { Transaction } from '@/lib/types'

interface TransactionRowProps {
  transaction: Transaction
  /** If true, show envelope name on line 2 instead of "envelope | account" */
  contextIsEnvelope?: boolean
  /** If true, show account name on line 2 instead of "envelope | account" */
  contextIsAccount?: boolean
}

export function TransactionRow({
  transaction: tx,
  contextIsEnvelope = false,
  contextIsAccount = false,
}: TransactionRowProps) {
  const envelopes = useBudgetStore((s) => s.envelopes)
  const accounts = useBudgetStore((s) => s.accounts)

  // Determine display name (line 1 left)
  let displayName = ''
  switch (tx.type) {
    case 'expense':
      displayName = tx.payee || 'Expense'
      break
    case 'add_income':
      displayName = tx.payer || 'Income'
      break
    case 'fill_from_available':
      displayName = 'Fill From Available'
      break
    case 'envelope_transfer':
      displayName = tx.description || 'Envelope Transfer'
      break
    case 'account_transfer':
      displayName = tx.description || 'Account Transfer'
      break
    case 'debt_payment':
      displayName = 'Debt Payment'
      break
    case 'interest_fee_charge':
      displayName = 'Interest/Fee/Charge'
      break
  }

  // Determine amount color and sign
  const isIncome =
    tx.type === 'add_income' ||
    tx.type === 'fill_from_available' ||
    (tx.type === 'expense' && tx.isCredit)
  const amountStr = isIncome
    ? `+${formatZAR(tx.amount)}`
    : formatZAR(tx.amount)

  // Determine sub-line (line 2)
  let subLine = ''
  if (contextIsEnvelope) {
    // Inside Envelope Detail: show account name only
    const acc = accounts.find((a) => a.id === tx.accountId)
    subLine = acc?.name || ''
    if (tx.type === 'add_income' || tx.type === 'fill_from_available') {
      const env = envelopes.find((e) => e.id === tx.envelopeId)
      subLine = env ? `${env.name} | ${acc?.name || ''}` : acc?.name || ''
    }
  } else if (contextIsAccount) {
    // Inside Account Detail: show envelope name only
    const env = envelopes.find((e) => e.id === tx.envelopeId)
    subLine = env?.name || ''
    if (tx.fills && tx.fills.length > 1) {
      subLine = '[Multiple]'
    } else if (tx.fills && tx.fills.length === 1) {
      const fillEnv = envelopes.find((e) => e.id === tx.fills![0].envelopeId)
      subLine = fillEnv?.name || ''
    }
  } else {
    // Normal transaction list: show "envelope | account"
    const env = envelopes.find((e) => e.id === tx.envelopeId)
    const acc = accounts.find((a) => a.id === tx.accountId)
    const parts: string[] = []

    if (tx.fills && tx.fills.length > 1) {
      parts.push('[Multiple]')
    } else if (tx.fills && tx.fills.length === 1) {
      const fillEnv = envelopes.find((e) => e.id === tx.fills![0].envelopeId)
      if (fillEnv) parts.push(fillEnv.name)
    } else if (env) {
      parts.push(env.name)
    }

    if (acc) parts.push(acc.name)
    subLine = parts.join(' | ')
  }

  // Determine link target
  const editHref =
    tx.type === 'add_income'
      ? `/transactions/${tx.id}/edit-income`
      : `/transactions/${tx.id}/edit`

  return (
    <Link
      href={editHref}
      className="flex items-start justify-between px-4 py-2.5 touch-manipulation active:bg-budget-card/50"
    >
      <div className="flex-1 min-w-0">
        <p className="text-budget-text text-[15px] truncate">{displayName}</p>
        {subLine && (
          <p className="text-budget-text-secondary text-xs mt-0.5 truncate">
            {subLine}
          </p>
        )}
      </div>
      <span
        className={`text-[15px] font-medium tabular-nums ml-3 shrink-0 ${
          isIncome ? 'text-budget-positive' : 'text-budget-text'
        }`}
      >
        {amountStr}
      </span>
    </Link>
  )
}
