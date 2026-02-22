'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true once the Zustand persisted store has hydrated from localStorage.
 * Use this to prevent hydration mismatches on the first render.
 */
export function useStoreHydration(): boolean {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])
  return hydrated
}
