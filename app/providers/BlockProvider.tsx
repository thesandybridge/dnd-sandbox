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
import { blockReducer } from '../reducers/blockReducer'

export interface Block {
  id: string,
  type: 'section' | 'topic' | 'objective',
  parentId: string | null
  testId?: string
}

interface BlockContextValue {
  blocks: Block[];
  blockMap: Map<string, Block>;
  childrenMap: Map<string | null, Block[]>;
  indexMap: Map<string, number>;
  createItem: (type: Block['type'], parentId?: string | null) => Block;
  deleteItem: (id: string) => void;
  moveItem: (activeId: UniqueIdentifier, hoverZone: string) => void;
  setAll: (blocks: Block[]) => void;
}

const BlockContext = createContext<BlockContextValue | undefined>(undefined);

export function BlockProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [blocks, dispatch] = useReducer(blockReducer, []);

  const { blockMap, childrenMap, indexMap } = useMemo(() => {
    const blockMap = new Map<string, Block>()
    const childrenMap = new Map<string | null, Block[]>()
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
    type: Block['type'],
    parentId: string | null = null,
    testId?: string
  ): Block => {
      const newItem: Block = {
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

  const setAll = useCallback((all: Block[]) => {
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
    <BlockContext.Provider value={contextValue}>
      {children}
    </BlockContext.Provider>
  );
}

export function useBlocks() {
  const ctx = useContext(BlockContext)
  if (!ctx) throw new Error('useBlocks must be inside BlockProvider')
  return ctx
}
