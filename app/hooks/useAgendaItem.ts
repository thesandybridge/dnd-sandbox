'use client'

import { useQueryClient } from '@tanstack/react-query'
import { mockContentStore, type BlockContent } from '@/app/hooks/useAgendaDetails'

export function useAgendaItem() {
  const queryClient = useQueryClient()

  const create = <T extends BlockContent>(item: T, blockId: string) => {
    const itemId = item.id

    // store item content by blockId
    queryClient.setQueryData<Map<string, BlockContent>>(['agenda-details'], (old) => {
      const map = new Map(old ?? [])
      map.set(blockId, item)
      return map
    })

    // store raw content (for fallback / hydration)
    mockContentStore.set(itemId, item)

    return itemId
  }

  return { create }
}
