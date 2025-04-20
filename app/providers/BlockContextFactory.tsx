'use client'

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useMemo,
  useCallback,
  useState,
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { UniqueIdentifier } from '@dnd-kit/core'
import { blockReducer } from '../reducers/blockReducer'
import { Block } from '../types/block'

interface BlockContextValue<TBlock extends Block = Block> {
  blocks: TBlock[]
  blockMap: Map<string, TBlock>
  childrenMap: Map<string | null, TBlock[]>
  indexMap: Map<string, number>
  createItem: (type: TBlock['type'], parentId?: string | null, testId?: string) => TBlock
  deleteItem: (id: string) => void
  moveItem: (activeId: UniqueIdentifier, hoverZone: string) => void
  setAll: (blocks: TBlock[]) => void
  lastCreatedItem: TBlock | null
  lastDeletedIds: string[]
  lastMoveTimestamp: number
}

function sortBlocks<TBlock extends Block>(blocks: TBlock[]): TBlock[] {
  return [...blocks].sort((a, b) => {
    if (a.parentId === b.parentId) {
      return a.order - b.order
    }
    return 0
  })
}

export function createBlockContext<TBlock extends Block = Block>() {
  const BlockContext = createContext<BlockContextValue<TBlock> | null>(null)

  const useBlocks = () => {
    const ctx = useContext(BlockContext)
    if (!ctx) throw new Error('useBlocks must be used inside BlockProvider')
    return ctx
  }

  const BlockProvider = ({
    children,
    initialBlocks = [],
  }: {
    children: ReactNode
    initialBlocks?: TBlock[]
  }) => {
    const [blocks, dispatch] = useReducer(blockReducer<TBlock>, sortBlocks(initialBlocks))
    const [lastCreatedItem, setLastCreatedItem] = useState<TBlock | null>(null)
    const [lastDeletedIds, setLastDeletedIds] = useState<string[]>([])
    const [lastMoveTimestamp, setLastMoveTimestamp] = useState<number>(0)

    const blockMap = useMemo(() => new Map(blocks.map(b => [b.id, b])), [blocks])
    const childrenMap = useMemo(() => {
      const map = new Map<string | null, TBlock[]>()
      for (const block of blocks) {
        const key = block.parentId ?? null
        const list = map.get(key) ?? []
        map.set(key, [...list, block])
      }
      return map
    }, [blocks])

    const indexMap = useMemo(() => {
      const map = new Map<string, number>()
      blocks.forEach((b, i) => map.set(b.id, i))
      return map
    }, [blocks])

    const createItem = useCallback((type: TBlock['type'], parentId: string | null = null): TBlock => {
      const newItem = {
        id: uuidv4(),
        type,
        parentId,
      } as TBlock

      dispatch({ type: 'ADD_ITEM', payload: newItem })
      setLastCreatedItem(newItem)
      return newItem
    }, [])

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

      setLastDeletedIds([...toDelete])
      dispatch({ type: 'DELETE_ITEM', payload: { id } })
    }, [blocks])

    const moveItem = useCallback((activeId: UniqueIdentifier, hoverZone: string) => {
      dispatch({
        type: 'MOVE_ITEM',
        payload: {
          activeId,
          hoverZone,
          blockMap,
          childrenMap,
          indexMap,
        },
      })
      setLastMoveTimestamp(Date.now())
    }, [blockMap, childrenMap, indexMap])

    const setAll = useCallback((all: TBlock[]) => {
      dispatch({ type: 'SET_ALL', payload: sortBlocks(all) })
    }, [])

    const value: BlockContextValue<TBlock> = useMemo(() => ({
      blocks,
      blockMap,
      childrenMap,
      indexMap,
      createItem,
      deleteItem,
      moveItem,
      setAll,
      lastCreatedItem,
      lastDeletedIds,
      lastMoveTimestamp,
    }), [blocks, blockMap, childrenMap, indexMap, createItem, deleteItem, moveItem, setAll, lastCreatedItem, lastDeletedIds, lastMoveTimestamp])

    return (
      <BlockContext.Provider value={value}>
        {children}
      </BlockContext.Provider>
    )
  }

  return {
    BlockProvider,
    useBlocks,
  }
}
