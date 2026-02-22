'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import { ACCOUNT_TYPE_LABELS } from '@/lib/types'
import type { AccountType } from '@/lib/types'
import { parseZARInput } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { FormField } from '@/components/form-field'
import { FormSection } from '@/components/form-section'
import { PickerOverlay, PickerRow } from '@/components/picker-overlay'

export default function AddAccountPage() {
  const router = useRouter()
  const accounts = useBudgetStore((s) => s.accounts)
  const addAccount = useBudgetStore((s) => s.addAccount)

  const [name, setName] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('checking')
  const [balanceStr, setBalanceStr] = useState('')
  const [showTypePicker, setShowTypePicker] = useState(false)

  // Debt-specific fields
  const [monthlyPaymentStr, setMonthlyPaymentStr] = useState('')
  const [interestRateStr, setInterestRateStr] = useState('')

  const isDebt = accountType === 'credit_card' || accountType === 'debt'
  const canSave = name.trim() && balanceStr.trim()

  function handleSave() {
    if (!canSave) return
    addAccount({
      name: name.trim(),
      type: accountType,
      balance: parseZARInput(balanceStr),
      isOnBudget: !isDebt,
      sortOrder: accounts.length,
      ...(isDebt && {
        status: 'working_to_pay_off' as const,
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
        center="Add Account"
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
        <FormSection label={isDebt ? 'Debt' : 'Checking, Savings, Cash'}>
          <FormField label="Name" value={name} placeholder="Account Name" inputMode onChange={setName} />
          <FormField
            label="Account Type"
            value={ACCOUNT_TYPE_LABELS[accountType]}
            showChevron
            onTap={() => setShowTypePicker(true)}
          />
          <FormField
            label="Balance"
            value={balanceStr}
            placeholder="Current Balance"
            inputMode
            inputType="text"
            onChange={setBalanceStr}
            rightAlign
          />
        </FormSection>

        {isDebt && (
          <FormSection>
            <FormField
              label="Monthly Payment"
              value={monthlyPaymentStr}
              placeholder="Amount"
              inputMode
              inputType="text"
              onChange={setMonthlyPaymentStr}
              rightAlign
            />
            <FormField
              label="Interest Rate (Optional)"
              value={interestRateStr}
              placeholder="APR%"
              inputMode
              inputType="text"
              onChange={setInterestRateStr}
              rightAlign
            />
          </FormSection>
        )}
      </div>

      {showTypePicker && (
        <PickerOverlay title="Account Type" onClose={() => setShowTypePicker(false)}>
          {(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(([key, label]) => (
            <PickerRow
              key={key}
              label={label}
              isSelected={accountType === key}
              onTap={() => {
                setAccountType(key)
                setShowTypePicker(false)
              }}
            />
          ))}
        </PickerOverlay>
      )}
    </>
  )
}
