'use client'

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useMemo,
  useCallback
} from 'react'

import { v4 as uuidv4 } from 'uuid'
import type { UniqueIdentifier } from '@dnd-kit/core'
import { useQueryClient } from '@tanstack/react-query'
import { BlockContent } from '../hooks/useAgendaDetails'
import { agendaReducer } from '../reducers/agendaReducer'

export interface Agenda {
  id: string,
  type: 'section' | 'topic' | 'objective',
  parentId: string | null
  testId?: string
}

interface AgendaContextValue {
  blocks: Agenda[];
  blockMap: Map<string, Agenda>;
  childrenMap: Map<string | null, Agenda[]>;
  indexMap: Map<string, number>;
  createItem: (type: Agenda['type'], parentId?: string | null) => Agenda;
  deleteItem: (id: string) => void;
  moveItem: (activeId: UniqueIdentifier, hoverZone: string) => void;
  setAll: (blocks: Agenda[]) => void;
}

const AgendaContext = createContext<AgendaContextValue | undefined>(undefined);

export function AgendaProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [blocks, dispatch] = useReducer(agendaReducer, []);

  const { blockMap, childrenMap, indexMap } = useMemo(() => {
    const blockMap = new Map<string, Agenda>()
    const childrenMap = new Map<string | null, Agenda[]>()
    const indexMap = new Map<string, number>()

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      blockMap.set(block.id, block)
      indexMap.set(block.id, i)

      const key = block.parentId ?? null
      const list = childrenMap.get(key) ?? []
      childrenMap.set(key, [...list, block])
    }

    return { blockMap, childrenMap, indexMap }
  }, [blocks])

  const createItem = useCallback((
    type: Agenda['type'],
    parentId: string | null = null,
    testId?: string
  ): Agenda => {
      const newItem: Agenda = {
        id: uuidv4(),
        type,
        parentId,
        ...(testId ? { testId } : {})
      };
      dispatch({ type: 'ADD_ITEM', payload: newItem });

      queryClient.setQueryData<Map<string, BlockContent>>(['agenda-details'], (old) => {
        const map = new Map(old ?? [])
        let content: BlockContent

        switch (newItem.type) {
          case 'section':
            content = {
              type: 'section',
              title: `SECTION ${newItem.id.slice(0, 4)}`,
              summary: ''
            }
            break
          case 'topic':
            content = {
              type: 'topic',
              title: `TOPIC ${newItem.id.slice(0, 4)}`,
              description: ''
            }
            break
          case 'objective':
            content = {
              type: 'objective',
              title: `OBJECTIVE ${newItem.id.slice(0, 4)}`,
              progress: 0
            }
            break
        }

        map.set(newItem.id, content)
        return map
      })

      return newItem;
    }, [dispatch, queryClient])

  const deleteItem = useCallback((id: string) => {
    const toDelete = new Set<string>([id])
    let oldSize: number

    do {
      oldSize = toDelete.size
      for (const block of blocks) {
        if (block.parentId && toDelete.has(block.parentId)) {
          toDelete.add(block.id)
        }
      }
    } while (toDelete.size !== oldSize)

    queryClient.setQueryData<Map<string, BlockContent>>(['agenda-details'], (old) => {
      if (!old) return new Map()

      const map = new Map(old)
      for (const id of toDelete) {
        map.delete(id)
      }
      return map
    })

    dispatch({ type: 'DELETE_ITEM', payload: { id } })
  }, [blocks, queryClient])

  const moveItem = useCallback((activeId: UniqueIdentifier, hoverZone: string) => {
    dispatch({ type: 'MOVE_ITEM', payload: { activeId, hoverZone } });
  }, [])

  const setAll = useCallback((all: Agenda[]) => {
    dispatch({ type: 'SET_ALL', payload: all });
  }, [])

  const contextValue = useMemo(() => ({
    blocks,
    blockMap,
    childrenMap,
    indexMap,
    createItem,
    deleteItem,
    moveItem,
    setAll
  }), [blocks, blockMap, childrenMap, indexMap, createItem, deleteItem, moveItem, setAll])

  return (
    <AgendaContext.Provider value={contextValue}>
      {children}
    </AgendaContext.Provider>
  );
}

export function useAgenda() {
  const ctx = useContext(AgendaContext)
  if (!ctx) throw new Error('useAgenda must be inside AgendaProvider')
  return ctx
}
