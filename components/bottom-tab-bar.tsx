'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Wallet,
  ArrowLeftRight,
  Landmark,
  BarChart3,
  Settings,
} from 'lucide-react'

const tabs = [
  { href: '/envelopes', label: 'Envelopes', icon: Wallet },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/accounts', label: 'Accounts', icon: Landmark },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/more', label: 'More', icon: Settings },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-around bg-budget-bg/95 backdrop-blur-sm border-t border-budget-divider pb-[env(safe-area-inset-bottom)] shrink-0">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(tab.href + '/')
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 py-2.5 px-3 min-w-[64px] touch-manipulation transition-colors ${
              isActive ? 'text-budget-amber' : 'text-budget-text-secondary'
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
            <span className="text-[10px] font-medium">{tab.label}</span>
            {isActive && (
              <div className="absolute bottom-[env(safe-area-inset-bottom)] h-0.5 w-8 bg-budget-amber rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
