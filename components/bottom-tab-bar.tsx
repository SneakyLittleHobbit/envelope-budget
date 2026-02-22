'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Mail,
  List,
  Landmark,
  Clock,
  MoreHorizontal,
} from 'lucide-react'

const tabs = [
  { href: '/envelopes', label: 'Envelopes', icon: Mail },
  { href: '/transactions', label: 'Transactions', icon: List },
  { href: '/accounts', label: 'Accounts', icon: Landmark },
  { href: '/reports', label: 'Reports', icon: Clock },
  { href: '/more', label: 'More', icon: MoreHorizontal },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-around bg-budget-bg border-t border-budget-divider pb-[env(safe-area-inset-bottom)] shrink-0">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(tab.href + '/')
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[64px] touch-manipulation ${
              isActive ? 'text-budget-green' : 'text-budget-text-secondary'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
