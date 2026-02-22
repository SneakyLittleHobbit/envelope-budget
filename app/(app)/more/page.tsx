'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import { AppHeader } from '@/components/app-header'
import { ConfirmDialog } from '@/components/confirm-dialog'

export default function MorePage() {
  const household = useBudgetStore((s) => s.household)
  const updateHouseholdName = useBudgetStore((s) => s.updateHouseholdName)
  const clearAllData = useBudgetStore((s) => s.clearAllData)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(household.name)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  return (
    <>
      <AppHeader center="More" />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Household Name */}
        {editingName ? (
          <div className="px-4 py-3 border-b border-budget-divider">
            <label className="text-budget-text-secondary text-xs mb-1 block">
              Household Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="flex-1 bg-budget-card text-budget-text px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-budget-green"
                autoFocus
              />
              <button
                onClick={() => {
                  updateHouseholdName(nameValue)
                  setEditingName(false)
                }}
                className="text-budget-green text-sm font-medium touch-manipulation"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center justify-between w-full px-4 py-3 border-b border-budget-divider touch-manipulation"
          >
            <span className="text-budget-text text-[15px]">
              Household Name
            </span>
            <span className="flex items-center gap-1 text-budget-text-secondary text-[15px]">
              {household.name}
              <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        )}

        {/* Currency info */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-budget-divider">
          <span className="text-budget-text text-[15px]">Currency</span>
          <span className="text-budget-text-secondary text-[15px]">
            ZAR (South African Rand)
          </span>
        </div>

        {/* Clear All Data */}
        <button
          onClick={() => setShowClearConfirm(true)}
          className="w-full px-4 py-3 text-left border-b border-budget-divider touch-manipulation"
        >
          <span className="text-budget-red text-[15px]">Clear All Data</span>
        </button>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Clear All Data?"
        description="Are you sure you want to clear all data? This cannot be undone."
        confirmLabel="Clear"
        onConfirm={clearAllData}
        variant="destructive"
      />
    </>
  )
}
