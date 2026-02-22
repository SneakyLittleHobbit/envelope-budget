// === Envelope Budget App — Core Types ===

export type AccountType = 'checking' | 'savings' | 'cash' | 'credit_card' | 'debt'

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  isOnBudget: boolean
  // Debt-only fields
  status?: 'working_to_pay_off' | 'paid_off'
  linkedEnvelopeId?: string
  monthlyPayment?: number
  interestRate?: number
  dueDay?: number
  sortOrder: number
}

export interface EnvelopeGroup {
  id: string
  name: string
  sortOrder: number
}

export type EnvelopeFrequency =
  | 'monthly'
  | 'every_2_months'
  | 'every_3_months'
  | 'every_6_months'
  | 'annual'
  | 'goal'

export interface Envelope {
  id: string
  groupId: string
  name: string
  budgetAmount: number
  frequency: EnvelopeFrequency
  sortOrder: number
  dueDay?: number
}

export type TransactionType =
  | 'expense'
  | 'add_income'
  | 'fill_from_available'
  | 'envelope_transfer'
  | 'account_transfer'
  | 'debt_payment'
  | 'interest_fee_charge'

export interface EnvelopeFill {
  envelopeId: string
  amount: number
}

export interface Transaction {
  id: string
  type: TransactionType
  date: string // ISO date string (YYYY-MM-DD)
  amount: number
  note?: string
  isScheduled: boolean
  scheduleFrequency?: ScheduleFrequency
  // Expense fields
  payee?: string
  envelopeId?: string
  accountId?: string
  isCredit?: boolean
  checkNum?: string
  // Income fields
  payer?: string
  fills?: EnvelopeFill[]
  // Transfer fields
  fromEnvelopeId?: string
  toEnvelopeId?: string
  fromAccountId?: string
  toAccountId?: string
  // Debt fields
  debtAccountId?: string
  // Auto-generated
  description?: string
}

export type ScheduleFrequency =
  | 'never'
  | 'once'
  | 'weekly'
  | 'every_2_weeks'
  | 'every_4_weeks'
  | 'monthly'
  | 'last_day_month'
  | 'every_2_months'
  | 'every_3_months'
  | 'every_6_months'
  | 'yearly'

export interface Household {
  name: string
}

// Label maps for display
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  expense: 'Expense',
  add_income: 'Add Income',
  fill_from_available: 'Fill From Available',
  envelope_transfer: 'Envelope Transfer',
  account_transfer: 'Account Transfer',
  debt_payment: 'Debt Payment',
  interest_fee_charge: 'Interest, Fee, or New Charge',
}

export const SCHEDULE_FREQUENCY_LABELS: Record<ScheduleFrequency, string> = {
  never: 'Never',
  once: 'Once',
  weekly: 'Weekly',
  every_2_weeks: 'Every 2 Weeks',
  every_4_weeks: 'Every 4 Weeks',
  monthly: 'Every Month',
  last_day_month: 'Last Day of Month',
  every_2_months: 'Every 2 Months',
  every_3_months: 'Every 3 Months',
  every_6_months: 'Every 6 Months',
  yearly: 'Every Year',
}

export const ENVELOPE_FREQUENCY_LABELS: Record<EnvelopeFrequency, string> = {
  monthly: 'Monthly',
  every_2_months: 'Every Two Months',
  every_3_months: 'Every Three Months',
  every_6_months: 'Every Six Months',
  annual: 'Annual',
  goal: 'Goal',
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  cash: 'Cash',
  credit_card: 'Credit Card',
  debt: 'Debt',
}
