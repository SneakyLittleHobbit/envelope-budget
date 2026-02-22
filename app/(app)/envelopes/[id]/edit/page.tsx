'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import { ENVELOPE_FREQUENCY_LABELS } from '@/lib/types'
import type { EnvelopeFrequency } from '@/lib/types'
import { formatZAR, parseZARInput } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { FormField } from '@/components/form-field'
import { FormSection } from '@/components/form-section'
import { PickerOverlay, PickerRow } from '@/components/picker-overlay'

export default function EditEnvelopePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const envelope = useBudgetStore((s) => s.envelopes.find((e) => e.id === id))
  const envelopeGroups = useBudgetStore((s) => s.envelopeGroups)
  const updateEnvelope = useBudgetStore((s) => s.updateEnvelope)
  const addEnvelopeGroup = useBudgetStore((s) => s.addEnvelopeGroup)

  const [name, setName] = useState(envelope?.name || '')
  const [budgetStr, setBudgetStr] = useState(
    envelope ? formatZAR(envelope.budgetAmount).replace(/\s/g, '') : ''
  )
  const [groupId, setGroupId] = useState(envelope?.groupId || '')
  const [frequency, setFrequency] = useState<EnvelopeFrequency>(
    envelope?.frequency || 'monthly'
  )
  const [showGroupPicker, setShowGroupPicker] = useState(false)
  const [showFreqPicker, setShowFreqPicker] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroupInput, setShowNewGroupInput] = useState(false)

  if (!envelope) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-budget-text-secondary">Envelope not found</p>
      </div>
    )
  }

  const selectedGroup = envelopeGroups.find((g) => g.id === groupId)
  const canSave = name.trim() && budgetStr.trim() && groupId

  function handleSave() {
    if (!canSave) return
    updateEnvelope(id, {
      name: name.trim(),
      budgetAmount: parseZARInput(budgetStr),
      groupId,
      frequency,
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
        center="Edit Envelope"
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
        <FormSection>
          <FormField label="Name" value={name} placeholder="Envelope name" inputMode onChange={setName} />
          <FormField label="Budget" value={budgetStr} placeholder="0,00" inputMode inputType="text" onChange={setBudgetStr} rightAlign />
        </FormSection>
        <FormSection>
          <FormField label="Group" value={selectedGroup?.name || ''} placeholder="Select group" showChevron onTap={() => setShowGroupPicker(true)} />
          <FormField label="Frequency" value={ENVELOPE_FREQUENCY_LABELS[frequency]} showChevron onTap={() => setShowFreqPicker(true)} />
        </FormSection>
      </div>

      {showGroupPicker && (
        <PickerOverlay title="Group" onClose={() => { setShowGroupPicker(false); setShowNewGroupInput(false) }}>
          {envelopeGroups.map((g) => (
            <PickerRow key={g.id} label={g.name} isSelected={g.id === groupId} onTap={() => { setGroupId(g.id); setShowGroupPicker(false) }} />
          ))}
          {showNewGroupInput ? (
            <div className="px-4 py-3 border-b border-budget-divider">
              <div className="flex items-center gap-2">
                <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Group name" className="flex-1 bg-budget-card text-budget-text px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-budget-green" autoFocus />
                <button onClick={() => { if (newGroupName.trim()) { const nid = addEnvelopeGroup({ name: newGroupName.trim(), sortOrder: envelopeGroups.length }); setGroupId(nid); setShowGroupPicker(false); setShowNewGroupInput(false); setNewGroupName('') } }} className="text-budget-green text-sm font-medium touch-manipulation">Add</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewGroupInput(true)} className="w-full px-4 py-3 text-left touch-manipulation">
              <span className="text-budget-blue text-[15px]">+ New Group</span>
            </button>
          )}
        </PickerOverlay>
      )}

      {showFreqPicker && (
        <PickerOverlay title="Envelope Period" onClose={() => setShowFreqPicker(false)} onSave={() => setShowFreqPicker(false)} useX>
          {(Object.entries(ENVELOPE_FREQUENCY_LABELS) as [EnvelopeFrequency, string][]).map(([key, label]) => (
            <PickerRow key={key} label={label} isSelected={frequency === key} onTap={() => setFrequency(key)} />
          ))}
        </PickerOverlay>
      )}
    </>
  )
}
