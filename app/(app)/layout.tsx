'use client'

import { BottomTabBar } from '@/components/bottom-tab-bar'
import { ErrorBoundary } from '@/components/error-boundary'
import { useStoreHydration } from '@/lib/use-store-hydration'

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hydrated = useStoreHydration()

  if (!hydrated) {
    return (
      <div className="flex flex-col h-dvh max-w-md mx-auto bg-budget-bg">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-budget-green border-t-transparent rounded-full animate-spin" />
            <span className="text-budget-text-secondary text-xs font-serif tracking-wide">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-budget-bg bg-botanical">
      <ErrorBoundary>
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </ErrorBoundary>
      <BottomTabBar />
    </div>
  )
}
