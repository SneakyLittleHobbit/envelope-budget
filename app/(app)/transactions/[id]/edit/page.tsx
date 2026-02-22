'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Trash2 } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import {
  TRANSACTION_TYPE_LABELS,
  SCHEDULE_FREQUENCY_LABELS,
} from '@/lib/types'
import type { TransactionType, ScheduleFrequency } from '@/lib/types'
import { formatZAR, formatDateShort, parseZARInput } from '@/lib/format'
import { getEnvelopeBalance, getGroupedEnvelopes } from '@/lib/computed'
import { AppHeader } from '@/components/app-header'
import { FormField } from '@/components/form-field'
import { FormSection } from '@/components/form-section'
import { PickerOverlay, PickerRow } from '@/components/picker-overlay'
import { DatePicker } from '@/components/date-picker'
import { ConfirmDialog } from '@/components/confirm-dialog'

export default function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const tx = useBudgetStore((s) => s.transactions.find((t) => t.id === id))
  const envelopes = useBudgetStore((s) => s.envelopes)
  const envelopeGroups = useBudgetStore((s) => s.envelopeGroups)
  const accounts = useBudgetStore((s) => s.accounts)
  const transactions = useBudgetStore((s) => s.transactions)
  const updateTransaction = useBudgetStore((s) => s.updateTransaction)
  const deleteTransaction = useBudgetStore((s) => s.deleteTransaction)

  // Redirect add_income transactions to the income edit page
  useEffect(() => {
    if (tx?.type === 'add_income') {
      router.replace(`/transactions/${id}/edit-income`)
    }
  }, [tx?.type, router, id])

  const [txType, setTxType] = useState<TransactionType>(tx?.type || 'expense')
  const [payee, setPayee] = useState(tx?.payee || '')
  const [amountStr, setAmountStr] = useState(tx ? formatZAR(tx.amount).replace(/\s/g, '') : '')
  const [envelopeId, setEnvelopeId] = useState(tx?.envelopeId || '')
  const [accountId, setAccountId] = useState(tx?.accountId || '')
  const [fromEnvelopeId, setFromEnvelopeId] = useState(tx?.fromEnvelopeId || '')
  const [toEnvelopeId, setToEnvelopeId] = useState(tx?.toEnvelopeId || '')
  const [fromAccountId, setFromAccountId] = useState(tx?.fromAccountId || '')
  const [toAccountId, setToAccountId] = useState(tx?.toAccountId || '')
  const [debtAccountId, setDebtAccountId] = useState(tx?.debtAccountId || '')
  const [dateStr, setDateStr] = useState(tx?.date || '')
  const [scheduleFreq, setScheduleFreq] = useState<ScheduleFrequency>(
    tx?.scheduleFrequency || 'never'
  )
  const [checkNum, setCheckNum] = useState(tx?.checkNum || '')
  const [note, setNote] = useState(tx?.note || '')
  const [isCredit, setIsCredit] = useState(tx?.isCredit || false)

  const [showTypePicker, setShowTypePicker] = useState(false)
  const [showEnvelopePicker, setShowEnvelopePicker] = useState<string | null>(null)
  const [showAccountPicker, setShowAccountPicker] = useState<string | null>(null)
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  const [showPayeeInput, setShowPayeeInput] = useState(false)
  const [payeeInputValue, setPayeeInputValue] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!tx) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-budget-text-secondary">Transaction not found</p>
      </div>
    )
  }

  const selectedEnvelope = envelopes.find((e) => e.id === envelopeId)
  const selectedAccount = accounts.find((a) => a.id === accountId)
  const fromEnvelope = envelopes.find((e) => e.id === fromEnvelopeId)
  const toEnvelope = envelopes.find((e) => e.id === toEnvelopeId)
  const fromAccount = accounts.find((a) => a.id === fromAccountId)
  const toAccount = accounts.find((a) => a.id === toAccountId)
  const debtAccount = accounts.find((a) => a.id === debtAccountId)
  const grouped = getGroupedEnvelopes(envelopeGroups, envelopes)

  const previousPayees = [...new Set(transactions.filter((t) => t.payee).map((t) => t.payee!))]

  function canSave(): boolean {
    const amount = parseZARInput(amountStr)
    if (!amount) return false
    switch (txType) {
      case 'expense': return !!(envelopeId && accountId)
      case 'add_income': return !!accountId
      case 'fill_from_available': return !!envelopeId
      case 'envelope_transfer': return !!(fromEnvelopeId && toEnvelopeId && fromEnvelopeId !== toEnvelopeId)
      case 'account_transfer': return !!(fromAccountId && toAccountId && fromAccountId !== toAccountId)
      case 'debt_payment': return !!(accountId && debtAccountId)
      case 'interest_fee_charge': return !!debtAccountId
      default: return false
    }
  }

  function handleSave() {
    if (!canSave()) return
    const amount = parseZARInput(amountStr)

    // Handle fill_from_available with fills array
    if (txType === 'fill_from_available') {
      updateTransaction(id, {
        type: 'fill_from_available',
        date: dateStr,
        amount,
        fills: [{ envelopeId, amount }],
        note: note || undefined,
        isScheduled: scheduleFreq !== 'never',
        scheduleFrequency: scheduleFreq !== 'never' ? scheduleFreq : undefined,
      })
      router.back()
      return
    }

    updateTransaction(id, {
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

  function handleDelete() {
    setShowDeleteConfirm(true)
  }

  function confirmDelete() {
    deleteTransaction(id)
    router.back()
  }

  const saveable = canSave()

  return (
    <>
      <AppHeader
        left={
          <button onClick={() => router.back()} className="text-budget-text touch-manipulation" aria-label="Cancel">
            <X className="h-5 w-5" />
          </button>
        }
        center="Edit Transaction"
        right={
          <button
            onClick={handleSave}
            disabled={!saveable}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full touch-manipulation ${
              saveable ? 'bg-budget-green text-budget-bg' : 'bg-budget-card text-budget-text-secondary'
            }`}
          >
            Save
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <FormSection>
          <FormField label="Type" value={TRANSACTION_TYPE_LABELS[txType]} showChevron onTap={() => setShowTypePicker(true)} />
        </FormSection>

        <FormSection>
          {txType === 'expense' && (
            <FormField label="Payee" value={payee} placeholder="Who received payment?" showChevron onTap={() => { setPayeeInputValue(payee); setShowPayeeInput(true) }} />
          )}
          <FormField label="Amount" value={amountStr} placeholder="0,00" inputMode inputType="text" onChange={setAmountStr} rightAlign />
          {(txType === 'expense' || txType === 'fill_from_available') && (
            <FormField label="Envelope" value={selectedEnvelope?.name || ''} placeholder="Select envelope" showChevron onTap={() => setShowEnvelopePicker('envelope')} />
          )}
          {(txType === 'expense' || txType === 'debt_payment') && (
            <FormField label="Account" value={selectedAccount?.name || ''} placeholder="Select account" showChevron onTap={() => setShowAccountPicker('account')} />
          )}
          {txType === 'envelope_transfer' && (
            <>
              <FormField label="From" value={fromEnvelope?.name || ''} placeholder="Select envelope" showChevron onTap={() => setShowEnvelopePicker('from')} />
              <FormField label="To" value={toEnvelope?.name || ''} placeholder="Select envelope" showChevron onTap={() => setShowEnvelopePicker('to')} />
            </>
          )}
          {txType === 'account_transfer' && (
            <>
              <FormField label="From" value={fromAccount?.name || ''} placeholder="Select account" showChevron onTap={() => setShowAccountPicker('from')} />
              <FormField label="To" value={toAccount?.name || ''} placeholder="Select account" showChevron onTap={() => setShowAccountPicker('to')} />
            </>
          )}
          {(txType === 'debt_payment' || txType === 'interest_fee_charge') && (
            <FormField label="Debt Account" value={debtAccount?.name || ''} placeholder="Select debt account" showChevron onTap={() => setShowAccountPicker('debt')} />
          )}
        </FormSection>

        <FormSection label="Details">
          <DatePicker value={dateStr} onChange={setDateStr} />
          <FormField label="Schedule..." value={SCHEDULE_FREQUENCY_LABELS[scheduleFreq]} showChevron onTap={() => setShowSchedulePicker(true)} />
          {txType === 'expense' && <FormField label="Check Num" value={checkNum} inputMode onChange={setCheckNum} />}
          <FormField label="Note" value={note} inputMode onChange={setNote} />
          {txType === 'expense' && (
            <FormField label="Expense/Credit" value={isCredit ? 'Credit' : 'Expense'} showChevron onTap={() => setIsCredit(!isCredit)} />
          )}
        </FormSection>

        {/* Delete button */}
        <div className="flex justify-center py-6">
          <button onClick={handleDelete} className="text-budget-red touch-manipulation" aria-label="Delete transaction">
            <Trash2 className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Pickers (same as Add Transaction) */}
      {showTypePicker && (
        <PickerOverlay title="Select Type" onClose={() => setShowTypePicker(false)}>
          <PickerRow label="Expense" isSelected={txType === 'expense'} onTap={() => { setTxType('expense'); setShowTypePicker(false) }} />
          <PickerRow label="Add Income" isSelected={txType === 'add_income'} onTap={() => { setTxType('add_income'); setShowTypePicker(false) }} />
          <PickerRow label="Fill From Available" isSelected={txType === 'fill_from_available'} onTap={() => { setTxType('fill_from_available'); setShowTypePicker(false) }} />
          <div className="px-4 py-1.5 bg-budget-section"><span className="text-budget-text-secondary text-xs uppercase tracking-wide">Transfers</span></div>
          <PickerRow label="Envelope Transfer" isSelected={txType === 'envelope_transfer'} onTap={() => { setTxType('envelope_transfer'); setShowTypePicker(false) }} />
          <PickerRow label="Account Transfer" isSelected={txType === 'account_transfer'} onTap={() => { setTxType('account_transfer'); setShowTypePicker(false) }} />
          <div className="px-4 py-1.5 bg-budget-section"><span className="text-budget-text-secondary text-xs uppercase tracking-wide">Debt</span></div>
          <PickerRow label="Debt Payment" isSelected={txType === 'debt_payment'} onTap={() => { setTxType('debt_payment'); setShowTypePicker(false) }} />
          <PickerRow label="Interest, Fee, or New Charge" isSelected={txType === 'interest_fee_charge'} onTap={() => { setTxType('interest_fee_charge'); setShowTypePicker(false) }} />
        </PickerOverlay>
      )}

      {showEnvelopePicker && (
        <PickerOverlay title="Envelope" onClose={() => setShowEnvelopePicker(null)}>
          <PickerRow label="--Split to Multiple--" disabled sublabel="Coming in v2" onTap={() => {}} className="italic" />
          {grouped.map(({ group, envelopes: groupEnvs }) => (
            <div key={group.id}>
              <div className="px-4 py-1.5 bg-budget-section"><span className="text-budget-text-secondary text-xs uppercase tracking-wide">{group.name}</span></div>
              {groupEnvs.map((env) => {
                const bal = getEnvelopeBalance(env.id, transactions)
                const currentSel = showEnvelopePicker === 'envelope' ? envelopeId : showEnvelopePicker === 'from' ? fromEnvelopeId : toEnvelopeId
                return (
                  <PickerRow key={env.id} label={`${env.name} [${formatZAR(bal)}]`} isSelected={env.id === currentSel} onTap={() => {
                    if (showEnvelopePicker === 'envelope') setEnvelopeId(env.id)
                    else if (showEnvelopePicker === 'from') setFromEnvelopeId(env.id)
                    else setToEnvelopeId(env.id)
                    setShowEnvelopePicker(null)
                  }} />
                )
              })}
            </div>
          ))}
        </PickerOverlay>
      )}

      {showAccountPicker && (
        <PickerOverlay title="Account" onClose={() => setShowAccountPicker(null)}>
          {accounts.filter((a) => showAccountPicker === 'debt' ? (a.type === 'debt' || a.type === 'credit_card') : a.isOnBudget).map((acc) => {
            const currentSel = showAccountPicker === 'account' ? accountId : showAccountPicker === 'from' ? fromAccountId : showAccountPicker === 'to' ? toAccountId : debtAccountId
            return (
              <PickerRow key={acc.id} label={`${acc.name} [${formatZAR(acc.balance)}]`} isSelected={acc.id === currentSel} onTap={() => {
                if (showAccountPicker === 'account') setAccountId(acc.id)
                else if (showAccountPicker === 'from') setFromAccountId(acc.id)
                else if (showAccountPicker === 'to') setToAccountId(acc.id)
                else setDebtAccountId(acc.id)
                setShowAccountPicker(null)
              }} />
            )
          })}
        </PickerOverlay>
      )}

      {showSchedulePicker && (
        <PickerOverlay title="Schedule This" onClose={() => setShowSchedulePicker(false)} onSave={() => setShowSchedulePicker(false)} useX>
          {(Object.entries(SCHEDULE_FREQUENCY_LABELS) as [ScheduleFrequency, string][]).map(([key, label]) => (
            <PickerRow key={key} label={label} isSelected={scheduleFreq === key} onTap={() => setScheduleFreq(key)} />
          ))}
        </PickerOverlay>
      )}

      {showPayeeInput && (
        <PickerOverlay title="Payee" onClose={() => setShowPayeeInput(false)}>
          <div className="px-4 py-3">
            <input type="text" value={payeeInputValue} onChange={(e) => setPayeeInputValue(e.target.value)} placeholder="Who received payment?" className="w-full bg-budget-card text-budget-text px-3 py-2.5 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-budget-green" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') { setPayee(payeeInputValue); setShowPayeeInput(false) } }} />
          </div>
          {previousPayees.filter((p) => p.toLowerCase().includes(payeeInputValue.toLowerCase())).map((p) => (
            <PickerRow key={p} label={p} onTap={() => { setPayee(p); setShowPayeeInput(false) }} />
          ))}
          {payeeInputValue.trim() && (
            <button onClick={() => { setPayee(payeeInputValue.trim()); setShowPayeeInput(false) }} className="w-full px-4 py-3 text-left touch-manipulation border-t border-budget-divider">
              <span className="text-budget-blue text-[15px]">Use &quot;{payeeInputValue.trim()}&quot;</span>
            </button>
          )}
        </PickerOverlay>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Transaction?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  )
}
