'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useBlocks } from '../providers/BlockProvider'
import { agendaStore } from '../stores/agendaStore'
import { BlockContent } from '../types/agenda'

const QUERY_KEY = ['agenda-details']

export function useAgenda() {
  const queryClient = useQueryClient()
  const { blocks } = useBlocks()

  const sync = () => {
    // Sync agendaStore into the React Query cache
    queryClient.setQueryData<Map<string, BlockContent>>(QUERY_KEY, new Map(agendaStore))
  }

  const create = <T extends BlockContent>(item: T, blockId: string) => {
    agendaStore.set(blockId, item)
    sync()
    return item.id
  }

  const remove = (blockId: string) => {
    const toDelete = new Set<string>()
    const stack = [blockId]

    while (stack.length > 0) {
      const currentId = stack.pop()!
      toDelete.add(currentId)

      for (const block of blocks) {
        if (block.parentId === currentId) {
          stack.push(block.id)
        }
      }
    }

    for (const id of toDelete) {
      const content = agendaStore.get(id)
      if (content) {
        agendaStore.delete(id)
      }
    }

    sync()
  }

  const removeAll = () => {
    agendaStore.clear()
    sync()
  }

  const get = (blockId: string): BlockContent | undefined => {
    return agendaStore.get(blockId)
  }

  const getAll = (): Map<string, BlockContent> => {
    return new Map(agendaStore)
  }

  return { create, remove, removeAll, get, getAll }
}
