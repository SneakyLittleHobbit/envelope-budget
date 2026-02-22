'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import { ACCOUNT_TYPE_LABELS } from '@/lib/types'
import type { AccountType } from '@/lib/types'
import { formatZAR, parseZARInput } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { FormField } from '@/components/form-field'
import { FormSection } from '@/components/form-section'
import { PickerOverlay, PickerRow } from '@/components/picker-overlay'

export default function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const account = useBudgetStore((s) => s.accounts.find((a) => a.id === id))
  const updateAccount = useBudgetStore((s) => s.updateAccount)

  const [name, setName] = useState(account?.name || '')
  const [accountType, setAccountType] = useState<AccountType>(account?.type || 'checking')
  const [showTypePicker, setShowTypePicker] = useState(false)
  const [monthlyPaymentStr, setMonthlyPaymentStr] = useState(
    account?.monthlyPayment ? String(account.monthlyPayment) : ''
  )
  const [interestRateStr, setInterestRateStr] = useState(
    account?.interestRate ? String(account.interestRate) : ''
  )

  if (!account) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-budget-text-secondary">Account not found</p>
      </div>
    )
  }

  const isDebt = accountType === 'credit_card' || accountType === 'debt'
  const canSave = name.trim()

  function handleSave() {
    if (!canSave) return
    updateAccount(id, {
      name: name.trim(),
      type: accountType,
      isOnBudget: !isDebt,
      ...(isDebt && {
        monthlyPayment: monthlyPaymentStr ? parseZARInput(monthlyPaymentStr) : undefined,
        interestRate: interestRateStr ? parseFloat(interestRateStr) : undefined,
      }),
    })
    router.back()
  }

  return (
    <>
      <AppHeader
        left={
          <button onClick={() => router.back()} className="text-budget-text touch-manipulation">
            <X className="h-5 w-5" />
          </button>
        }
        center="Edit Account"
        right={
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full touch-manipulation ${
              canSave ? 'bg-budget-green text-budget-bg' : 'bg-budget-card text-budget-text-secondary'
            }`}
          >
            Save
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <FormSection label={isDebt ? 'Debt' : 'Checking, Savings, Cash'}>
          <FormField label="Name" value={name} placeholder="Account Name" inputMode onChange={setName} />
          <FormField label="Account Type" value={ACCOUNT_TYPE_LABELS[accountType]} showChevron onTap={() => setShowTypePicker(true)} />
          <FormField label="Balance" value={formatZAR(account.balance)} rightAlign disabled />
        </FormSection>

        {isDebt && (
          <FormSection>
            <FormField label="Monthly Payment" value={monthlyPaymentStr} placeholder="Amount" inputMode inputType="text" onChange={setMonthlyPaymentStr} rightAlign />
            <FormField label="Interest Rate" value={interestRateStr} placeholder="APR%" inputMode inputType="text" onChange={setInterestRateStr} rightAlign />
          </FormSection>
        )}
      </div>

      {showTypePicker && (
        <PickerOverlay title="Account Type" onClose={() => setShowTypePicker(false)}>
          {(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(([key, label]) => (
            <PickerRow key={key} label={label} isSelected={accountType === key} onTap={() => { setAccountType(key); setShowTypePicker(false) }} />
          ))}
        </PickerOverlay>
      )}
    </>
  )
}
