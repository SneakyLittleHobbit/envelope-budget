'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Check } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import {
  TRANSACTION_TYPE_LABELS,
  SCHEDULE_FREQUENCY_LABELS,
} from '@/lib/types'
import type { TransactionType, ScheduleFrequency } from '@/lib/types'
import { formatZAR, formatDateShort, parseZARInput, todayISO } from '@/lib/format'
import { getEnvelopeBalance, getGroupedEnvelopes } from '@/lib/computed'
import { AppHeader } from '@/components/app-header'
import { FormField } from '@/components/form-field'
import { FormSection } from '@/components/form-section'
import { PickerOverlay, PickerRow } from '@/components/picker-overlay'
import { DatePicker } from '@/components/date-picker'

export default function AddTransactionPage() {
  const router = useRouter()
  const envelopes = useBudgetStore((s) => s.envelopes)
  const envelopeGroups = useBudgetStore((s) => s.envelopeGroups)
  const accounts = useBudgetStore((s) => s.accounts)
  const transactions = useBudgetStore((s) => s.transactions)
  const addTransaction = useBudgetStore((s) => s.addTransaction)

  // Form state
  const [txType, setTxType] = useState<TransactionType>('expense')
  const [payee, setPayee] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [envelopeId, setEnvelopeId] = useState('')
  const [accountId, setAccountId] = useState(accounts.find((a) => a.isOnBudget)?.id || '')
  const [fromEnvelopeId, setFromEnvelopeId] = useState('')
  const [toEnvelopeId, setToEnvelopeId] = useState('')
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [debtAccountId, setDebtAccountId] = useState('')
  const [dateStr, setDateStr] = useState(todayISO())
  const [scheduleFreq, setScheduleFreq] = useState<ScheduleFrequency>('never')
  const [checkNum, setCheckNum] = useState('')
  const [note, setNote] = useState('')
  const [isCredit, setIsCredit] = useState(false)

  // Picker visibility
  const [showTypePicker, setShowTypePicker] = useState(false)
  const [showEnvelopePicker, setShowEnvelopePicker] = useState<string | null>(null) // 'envelope' | 'from' | 'to'
  const [showAccountPicker, setShowAccountPicker] = useState<string | null>(null) // 'account' | 'from' | 'to' | 'debt'
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  const [showPayeeInput, setShowPayeeInput] = useState(false)
  const [payeeInputValue, setPayeeInputValue] = useState('')

  // Resolve display names
  const selectedEnvelope = envelopes.find((e) => e.id === envelopeId)
  const selectedAccount = accounts.find((a) => a.id === accountId)
  const fromEnvelope = envelopes.find((e) => e.id === fromEnvelopeId)
  const toEnvelope = envelopes.find((e) => e.id === toEnvelopeId)
  const fromAccount = accounts.find((a) => a.id === fromAccountId)
  const toAccount = accounts.find((a) => a.id === toAccountId)
  const debtAccount = accounts.find((a) => a.id === debtAccountId)
  const grouped = getGroupedEnvelopes(envelopeGroups, envelopes)

  // Previous payees for autocomplete
  const previousPayees = [...new Set(
    transactions.filter((t) => t.payee).map((t) => t.payee!)
  )]

  // Can save logic
  function canSave(): boolean {
    const amount = parseZARInput(amountStr)
    if (!amount || amount <= 0) return false
    switch (txType) {
      case 'expense': return !!(envelopeId && accountId)
      case 'add_income': return !!accountId
      case 'fill_from_available': return !!envelopeId
      case 'envelope_transfer': return !!(fromEnvelopeId && toEnvelopeId && fromEnvelopeId !== toEnvelopeId)
      case 'account_transfer': return !!(fromAccountId && toAccountId && fromAccountId !== toAccountId)
      case 'debt_payment': return !!(accountId && debtAccountId && accountId !== debtAccountId)
      case 'interest_fee_charge': return !!debtAccountId
      default: return false
    }
  }

  // Validation error messages
  function getValidationError(): string | null {
    const amount = parseZARInput(amountStr)
    if (!amount || amount <= 0) return 'Amount must be greater than 0'
    
    switch (txType) {
      case 'expense':
        if (!envelopeId) return 'Please select an envelope'
        if (!accountId) return 'Please select an account'
        break
      case 'add_income':
        if (!accountId) return 'Please select an account'
        break
      case 'fill_from_available':
        if (!envelopeId) return 'Please select an envelope'
        break
      case 'envelope_transfer':
        if (!fromEnvelopeId) return 'Please select a source envelope'
        if (!toEnvelopeId) return 'Please select a destination envelope'
        if (fromEnvelopeId === toEnvelopeId) return 'Source and destination must be different'
        break
      case 'account_transfer':
        if (!fromAccountId) return 'Please select a source account'
        if (!toAccountId) return 'Please select a destination account'
        if (fromAccountId === toAccountId) return 'Source and destination must be different'
        break
      case 'debt_payment':
        if (!accountId) return 'Please select an account'
        if (!debtAccountId) return 'Please select a debt account'
        if (accountId === debtAccountId) return 'Account and debt account must be different'
        break
      case 'interest_fee_charge':
        if (!debtAccountId) return 'Please select a debt account'
        break
    }
    return null
  }

  function handleSave() {
    if (!canSave()) return
    const amount = parseZARInput(amountStr)

    // If type is add_income, redirect to income flow
    if (txType === 'add_income') {
      router.replace('/transactions/add-income')
      return
    }

    // If type is fill_from_available, handle fill
    if (txType === 'fill_from_available') {
      addTransaction({
        type: 'fill_from_available',
        date: dateStr,
        amount,
        isScheduled: scheduleFreq !== 'never',
        scheduleFrequency: scheduleFreq !== 'never' ? scheduleFreq : undefined,
        note: note || undefined,
        fills: [{ envelopeId, amount }],
      })
      router.back()
      return
    }

    addTransaction({
      type: txType,
      date: dateStr,
      amount,
      payee: txType === 'expense' ? payee || undefined : undefined,
      envelopeId: txType === 'expense' ? envelopeId : undefined,
      accountId: ['expense', 'debt_payment'].includes(txType) ? accountId : undefined,
      isCredit: txType === 'expense' ? isCredit : undefined,
      checkNum: txType === 'expense' && checkNum ? checkNum : undefined,
      fromEnvelopeId: txType === 'envelope_transfer' ? fromEnvelopeId : undefined,
      toEnvelopeId: txType === 'envelope_transfer' ? toEnvelopeId : undefined,
      fromAccountId: txType === 'account_transfer' ? fromAccountId : undefined,
      toAccountId: txType === 'account_transfer' ? toAccountId : undefined,
      debtAccountId: ['debt_payment', 'interest_fee_charge'].includes(txType) ? debtAccountId : undefined,
      note: note || undefined,
      isScheduled: scheduleFreq !== 'never',
      scheduleFrequency: scheduleFreq !== 'never' ? scheduleFreq : undefined,
      description:
        txType === 'envelope_transfer'
          ? `${fromEnvelope?.name || ''} -> ${toEnvelope?.name || ''}`
          : txType === 'account_transfer'
            ? `${fromAccount?.name || ''} -> ${toAccount?.name || ''}`
            : undefined,
    })
    router.back()
  }

  const saveable = canSave()
  const validationError = getValidationError()

  return (
    <>
      <AppHeader
        left={
          <button onClick={() => router.back()} className="text-budget-text touch-manipulation" aria-label="Cancel">
            <X className="h-5 w-5" />
          </button>
        }
        center="Add Transaction"
        right={
          <button
            onClick={handleSave}
            disabled={!saveable}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full touch-manipulation ${
              saveable ? 'bg-budget-green text-white' : 'bg-budget-card text-budget-text-secondary'
            }`}
          >
            Save
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Validation Error Message */}
        {validationError && amountStr && (
          <div className="px-4 py-2 bg-budget-red/10 border-b border-budget-red/20">
            <p className="text-budget-red text-xs">{validationError}</p>
          </div>
        )}

        {/* Type */}
        <FormSection>
          <FormField
            label="Type"
            value={TRANSACTION_TYPE_LABELS[txType]}
            showChevron
            onTap={() => setShowTypePicker(true)}
          />
        </FormSection>

        {/* Dynamic fields based on type */}
        <FormSection>
          {/* Payee / Payer */}
          {(txType === 'expense') && (
            <FormField
              label="Payee"
              value={payee}
              placeholder="Who received payment?"
              showChevron
              onTap={() => {
                setPayeeInputValue(payee)
                setShowPayeeInput(true)
              }}
            />
          )}

          {/* Amount */}
          <FormField
            label="Amount"
            value={amountStr}
            placeholder="0,00"
            inputMode
            inputType="text"
            onChange={setAmountStr}
            rightAlign
          />

          {/* Envelope (expense, fill_from_available) */}
          {(txType === 'expense' || txType === 'fill_from_available') && (
            <FormField
              label="Envelope"
              value={selectedEnvelope?.name || ''}
              placeholder="Select envelope"
              showChevron
              onTap={() => setShowEnvelopePicker('envelope')}
            />
          )}

          {/* Account (expense, debt_payment) */}
          {(txType === 'expense' || txType === 'debt_payment') && (
            <FormField
              label="Account"
              value={selectedAccount?.name || ''}
              placeholder="Select account"
              showChevron
              onTap={() => setShowAccountPicker('account')}
            />
          )}

          {/* From / To Envelope (envelope_transfer) */}
          {txType === 'envelope_transfer' && (
            <>
              <FormField
                label="From"
                value={fromEnvelope?.name || ''}
                placeholder="Select envelope"
                showChevron
                onTap={() => setShowEnvelopePicker('from')}
              />
              <FormField
                label="To"
                value={toEnvelope?.name || ''}
                placeholder="Select envelope"
                showChevron
                onTap={() => setShowEnvelopePicker('to')}
              />
            </>
          )}

          {/* From / To Account (account_transfer) */}
          {txType === 'account_transfer' && (
            <>
              <FormField
                label="From"
                value={fromAccount?.name || ''}
                placeholder="Select account"
                showChevron
                onTap={() => setShowAccountPicker('from')}
              />
              <FormField
                label="To"
                value={toAccount?.name || ''}
                placeholder="Select account"
                showChevron
                onTap={() => setShowAccountPicker('to')}
              />
            </>
          )}

          {/* Debt Account */}
          {(txType === 'debt_payment' || txType === 'interest_fee_charge') && (
            <FormField
              label="Debt Account"
              value={debtAccount?.name || ''}
              placeholder="Select debt account"
              showChevron
              onTap={() => setShowAccountPicker('debt')}
            />
          )}
        </FormSection>

        {/* Details section */}
        <FormSection label="Details">
          <DatePicker value={dateStr} onChange={setDateStr} />
          <FormField
            label="Schedule..."
            value={SCHEDULE_FREQUENCY_LABELS[scheduleFreq]}
            showChevron
            onTap={() => setShowSchedulePicker(true)}
          />
          {txType === 'expense' && (
            <FormField
              label="Check Num"
              value={checkNum}
              placeholder=""
              inputMode
              onChange={setCheckNum}
            />
          )}
          <FormField
            label="Note"
            value={note}
            placeholder=""
            inputMode
            onChange={setNote}
          />
          {txType === 'expense' && (
            <FormField
              label="Expense/Credit"
              value={isCredit ? 'Credit' : 'Expense'}
              showChevron
              onTap={() => setIsCredit(!isCredit)}
            />
          )}
        </FormSection>
      </div>

      {/* Type Picker */}
      {showTypePicker && (
        <PickerOverlay title="Select Type" onClose={() => setShowTypePicker(false)}>
          {/* Regular types */}
          <PickerRow label="Expense" isSelected={txType === 'expense'} onTap={() => { setTxType('expense'); setShowTypePicker(false) }} />
          <PickerRow label="Add Income" isSelected={txType === 'add_income'} onTap={() => { setTxType('add_income'); setShowTypePicker(false) }} />
          <PickerRow label="Fill From Available" isSelected={txType === 'fill_from_available'} onTap={() => { setTxType('fill_from_available'); setShowTypePicker(false) }} />
          {/* Transfers section */}
          <div className="px-4 py-1.5 bg-budget-section">
            <span className="text-budget-text-secondary text-xs uppercase tracking-wide">Transfers</span>
          </div>
          <PickerRow label="Envelope Transfer" isSelected={txType === 'envelope_transfer'} onTap={() => { setTxType('envelope_transfer'); setShowTypePicker(false) }} />
          <PickerRow label="Account Transfer" isSelected={txType === 'account_transfer'} onTap={() => { setTxType('account_transfer'); setShowTypePicker(false) }} />
          {/* Debt section */}
          <div className="px-4 py-1.5 bg-budget-section">
            <span className="text-budget-text-secondary text-xs uppercase tracking-wide">Debt</span>
          </div>
          <PickerRow label="Debt Payment" isSelected={txType === 'debt_payment'} onTap={() => { setTxType('debt_payment'); setShowTypePicker(false) }} />
          <PickerRow label="Interest, Fee, or New Charge" isSelected={txType === 'interest_fee_charge'} onTap={() => { setTxType('interest_fee_charge'); setShowTypePicker(false) }} />
        </PickerOverlay>
      )}

      {/* Envelope Picker */}
      {showEnvelopePicker && (
        <PickerOverlay title="Envelope" onClose={() => setShowEnvelopePicker(null)}>
          {/* Split to Multiple (deferred) */}
          <PickerRow
            label="--Split to Multiple--"
            disabled
            sublabel="Coming in v2"
            onTap={() => {}}
            className="italic"
          />
          {grouped.map(({ group, envelopes: groupEnvs }) => (
            <div key={group.id}>
              <div className="px-4 py-1.5 bg-budget-section">
                <span className="text-budget-text-secondary text-xs uppercase tracking-wide">
                  {group.name}
                </span>
              </div>
              {groupEnvs.map((env) => {
                const bal = getEnvelopeBalance(env.id, transactions)
                const currentSel =
                  showEnvelopePicker === 'envelope'
                    ? envelopeId
                    : showEnvelopePicker === 'from'
                      ? fromEnvelopeId
                      : toEnvelopeId
                return (
                  <PickerRow
                    key={env.id}
                    label={`${env.name} [${formatZAR(bal)}]`}
                    isSelected={env.id === currentSel}
                    onTap={() => {
                      if (showEnvelopePicker === 'envelope') setEnvelopeId(env.id)
                      else if (showEnvelopePicker === 'from') setFromEnvelopeId(env.id)
                      else setToEnvelopeId(env.id)
                      setShowEnvelopePicker(null)
                    }}
                  />
                )
              })}
            </div>
          ))}
        </PickerOverlay>
      )}

      {/* Account Picker */}
      {showAccountPicker && (
        <PickerOverlay title="Account" onClose={() => setShowAccountPicker(null)}>
          {accounts
            .filter((a) => {
              if (showAccountPicker === 'debt') return a.type === 'debt' || a.type === 'credit_card'
              return a.isOnBudget
            })
            .map((acc) => {
              const currentSel =
                showAccountPicker === 'account'
                  ? accountId
                  : showAccountPicker === 'from'
                    ? fromAccountId
                    : showAccountPicker === 'to'
                      ? toAccountId
                      : debtAccountId
              return (
                <PickerRow
                  key={acc.id}
                  label={`${acc.name} [${formatZAR(acc.balance)}]`}
                  isSelected={acc.id === currentSel}
                  onTap={() => {
                    if (showAccountPicker === 'account') setAccountId(acc.id)
                    else if (showAccountPicker === 'from') setFromAccountId(acc.id)
                    else if (showAccountPicker === 'to') setToAccountId(acc.id)
                    else setDebtAccountId(acc.id)
                    setShowAccountPicker(null)
                  }}
                />
              )
            })}
        </PickerOverlay>
      )}

      {/* Schedule Picker */}
      {showSchedulePicker && (
        <PickerOverlay
          title="Schedule This"
          onClose={() => setShowSchedulePicker(false)}
          onSave={() => setShowSchedulePicker(false)}
          useX
        >
          {(Object.entries(SCHEDULE_FREQUENCY_LABELS) as [ScheduleFrequency, string][]).map(([key, label]) => (
            <PickerRow key={key} label={label} isSelected={scheduleFreq === key} onTap={() => setScheduleFreq(key)} />
          ))}
        </PickerOverlay>
      )}

      {/* Payee Input */}
      {showPayeeInput && (
        <PickerOverlay title="Payee" onClose={() => setShowPayeeInput(false)}>
          <div className="px-4 py-3">
            <input
              type="text"
              value={payeeInputValue}
              onChange={(e) => setPayeeInputValue(e.target.value)}
              placeholder="Who received payment?"
              className="w-full bg-budget-card text-budget-text px-3 py-2.5 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-budget-green"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPayee(payeeInputValue)
                  setShowPayeeInput(false)
                }
              }}
            />
          </div>
          {/* Autocomplete from previous payees */}
          {previousPayees
            .filter((p) =>
              p.toLowerCase().includes(payeeInputValue.toLowerCase())
            )
            .map((p) => (
              <PickerRow
                key={p}
                label={p}
                onTap={() => {
                  setPayee(p)
                  setShowPayeeInput(false)
                }}
              />
            ))}
          {payeeInputValue.trim() && (
            <button
              onClick={() => {
                setPayee(payeeInputValue.trim())
                setShowPayeeInput(false)
              }}
              className="w-full px-4 py-3 text-left touch-manipulation border-t border-budget-divider"
            >
              <span className="text-budget-blue text-[15px]">
                Use &quot;{payeeInputValue.trim()}&quot;
              </span>
            </button>
          )}
        </PickerOverlay>
      )}
    </>
  )
}
