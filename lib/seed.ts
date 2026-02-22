import type { Account, Envelope, EnvelopeGroup, Household, Transaction } from './types'

// Stable IDs for seed data
const ACCOUNT_ID = 'acc-my-account'
const GROUP_ABI_ID = 'grp-abi'
const ENV_GROCERIES_ID = 'env-groceries'
const ENV_DONSIE_ID = 'env-donsie'
const ENV_TOILET_PAPER_ID = 'env-toilet-paper'
const ENV_DOEKE_ID = 'env-doeke'
const ENV_CLEANERS_ID = 'env-cleaners'
const ENV_TOILETRIES_ID = 'env-toiletries'

export const seedHousehold: Household = {
  name: 'My Household',
}

export const seedAccounts: Account[] = [
  {
    id: ACCOUNT_ID,
    name: 'My Account',
    type: 'checking',
    balance: 4465,
    isOnBudget: true,
    sortOrder: 0,
  },
]

export const seedEnvelopeGroups: EnvelopeGroup[] = [
  {
    id: GROUP_ABI_ID,
    name: 'Abi',
    sortOrder: 0,
  },
]

export const seedEnvelopes: Envelope[] = [
  {
    id: ENV_GROCERIES_ID,
    groupId: GROUP_ABI_ID,
    name: 'Groceries',
    budgetAmount: 5800,
    frequency: 'monthly',
    sortOrder: 0,
  },
  {
    id: ENV_DONSIE_ID,
    groupId: GROUP_ABI_ID,
    name: 'Donsie',
    budgetAmount: 300,
    frequency: 'monthly',
    sortOrder: 1,
  },
  {
    id: ENV_TOILET_PAPER_ID,
    groupId: GROUP_ABI_ID,
    name: 'Toilet paper',
    budgetAmount: 130,
    frequency: 'monthly',
    sortOrder: 2,
  },
  {
    id: ENV_DOEKE_ID,
    groupId: GROUP_ABI_ID,
    name: 'Doeke & wipes',
    budgetAmount: 550,
    frequency: 'monthly',
    sortOrder: 3,
  },
  {
    id: ENV_CLEANERS_ID,
    groupId: GROUP_ABI_ID,
    name: 'Cleaners',
    budgetAmount: 300,
    frequency: 'monthly',
    sortOrder: 4,
  },
  {
    id: ENV_TOILETRIES_ID,
    groupId: GROUP_ABI_ID,
    name: 'Toiletries',
    budgetAmount: 420,
    frequency: 'monthly',
    sortOrder: 5,
  },
]

export const seedTransactions: Transaction[] = [
  // Monthly income fill (fills envelopes to match screenshot balances)
  {
    id: 'tx-income-01',
    type: 'add_income',
    date: '2026-02-13',
    amount: 7500,
    payer: 'Income',
    accountId: ACCOUNT_ID,
    isScheduled: false,
    fills: [
      { envelopeId: ENV_GROCERIES_ID, amount: 5800 },
      { envelopeId: ENV_DONSIE_ID, amount: 0 },
      { envelopeId: ENV_TOILET_PAPER_ID, amount: 130 },
      { envelopeId: ENV_DOEKE_ID, amount: 550 },
      { envelopeId: ENV_CLEANERS_ID, amount: 300 },
      { envelopeId: ENV_TOILETRIES_ID, amount: 420 },
    ],
    note: 'Monthly fill',
  },
  // Expenses to create the balances shown in screenshot
  {
    id: 'tx-expense-01',
    type: 'expense',
    date: '2026-02-21',
    amount: 176,
    payee: 'Dischem',
    envelopeId: ENV_GROCERIES_ID,
    accountId: ACCOUNT_ID,
    isScheduled: false,
  },
  {
    id: 'tx-expense-02',
    type: 'expense',
    date: '2026-02-21',
    amount: 275,
    payee: 'Woolworths',
    envelopeId: ENV_GROCERIES_ID,
    accountId: ACCOUNT_ID,
    isScheduled: false,
  },
  {
    id: 'tx-expense-03',
    type: 'expense',
    date: '2026-02-20',
    amount: 1264,
    payee: 'Checkers',
    envelopeId: ENV_GROCERIES_ID,
    accountId: ACCOUNT_ID,
    isScheduled: false,
  },
  {
    id: 'tx-expense-04',
    type: 'expense',
    date: '2026-02-18',
    amount: 90,
    payee: 'Woolworths',
    envelopeId: ENV_TOILET_PAPER_ID,
    accountId: ACCOUNT_ID,
    isScheduled: false,
  },
  {
    id: 'tx-expense-05',
    type: 'expense',
    date: '2026-02-19',
    amount: 120,
    payee: 'Clicks',
    envelopeId: ENV_DOEKE_ID,
    accountId: ACCOUNT_ID,
    isScheduled: false,
  },
  {
    id: 'tx-expense-06',
    type: 'expense',
    date: '2026-02-17',
    amount: 390,
    payee: 'Makro',
    envelopeId: ENV_CLEANERS_ID,
    accountId: ACCOUNT_ID,
    isScheduled: false,
  },
  {
    id: 'tx-expense-07',
    type: 'expense',
    date: '2026-02-20',
    amount: 420,
    payee: 'Dischem',
    envelopeId: ENV_TOILETRIES_ID,
    accountId: ACCOUNT_ID,
    isScheduled: false,
  },
  // Scheduled upcoming transaction
  {
    id: 'tx-scheduled-01',
    type: 'add_income',
    date: '2026-03-01',
    amount: 7500,
    payer: 'Monthly Fill',
    accountId: ACCOUNT_ID,
    isScheduled: true,
    scheduleFrequency: 'monthly',
    fills: [
      { envelopeId: ENV_GROCERIES_ID, amount: 5800 },
      { envelopeId: ENV_DONSIE_ID, amount: 300 },
      { envelopeId: ENV_TOILET_PAPER_ID, amount: 130 },
      { envelopeId: ENV_DOEKE_ID, amount: 550 },
      { envelopeId: ENV_CLEANERS_ID, amount: 300 },
      { envelopeId: ENV_TOILETRIES_ID, amount: 420 },
    ],
    note: 'Scheduled monthly fill',
  },
]
