'use client'

import { useEffect } from 'react'
import { useMockStore } from '@/store/mockStore'

/**
 * Triggers Zustand persist rehydration from localStorage on the client only.
 * Must be rendered inside the layout so it runs before any store-reading component.
 * skipHydration:true in the store prevents SSR from touching localStorage,
 * which fixes the React 19 "getServerSnapshot should be cached" infinite loop.
 */
export default function StoreHydration() {
  useEffect(() => {
    useMockStore.persist.rehydrate()
  }, [])

  return null
}
