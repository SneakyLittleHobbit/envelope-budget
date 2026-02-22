import type { Account, Envelope, EnvelopeGroup, Transaction } from './types'

/**
 * Compute an envelope's current balance from transactions.
 * Balance = sum of fills into this envelope - sum of expenses from this envelope
 */
export function getEnvelopeBalance(envelopeId: string, transactions: Transaction[]): number {
  let balance = 0

  for (const tx of transactions) {
    if (tx.isScheduled) continue // Don't count unposted scheduled transactions

    // Income / fill fills
    if (tx.fills) {
      for (const fill of tx.fills) {
        if (fill.envelopeId === envelopeId) {
          balance += fill.amount
        }
      }
    }

    // Expense from this envelope
    if (tx.type === 'expense' && tx.envelopeId === envelopeId) {
      if (tx.isCredit) {
        balance += tx.amount // Credit = refund, adds back
      } else {
        balance -= tx.amount
      }
    }

    // Envelope transfers
    if (tx.type === 'envelope_transfer') {
      if (tx.toEnvelopeId === envelopeId) balance += tx.amount
      if (tx.fromEnvelopeId === envelopeId) balance -= tx.amount
    }
  }

  return balance
}

/**
 * Get a map of all envelope balances { envelopeId: balance }
 */
export function getAllEnvelopeBalances(
  envelopes: Envelope[],
  transactions: Transaction[]
): Record<string, number> {
  const balances: Record<string, number> = {}
  for (const env of envelopes) {
    balances[env.id] = getEnvelopeBalance(env.id, transactions)
  }
  return balances
}

/**
 * Compute "Available" amount.
 * Available = sum of on-budget account balances - sum of all envelope balances
 */
export function getAvailable(
  accounts: Account[],
  envelopes: Envelope[],
  transactions: Transaction[]
): number {
  const accountTotal = accounts
    .filter((a) => a.isOnBudget)
    .reduce((sum, a) => sum + a.balance, 0)

  const envelopeTotal = envelopes.reduce(
    (sum, env) => sum + getEnvelopeBalance(env.id, transactions),
    0
  )

  return accountTotal - envelopeTotal
}

/**
 * Sum of envelope balances within a group.
 */
export function getGroupTotal(
  groupId: string,
  envelopes: Envelope[],
  transactions: Transaction[]
): number {
  return envelopes
    .filter((e) => e.groupId === groupId)
    .reduce((sum, env) => sum + getEnvelopeBalance(env.id, transactions), 0)
}

/**
 * Sum of ALL envelope balances.
 */
export function getAllEnvelopesTotal(
  envelopes: Envelope[],
  transactions: Transaction[]
): number {
  return envelopes.reduce(
    (sum, env) => sum + getEnvelopeBalance(env.id, transactions),
    0
  )
}

/**
 * Get envelopes sorted within their groups, groups sorted by sortOrder.
 */
export function getGroupedEnvelopes(
  groups: EnvelopeGroup[],
  envelopes: Envelope[]
): { group: EnvelopeGroup; envelopes: Envelope[] }[] {
  return [...groups]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((group) => ({
      group,
      envelopes: envelopes
        .filter((e) => e.groupId === group.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
}

/**
 * Get transactions grouped by date, sorted newest first.
 * Returns array of { date: string, transactions: Transaction[] }
 */
export function getTransactionsGroupedByDate(
  transactions: Transaction[]
): { date: string; transactions: Transaction[] }[] {
  const posted = transactions.filter((t) => !t.isScheduled)
  const sorted = [...posted].sort((a, b) => b.date.localeCompare(a.date))

  const groups: { date: string; transactions: Transaction[] }[] = []
  for (const tx of sorted) {
    const existing = groups.find((g) => g.date === tx.date)
    if (existing) {
      existing.transactions.push(tx)
    } else {
      groups.push({ date: tx.date, transactions: [tx] })
    }
  }
  return groups
}

/**
 * Get upcoming (scheduled) transactions, sorted by date ascending.
 */
export function getUpcomingTransactions(transactions: Transaction[]): Transaction[] {
  return transactions
    .filter((t) => t.isScheduled)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get total of all on-budget account balances.
 */
export function getOnBudgetAccountTotal(accounts: Account[]): number {
  return accounts.filter((a) => a.isOnBudget).reduce((sum, a) => sum + a.balance, 0)
}

/**
 * Get total of all debt account balances.
 */
export function getDebtAccountTotal(accounts: Account[]): number {
  return accounts.filter((a) => a.type === 'debt').reduce((sum, a) => sum + a.balance, 0)
}

/**
 * Compute total budgeted amount across all envelopes for a given frequency.
 * If frequency is null, computes across all frequencies.
 */
export function getTotalBudgeted(
  envelopes: Envelope[],
  frequency?: string | null
): number {
  const filtered = frequency
    ? envelopes.filter((e) => e.frequency === frequency)
    : envelopes
  return filtered.reduce((sum, e) => sum + e.budgetAmount, 0)
}
