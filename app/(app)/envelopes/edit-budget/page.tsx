'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MinusCircle, GripVertical, ChevronRight } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import { getGroupedEnvelopes, getTotalBudgeted } from '@/lib/computed'
import { formatZAR, parseZARInput } from '@/lib/format'
import { ENVELOPE_FREQUENCY_LABELS } from '@/lib/types'
import type { EnvelopeFrequency } from '@/lib/types'
import { AppHeader } from '@/components/app-header'
import { PickerOverlay, PickerRow } from '@/components/picker-overlay'
import { ConfirmDialog } from '@/components/confirm-dialog'

export default function EditBudgetPage() {
  const router = useRouter()
  const envelopeGroups = useBudgetStore((s) => s.envelopeGroups)
  const envelopes = useBudgetStore((s) => s.envelopes)
  const deleteEnvelope = useBudgetStore((s) => s.deleteEnvelope)
  const updateEnvelope = useBudgetStore((s) => s.updateEnvelope)

  const [filterFreq, setFilterFreq] = useState<EnvelopeFrequency | null>(null)
  const [showFreqPicker, setShowFreqPicker] = useState(false)
  const [editingBudgets, setEditingBudgets] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const grouped = getGroupedEnvelopes(envelopeGroups, envelopes)
  const displayFreq = filterFreq || 'monthly'
  const totalBudgeted = getTotalBudgeted(envelopes, filterFreq)

  function handleDeleteClick(id: string, name: string) {
    setDeleteTarget({ id, name })
  }

  function confirmDelete() {
    if (deleteTarget) {
      deleteEnvelope(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  function handleBudgetChange(envId: string, value: string) {
    setEditingBudgets((prev) => ({ ...prev, [envId]: value }))
  }

  function handleBudgetBlur(envId: string) {
    const val = editingBudgets[envId]
    if (val !== undefined) {
      const num = parseZARInput(val)
      updateEnvelope(envId, { budgetAmount: num })
      setEditingBudgets((prev) => {
        const next = { ...prev }
        delete next[envId]
        return next
      })
    }
  }

  return (
    <>
      <AppHeader
        left={<div className="min-w-[60px]" />}
        center="Edit Budget"
        right={
          <button
            onClick={() => router.back()}
            className="text-budget-text text-sm font-medium touch-manipulation"
          >
            Done
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {grouped.map(({ group, envelopes: groupEnvs }) => (
          <div key={group.id}>
            {/* Group header */}
            <div className="px-4 py-2 bg-budget-section">
              <span className="text-budget-text-secondary text-xs uppercase tracking-wide">
                {group.name}
              </span>
            </div>

            {groupEnvs.map((env) => {
              const editVal = editingBudgets[env.id]
              const displayBudget =
                editVal !== undefined
                  ? editVal
                  : formatZAR(env.budgetAmount).replace(/\s/g, '')

              return (
                <div
                  key={env.id}
                  className="flex items-center px-2 py-2.5 border-b border-budget-divider"
                >
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteClick(env.id, env.name)}
                    className="mr-2 text-budget-red-delete touch-manipulation p-1"
                    aria-label={`Delete ${env.name}`}
                  >
                    <MinusCircle className="h-5 w-5" />
                  </button>

                  {/* Envelope name (tap to edit) */}
                  <Link
                    href={`/envelopes/${env.id}/edit`}
                    className="flex-1 text-budget-text text-[15px] truncate touch-manipulation"
                  >
                    {env.name}
                  </Link>

                  {/* Budget amount (inline editable) */}
                  <input
                    type="text"
                    value={displayBudget}
                    onChange={(e) => handleBudgetChange(env.id, e.target.value)}
                    onBlur={() => handleBudgetBlur(env.id)}
                    className="w-24 bg-transparent text-budget-text text-[15px] text-right tabular-nums focus:outline-none focus:border-b focus:border-budget-green"
                  />

                  {/* Drag handle */}
                  <GripVertical className="ml-2 h-5 w-5 text-budget-text-secondary shrink-0" />
                </div>
              )
            })}
          </div>
        ))}

        {/* Add Envelope link */}
        <Link
          href="/envelopes/add"
          className="block px-4 py-3 touch-manipulation"
        >
          <span className="text-budget-blue text-[15px]">+ Add Envelope</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-budget-section border-t border-budget-divider shrink-0">
        <button
          onClick={() => setShowFreqPicker(true)}
          className="flex items-center gap-1 text-budget-text text-sm touch-manipulation"
        >
          {ENVELOPE_FREQUENCY_LABELS[displayFreq]}
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="text-sm">
          <span className="text-budget-text">Total Budgeted </span>
          <span className="text-budget-positive font-semibold tabular-nums">
            {formatZAR(totalBudgeted)}
          </span>
        </div>
      </div>

      {/* Frequency filter picker */}
      {showFreqPicker && (
        <PickerOverlay
          title="Budget Period"
          onClose={() => setShowFreqPicker(false)}
        >
          <PickerRow
            label="All"
            isSelected={filterFreq === null}
            onTap={() => {
              setFilterFreq(null)
              setShowFreqPicker(false)
            }}
          />
          {(
            Object.entries(ENVELOPE_FREQUENCY_LABELS) as [
              EnvelopeFrequency,
              string,
            ][]
          ).map(([key, label]) => (
            <PickerRow
              key={key}
              label={label}
              isSelected={filterFreq === key}
              onTap={() => {
                setFilterFreq(key)
                setShowFreqPicker(false)
              }}
            />
          ))}
        </PickerOverlay>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  )
}
