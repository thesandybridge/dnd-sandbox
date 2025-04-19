'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { BlockContent } from '@/app/hooks/useAgendaDetails'
import { useBlocks } from '../providers/BlockProvider'

export function useSyncAgendaContent() {
  const queryClient = useQueryClient()
  const { lastCreatedItem, lastDeletedIds } = useBlocks()

  useEffect(() => {
    if (!lastCreatedItem) return

    queryClient.setQueryData<Map<string, BlockContent>>(['agenda-details'], (old) => {
      const map = new Map(old ?? [])
      let content: BlockContent

      switch (lastCreatedItem.type) {
        case 'section':
          content = {
            type: 'section',
            title: `SECTION ${lastCreatedItem.id.slice(0, 4)}`,
            summary: ''
          }
          break
        case 'topic':
          content = {
            type: 'topic',
            title: `TOPIC ${lastCreatedItem.id.slice(0, 4)}`,
            description: ''
          }
          break
        case 'objective':
          content = {
            type: 'objective',
            title: `OBJECTIVE ${lastCreatedItem.id.slice(0, 4)}`,
            progress: 0
          }
          break
        default:
          return map
      }

      map.set(lastCreatedItem.id, content)
      return map
    })
  }, [lastCreatedItem, queryClient])

  useEffect(() => {
    if (!lastDeletedIds.length) return

    queryClient.setQueryData<Map<string, BlockContent>>(['agenda-details'], (old) => {
      const map = new Map(old ?? [])
      for (const id of lastDeletedIds) {
        map.delete(id)
      }
      return map
    })
  }, [lastDeletedIds, queryClient])
}
