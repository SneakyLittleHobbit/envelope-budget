import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Account,
  Envelope,
  EnvelopeGroup,
  Household,
  Transaction,
} from './types'
import {
  seedHousehold,
  seedAccounts,
  seedEnvelopeGroups,
  seedEnvelopes,
  seedTransactions,
} from './seed'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface BudgetStore {
  household: Household
  accounts: Account[]
  envelopeGroups: EnvelopeGroup[]
  envelopes: Envelope[]
  transactions: Transaction[]

  // Account actions
  addAccount: (account: Omit<Account, 'id'>) => string
  updateAccount: (id: string, data: Partial<Account>) => void
  deleteAccount: (id: string) => void
  reorderAccounts: (ids: string[]) => void

  // Envelope group actions
  addEnvelopeGroup: (group: Omit<EnvelopeGroup, 'id'>) => string
  updateEnvelopeGroup: (id: string, data: Partial<EnvelopeGroup>) => void
  deleteEnvelopeGroup: (id: string) => void

  // Envelope actions
  addEnvelope: (envelope: Omit<Envelope, 'id'>) => string
  updateEnvelope: (id: string, data: Partial<Envelope>) => void
  deleteEnvelope: (id: string) => void
  reorderEnvelopes: (groupId: string, ids: string[]) => void

  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => string
  updateTransaction: (id: string, data: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Household
  updateHouseholdName: (name: string) => void
  clearAllData: () => void
}

/**
 * Adjust account balance when a transaction is added.
 * Expenses decrease balance, income increases it, transfers move between accounts.
 */
function applyTransactionToAccounts(
  accounts: Account[],
  tx: Omit<Transaction, 'id'> & { id?: string }
): Account[] {
  if (tx.isScheduled) return accounts

  return accounts.map((acc) => {
    let delta = 0

    switch (tx.type) {
      case 'expense':
        if (acc.id === tx.accountId) {
          delta = tx.isCredit ? tx.amount : -tx.amount
        }
        break
      case 'add_income':
        if (acc.id === tx.accountId) {
          delta = tx.amount
        }
        break
      case 'account_transfer':
        if (acc.id === tx.fromAccountId) delta = -tx.amount
        if (acc.id === tx.toAccountId) delta = tx.amount
        break
      case 'debt_payment':
        if (acc.id === tx.accountId) delta = -tx.amount
        if (acc.id === tx.debtAccountId) delta = tx.amount
        break
      case 'interest_fee_charge':
        if (acc.id === tx.debtAccountId) delta = -tx.amount
        break
      // envelope_transfer and fill_from_available don't affect account balances
    }

    if (delta !== 0) {
      return { ...acc, balance: acc.balance + delta }
    }
    return acc
  })
}

/**
 * Reverse a transaction's effect on account balances (for delete/update).
 */
function reverseTransactionFromAccounts(
  accounts: Account[],
  tx: Transaction
): Account[] {
  if (tx.isScheduled) return accounts

  return accounts.map((acc) => {
    let delta = 0

    switch (tx.type) {
      case 'expense':
        if (acc.id === tx.accountId) {
          delta = tx.isCredit ? -tx.amount : tx.amount
        }
        break
      case 'add_income':
        if (acc.id === tx.accountId) {
          delta = -tx.amount
        }
        break
      case 'account_transfer':
        if (acc.id === tx.fromAccountId) delta = tx.amount
        if (acc.id === tx.toAccountId) delta = -tx.amount
        break
      case 'debt_payment':
        if (acc.id === tx.accountId) delta = tx.amount
        if (acc.id === tx.debtAccountId) delta = -tx.amount
        break
      case 'interest_fee_charge':
        if (acc.id === tx.debtAccountId) delta = tx.amount
        break
    }

    if (delta !== 0) {
      return { ...acc, balance: acc.balance + delta }
    }
    return acc
  })
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      household: seedHousehold,
      accounts: seedAccounts,
      envelopeGroups: seedEnvelopeGroups,
      envelopes: seedEnvelopes,
      transactions: seedTransactions,

      // --- Account actions ---
      addAccount: (account) => {
        const id = generateId()
        set((state) => ({
          accounts: [...state.accounts, { ...account, id }],
        }))
        return id
      },

      updateAccount: (id, data) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        }))
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        }))
      },

      reorderAccounts: (ids) => {
        set((state) => ({
          accounts: state.accounts.map((a) => {
            const idx = ids.indexOf(a.id)
            return idx >= 0 ? { ...a, sortOrder: idx } : a
          }),
        }))
      },

      // --- Envelope group actions ---
      addEnvelopeGroup: (group) => {
        const id = generateId()
        set((state) => ({
          envelopeGroups: [...state.envelopeGroups, { ...group, id }],
        }))
        return id
      },

      updateEnvelopeGroup: (id, data) => {
        set((state) => ({
          envelopeGroups: state.envelopeGroups.map((g) =>
            g.id === id ? { ...g, ...data } : g
          ),
        }))
      },

      deleteEnvelopeGroup: (id) => {
        set((state) => ({
          envelopeGroups: state.envelopeGroups.filter((g) => g.id !== id),
          envelopes: state.envelopes.filter((e) => e.groupId !== id),
        }))
      },

      // --- Envelope actions ---
      addEnvelope: (envelope) => {
        const id = generateId()
        set((state) => ({
          envelopes: [...state.envelopes, { ...envelope, id }],
        }))
        return id
      },

      updateEnvelope: (id, data) => {
        set((state) => ({
          envelopes: state.envelopes.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        }))
      },

      deleteEnvelope: (id) => {
        set((state) => ({
          envelopes: state.envelopes.filter((e) => e.id !== id),
        }))
      },

      reorderEnvelopes: (groupId, ids) => {
        set((state) => ({
          envelopes: state.envelopes.map((e) => {
            if (e.groupId !== groupId) return e
            const idx = ids.indexOf(e.id)
            return idx >= 0 ? { ...e, sortOrder: idx } : e
          }),
        }))
      },

      // --- Transaction actions ---
      addTransaction: (transaction) => {
        const id = generateId()
        const fullTx = { ...transaction, id }
        set((state) => ({
          transactions: [...state.transactions, fullTx],
          accounts: applyTransactionToAccounts(state.accounts, fullTx),
        }))
        return id
      },

      updateTransaction: (id, data) => {
        set((state) => {
          const oldTx = state.transactions.find((t) => t.id === id)
          if (!oldTx) return state

          // Reverse old transaction effect on accounts
          let accounts = reverseTransactionFromAccounts(state.accounts, oldTx)
          // Apply new transaction effect
          const newTx = { ...oldTx, ...data }
          accounts = applyTransactionToAccounts(accounts, newTx)

          return {
            transactions: state.transactions.map((t) =>
              t.id === id ? newTx : t
            ),
            accounts,
          }
        })
      },

      deleteTransaction: (id) => {
        set((state) => {
          const tx = state.transactions.find((t) => t.id === id)
          if (!tx) return state

          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            accounts: reverseTransactionFromAccounts(state.accounts, tx),
          }
        })
      },

      // --- Household ---
      updateHouseholdName: (name) => {
        set((state) => ({
          household: { ...state.household, name },
        }))
      },

      clearAllData: () => {
        set({
          household: { name: 'My Household' },
          accounts: [],
          envelopeGroups: [],
          envelopes: [],
          transactions: [],
        })
      },
    }),
    {
      name: 'envelope-budget-storage',
    }
  )
)
