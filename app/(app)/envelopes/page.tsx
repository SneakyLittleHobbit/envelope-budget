'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useBudgetStore } from '@/lib/store'
import { getGroupedEnvelopes } from '@/lib/computed'
import { formatZAR } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { EnvelopeGroup } from '@/components/envelope-group'
import { LeafDivider } from '@/components/leaf-divider'
import { useEnvelopeBalances } from '@/hooks/use-envelope-balances'

export default function EnvelopesPage() {
  const envelopeGroups = useBudgetStore((s) => s.envelopeGroups)
  const envelopes = useBudgetStore((s) => s.envelopes)
  const transactions = useBudgetStore((s) => s.transactions)
  const accounts = useBudgetStore((s) => s.accounts)

  // Use memoized envelope balances
  const balances = useEnvelopeBalances(envelopes, transactions)
  
  // Memoize derived values
  const allTotal = useMemo(() => 
    Object.values(balances).reduce((sum, b) => sum + b, 0),
    [balances]
  )
  
  const available = useMemo(() => {
    const accountTotal = accounts
      .filter((a) => a.isOnBudget)
      .reduce((sum, a) => sum + a.balance, 0)
    return accountTotal - allTotal
  }, [accounts, allTotal])
  
  const grouped = getGroupedEnvelopes(envelopeGroups, envelopes)

  return (
    <>
      <AppHeader
        left={
          <Link
            href="/envelopes/edit-budget"
            className="text-budget-text text-sm font-medium touch-manipulation"
          >
            Edit
          </Link>
        }
        center="Envelopes"
        right={
          <Link
            href="/envelopes/add"
            className="text-budget-amber touch-manipulation"
            aria-label="Add envelope"
          >
            <Plus className="h-5 w-5" />
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* All Envelopes total */}
        <div className="flex justify-end px-4 py-1.5">
          <span className="text-budget-text-secondary text-xs tabular-nums">
            All Envelopes: {formatZAR(allTotal)}
          </span>
        </div>

        {/* Grouped envelopes */}
        {grouped.map(({ group, envelopes: groupEnvs }) => {
          // Calculate group total from memoized balances
          const groupTotal = groupEnvs.reduce((sum, env) => sum + (balances[env.id] || 0), 0)
          return (
            <EnvelopeGroup
              key={group.id}
              groupName={group.name}
              groupTotal={groupTotal}
              envelopes={groupEnvs}
              balances={balances}
            />
          )
        })}

        {/* Available row */}
        <LeafDivider />
        <div className="flex items-baseline justify-between px-4 py-4 mt-2 border-t border-budget-divider">
          <span className="text-budget-text font-serif font-bold text-lg">Available</span>
          <span className="text-budget-amber font-bold text-lg tabular-nums">
            {formatZAR(available)}
          </span>
        </div>
      </div>
    </>
  )
}
