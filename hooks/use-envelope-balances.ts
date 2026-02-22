import { useMemo } from 'react'
import type { Envelope, Transaction } from '@/lib/types'

/**
 * Compute an envelope's current balance from transactions.
 * Balance = sum of fills into this envelope - sum of expenses from this envelope
 */
function computeEnvelopeBalance(envelopeId: string, transactions: Transaction[]): number {
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
 * Memoized hook for computing all envelope balances at once.
 * This is more efficient than calling getEnvelopeBalance for each envelope.
 */
export function useEnvelopeBalances(
  envelopes: Envelope[],
  transactions: Transaction[]
): Record<string, number> {
  return useMemo(() => {
    const balances: Record<string, number> = {}
    
    // Create a map of transactions by envelope for faster lookup
    const postedTransactions = transactions.filter((t) => !t.isScheduled)
    
    for (const env of envelopes) {
      balances[env.id] = computeEnvelopeBalance(env.id, postedTransactions)
    }
    
    return balances
  }, [envelopes, transactions])
}

/**
 * Memoized hook for computing a single envelope balance.
 */
export function useEnvelopeBalance(
  envelopeId: string,
  transactions: Transaction[]
): number {
  return useMemo(() => {
    return computeEnvelopeBalance(envelopeId, transactions)
  }, [envelopeId, transactions])
}
