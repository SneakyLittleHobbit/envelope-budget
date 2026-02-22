'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Mail, ChevronRight, Trash2 } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import {
  getEnvelopeBalance,
  getGroupedEnvelopes,
  getAvailable,
} from '@/lib/computed'
import { formatZAR, parseZARInput, formatDateShort, todayISO } from '@/lib/format'
import type { EnvelopeFill } from '@/lib/types'
import { AppHeader } from '@/components/app-header'
import { FormField } from '@/components/form-field'
import { FormSection } from '@/components/form-section'
import { ProgressBar } from '@/components/progress-bar'
import { PickerOverlay, PickerRow } from '@/components/picker-overlay'
import { DatePicker } from '@/components/date-picker'

export default function AddIncomePage() {
  const router = useRouter()
  const envelopes = useBudgetStore((s) => s.envelopes)
  const envelopeGroups = useBudgetStore((s) => s.envelopeGroups)
  const accounts = useBudgetStore((s) => s.accounts)
  const transactions = useBudgetStore((s) => s.transactions)
  const addTransaction = useBudgetStore((s) => s.addTransaction)

  // Step 1: Income details
  const [amountStr, setAmountStr] = useState('')
  const [payer, setPayer] = useState('')
  const [accountId, setAccountId] = useState(accounts.find((a) => a.isOnBudget)?.id || '')
  const [dateStr, setDateStr] = useState(todayISO())
  const [note, setNote] = useState('')

  // Step 3: Fill data
  const [fills, setFills] = useState<Record<string, { mode: 'none' | 'budget' | 'specific'; amount: number }>>({})

  // Picker state
  const [showAccountPicker, setShowAccountPicker] = useState(false)
  const [showFillPicker, setShowFillPicker] = useState<string | null>(null)
  const [fillSpecificStr, setFillSpecificStr] = useState('')

  const grouped = getGroupedEnvelopes(envelopeGroups, envelopes)
  const selectedAccount = accounts.find((a) => a.id === accountId)
  const totalIncome = parseZARInput(amountStr)

  // Calculate fill amounts and remaining
  const totalFilled = Object.values(fills).reduce((sum, f) => sum + f.amount, 0)
  const remaining = totalIncome - totalFilled

  // Calculate what Available would be after this income
  const currentAvailable = getAvailable(accounts, envelopes, transactions)

  const canSave = totalIncome > 0 && accountId

  function handleSave() {
    if (!canSave) return
    const fillEntries: EnvelopeFill[] = Object.entries(fills)
      .filter(([, f]) => f.amount > 0)
      .map(([envId, f]) => ({ envelopeId: envId, amount: f.amount }))

    addTransaction({
      type: 'add_income',
      date: dateStr,
      amount: totalIncome,
      payer: payer || 'Income',
      accountId,
      isScheduled: false,
      fills: fillEntries.length > 0 ? fillEntries : undefined,
      note: note || undefined,
    })
    router.back()
  }

  function getFillForEnvelope(envId: string) {
    return fills[envId] || { mode: 'none', amount: 0 }
  }

  function setFillForEnvelope(envId: string, mode: 'none' | 'budget' | 'specific', amount: number) {
    setFills((prev) => ({
      ...prev,
      [envId]: { mode, amount },
    }))
  }

  return (
    <>
      <AppHeader
        left={
          <button onClick={() => router.back()} className="text-budget-text touch-manipulation">
            <X className="h-5 w-5" />
          </button>
        }
        center="Add Income"
        right={
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full touch-manipulation ${
              canSave ? 'bg-budget-green text-white' : 'bg-budget-card text-budget-text-secondary'
            }`}
          >
            Save
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Step 1 */}
        <div className="px-4 py-3">
          <p className="text-budget-text-secondary text-xs text-center uppercase tracking-wide">Step 1</p>
          <p className="text-budget-text text-center text-sm mt-1">Tell us about your income</p>
        </div>

        <FormSection>
          <FormField label="Amount" value={amountStr} placeholder="0,00" inputMode inputType="text" onChange={setAmountStr} rightAlign />
          <FormField label="Payer" value={payer} placeholder="Income" inputMode onChange={setPayer} />
          <FormField label="Account" value={selectedAccount?.name || ''} placeholder="Select account" showChevron onTap={() => setShowAccountPicker(true)} />
          <DatePicker value={dateStr} onChange={setDateStr} />
        </FormSection>

        {/* Step 2 */}
        <div className="px-4 py-3 mt-4">
          <p className="text-budget-text-secondary text-xs text-center uppercase tracking-wide">Step 2</p>
          <p className="text-budget-text text-center text-sm mt-1">Where do you want it to go?</p>
        </div>

        <div className="flex justify-center px-4 py-4">
          <div className="bg-budget-card/80 border border-budget-green/30 rounded-xl px-8 py-5 flex flex-col items-center gap-2">
            <Mail className="h-8 w-8 text-budget-green" />
            <span className="text-budget-text font-medium">In my Envelopes</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="px-4 py-3 mt-2">
          <p className="text-budget-text-secondary text-xs text-center uppercase tracking-wide">Step 3</p>
          <p className="text-budget-text text-center text-sm mt-1">{"Let's fill your envelopes"}</p>
        </div>

        {/* Envelope fill rows */}
        {grouped.map(({ group, envelopes: groupEnvs }) => (
          <div key={group.id}>
            <div className="px-4 py-1.5 bg-budget-section">
              <span className="text-budget-text-secondary text-xs uppercase tracking-wide">{group.name}</span>
            </div>
            {groupEnvs.map((env) => {
              const balance = getEnvelopeBalance(env.id, transactions)
              const fill = getFillForEnvelope(env.id)
              const fillLabel =
                fill.mode === 'budget'
                  ? `Add budget amount of ${formatZAR(env.budgetAmount)}`
                  : fill.mode === 'specific'
                    ? `Add specific ${formatZAR(fill.amount)}`
                    : 'No Change'

              return (
                <button
                  key={env.id}
                  onClick={() => {
                    setShowFillPicker(env.id)
                    setFillSpecificStr(fill.mode === 'specific' ? formatZAR(fill.amount).replace(/\s/g, '') : formatZAR(env.budgetAmount).replace(/\s/g, ''))
                  }}
                  className="w-full px-4 py-2.5 border-b border-budget-divider touch-manipulation text-left active:bg-budget-card/50"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-budget-text text-[15px]">{env.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-budget-text text-[15px] tabular-nums font-medium">{formatZAR(balance + fill.amount)}</span>
                      <ChevronRight className="h-4 w-4 text-budget-text-secondary" />
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar current={balance + fill.amount} budget={env.budgetAmount} />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-budget-text-secondary text-xs">{fillLabel}</span>
                    <span className="text-budget-text-secondary text-xs tabular-nums">{formatZAR(env.budgetAmount)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        ))}

        {/* Sweep row */}
        <div className="px-4 py-3 border-b border-budget-divider">
          <div className="flex items-baseline justify-between">
            <span className="text-budget-text font-medium">Sweep</span>
            <span className="text-budget-text tabular-nums">
              [Available] {formatZAR(remaining)}
            </span>
          </div>
          <p className="text-budget-text-secondary text-xs mt-0.5">
            Add the remaining {formatZAR(remaining)}
          </p>
        </div>

        {/* Note */}
        <FormSection>
          <FormField label="Note" value={note} inputMode onChange={setNote} />
        </FormSection>

        <div className="h-8" />
      </div>

      {/* Account Picker */}
      {showAccountPicker && (
        <PickerOverlay title="Account" onClose={() => setShowAccountPicker(false)}>
          {accounts.filter((a) => a.isOnBudget).map((acc) => (
            <PickerRow key={acc.id} label={`${acc.name} [${formatZAR(acc.balance)}]`} isSelected={acc.id === accountId} onTap={() => { setAccountId(acc.id); setShowAccountPicker(false) }} />
          ))}
        </PickerOverlay>
      )}

      {/* Envelope Fill Sub-screen */}
      {showFillPicker && (() => {
        const env = envelopes.find((e) => e.id === showFillPicker)
        if (!env) return null
        const fill = getFillForEnvelope(env.id)

        return (
          <PickerOverlay
            title={env.name}
            onClose={() => setShowFillPicker(null)}
            onSave={() => setShowFillPicker(null)}
          >
            <PickerRow
              label="No Change"
              isSelected={fill.mode === 'none'}
              onTap={() => {
                setFillForEnvelope(env.id, 'none', 0)
              }}
            />
            <PickerRow
              label={`Add Monthly Budget Amount ${formatZAR(env.budgetAmount)}`}
              isSelected={fill.mode === 'budget'}
              onTap={() => {
                setFillForEnvelope(env.id, 'budget', env.budgetAmount)
              }}
            />
            <PickerRow
              label="Add Specific Amount ..."
              isSelected={fill.mode === 'specific'}
              onTap={() => {
                setFillForEnvelope(env.id, 'specific', parseZARInput(fillSpecificStr) || env.budgetAmount)
              }}
            />
            {fill.mode === 'specific' && (
              <div className="px-4 py-3 mt-2">
                <div className="flex items-center justify-between bg-budget-card px-3 py-2.5 rounded-lg">
                  <span className="text-budget-text text-[15px]">Amount</span>
                  <input
                    type="text"
                    value={fillSpecificStr}
                    onChange={(e) => {
                      setFillSpecificStr(e.target.value)
                      setFillForEnvelope(env.id, 'specific', parseZARInput(e.target.value))
                    }}
                    className="bg-transparent text-budget-text text-[15px] text-right focus:outline-none w-32"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </PickerOverlay>
        )
      })()}
    </>
  )
}
