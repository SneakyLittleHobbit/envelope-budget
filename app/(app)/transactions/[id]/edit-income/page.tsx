'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Mail, ChevronRight, Trash2 } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import { getEnvelopeBalance, getGroupedEnvelopes } from '@/lib/computed'
import { formatZAR, parseZARInput, formatDateShort } from '@/lib/format'
import type { EnvelopeFill } from '@/lib/types'
import { AppHeader } from '@/components/app-header'
import { FormField } from '@/components/form-field'
import { FormSection } from '@/components/form-section'
import { ProgressBar } from '@/components/progress-bar'
import { PickerOverlay, PickerRow } from '@/components/picker-overlay'
import { DatePicker } from '@/components/date-picker'
import { ConfirmDialog } from '@/components/confirm-dialog'

export default function EditIncomePage({
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

  // Initialize from existing transaction
  const [amountStr, setAmountStr] = useState(tx ? formatZAR(tx.amount).replace(/\s/g, '') : '')
  const [payer, setPayer] = useState(tx?.payer || '')
  const [accountId, setAccountId] = useState(tx?.accountId || '')
  const [dateStr, setDateStr] = useState(tx?.date || '')
  const [note, setNote] = useState(tx?.note || '')

  // Initialize fills from existing fills
  const initialFills: Record<string, { mode: 'none' | 'budget' | 'specific'; amount: number }> = {}
  if (tx?.fills) {
    for (const fill of tx.fills) {
      const env = envelopes.find((e) => e.id === fill.envelopeId)
      if (env) {
        const mode = fill.amount === env.budgetAmount ? 'budget' : 'specific'
        initialFills[fill.envelopeId] = { mode, amount: fill.amount }
      }
    }
  }
  const [fills, setFills] = useState(initialFills)

  const [showAccountPicker, setShowAccountPicker] = useState(false)
  const [showFillPicker, setShowFillPicker] = useState<string | null>(null)
  const [fillSpecificStr, setFillSpecificStr] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!tx) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-budget-text-secondary">Transaction not found</p>
      </div>
    )
  }

  const grouped = getGroupedEnvelopes(envelopeGroups, envelopes)
  const selectedAccount = accounts.find((a) => a.id === accountId)
  const totalIncome = parseZARInput(amountStr)
  const totalFilled = Object.values(fills).reduce((sum, f) => sum + f.amount, 0)
  const remaining = totalIncome - totalFilled
  const canSave = totalIncome > 0 && accountId

  function getFillForEnvelope(envId: string) {
    return fills[envId] || { mode: 'none', amount: 0 }
  }

  function setFillForEnvelope(envId: string, mode: 'none' | 'budget' | 'specific', amount: number) {
    setFills((prev) => ({ ...prev, [envId]: { mode, amount } }))
  }

  function handleSave() {
    if (!canSave) return
    const fillEntries: EnvelopeFill[] = Object.entries(fills)
      .filter(([, f]) => f.amount > 0)
      .map(([envId, f]) => ({ envelopeId: envId, amount: f.amount }))

    updateTransaction(id, {
      amount: totalIncome,
      payer: payer || 'Income',
      accountId,
      date: dateStr,
      fills: fillEntries.length > 0 ? fillEntries : undefined,
      note: note || undefined,
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

  return (
    <>
      <AppHeader
        left={<button onClick={() => router.back()} className="text-budget-text touch-manipulation" aria-label="Cancel"><X className="h-5 w-5" /></button>}
        center="Edit Income"
        right={
          <button onClick={handleSave} disabled={!canSave} className={`text-sm font-semibold px-4 py-1.5 rounded-full touch-manipulation ${canSave ? 'bg-budget-green text-white' : 'bg-budget-card text-budget-text-secondary'}`}>
            Save
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Step 1 */}
        <div className="px-4 py-3"><p className="text-budget-text-secondary text-xs text-center uppercase tracking-wide">Step 1</p><p className="text-budget-text text-center text-sm mt-1">Tell us about your income</p></div>
        <FormSection>
          <FormField label="Amount" value={amountStr} placeholder="0,00" inputMode inputType="text" onChange={setAmountStr} rightAlign />
          <FormField label="Payer" value={payer} placeholder="Income" inputMode onChange={setPayer} />
          <FormField label="Account" value={selectedAccount?.name || ''} placeholder="Select account" showChevron onTap={() => setShowAccountPicker(true)} />
          <DatePicker value={dateStr} onChange={setDateStr} />
        </FormSection>

        {/* Step 2 */}
        <div className="px-4 py-3 mt-4"><p className="text-budget-text-secondary text-xs text-center uppercase tracking-wide">Step 2</p><p className="text-budget-text text-center text-sm mt-1">Where do you want it to go?</p></div>
        <div className="flex justify-center px-4 py-4">
          <div className="bg-budget-card/80 border border-budget-green/30 rounded-xl px-8 py-5 flex flex-col items-center gap-2">
            <Mail className="h-8 w-8 text-budget-green" />
            <span className="text-budget-text font-medium">In my Envelopes</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="px-4 py-3 mt-2"><p className="text-budget-text-secondary text-xs text-center uppercase tracking-wide">Step 3</p><p className="text-budget-text text-center text-sm mt-1">{"Let's fill your envelopes"}</p></div>

        {grouped.map(({ group, envelopes: groupEnvs }) => (
          <div key={group.id}>
            <div className="px-4 py-1.5 bg-budget-section"><span className="text-budget-text-secondary text-xs uppercase tracking-wide">{group.name}</span></div>
            {groupEnvs.map((env) => {
              const balance = getEnvelopeBalance(env.id, transactions)
              const fill = getFillForEnvelope(env.id)
              const fillLabel = fill.mode === 'budget' ? `Add budget amount of ${formatZAR(env.budgetAmount)}` : fill.mode === 'specific' ? `Add specific ${formatZAR(fill.amount)}` : 'No Change'
              return (
                <button key={env.id} onClick={() => { setShowFillPicker(env.id); setFillSpecificStr(fill.mode === 'specific' ? formatZAR(fill.amount).replace(/\s/g, '') : formatZAR(env.budgetAmount).replace(/\s/g, '')) }} className="w-full px-4 py-2.5 border-b border-budget-divider touch-manipulation text-left active:bg-budget-card/50">
                  <div className="flex items-baseline justify-between">
                    <span className="text-budget-text text-[15px]">{env.name}</span>
                    <div className="flex items-center gap-1"><span className="text-budget-text text-[15px] tabular-nums font-medium">{formatZAR(balance + fill.amount)}</span><ChevronRight className="h-4 w-4 text-budget-text-secondary" /></div>
                  </div>
                  <div className="mt-1.5"><ProgressBar current={balance + fill.amount} budget={env.budgetAmount} /></div>
                  <div className="flex justify-between mt-0.5"><span className="text-budget-text-secondary text-xs">{fillLabel}</span><span className="text-budget-text-secondary text-xs tabular-nums">{formatZAR(env.budgetAmount)}</span></div>
                </button>
              )
            })}
          </div>
        ))}

        <div className="px-4 py-3 border-b border-budget-divider">
          <div className="flex items-baseline justify-between"><span className="text-budget-text font-medium">Sweep</span><span className="text-budget-text tabular-nums">[Available] {formatZAR(remaining)}</span></div>
          <p className="text-budget-text-secondary text-xs mt-0.5">Add the remaining {formatZAR(remaining)}</p>
        </div>

        <FormSection><FormField label="Note" value={note} inputMode onChange={setNote} /></FormSection>

        {/* Delete */}
        <div className="flex justify-center py-6">
          <button onClick={handleDelete} className="text-budget-red touch-manipulation" aria-label="Delete income transaction"><Trash2 className="h-6 w-6" /></button>
        </div>

        <div className="h-8" />
      </div>

      {showAccountPicker && (
        <PickerOverlay title="Account" onClose={() => setShowAccountPicker(false)}>
          {accounts.filter((a) => a.isOnBudget).map((acc) => (
            <PickerRow key={acc.id} label={`${acc.name} [${formatZAR(acc.balance)}]`} isSelected={acc.id === accountId} onTap={() => { setAccountId(acc.id); setShowAccountPicker(false) }} />
          ))}
        </PickerOverlay>
      )}

      {showFillPicker && (() => {
        const env = envelopes.find((e) => e.id === showFillPicker)
        if (!env) return null
        const fill = getFillForEnvelope(env.id)
        return (
          <PickerOverlay title={env.name} onClose={() => setShowFillPicker(null)} onSave={() => setShowFillPicker(null)}>
            <PickerRow label="No Change" isSelected={fill.mode === 'none'} onTap={() => setFillForEnvelope(env.id, 'none', 0)} />
            <PickerRow label={`Add Monthly Budget Amount ${formatZAR(env.budgetAmount)}`} isSelected={fill.mode === 'budget'} onTap={() => setFillForEnvelope(env.id, 'budget', env.budgetAmount)} />
            <PickerRow label="Add Specific Amount ..." isSelected={fill.mode === 'specific'} onTap={() => setFillForEnvelope(env.id, 'specific', parseZARInput(fillSpecificStr) || env.budgetAmount)} />
            {fill.mode === 'specific' && (
              <div className="px-4 py-3 mt-2">
                <div className="flex items-center justify-between bg-budget-card px-3 py-2.5 rounded-lg">
                  <span className="text-budget-text text-[15px]">Amount</span>
                  <input type="text" value={fillSpecificStr} onChange={(e) => { setFillSpecificStr(e.target.value); setFillForEnvelope(env.id, 'specific', parseZARInput(e.target.value)) }} className="bg-transparent text-budget-text text-[15px] text-right focus:outline-none w-32" autoFocus />
                </div>
              </div>
            )}
          </PickerOverlay>
        )
      })()}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Income Transaction?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  )
}
