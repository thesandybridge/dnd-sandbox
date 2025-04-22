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
import { Block, BlockIndex } from '../types/block'
import { SerializedDiff } from '../utils/serializer'

interface BlockContextValue<TBlock extends Block = Block> {
  blocks: TBlock[]
  blockMap: Map<string, TBlock>
  childrenMap: Map<string | null, TBlock[]>
  indexMap: Map<string, number>
  createItem: (type: TBlock['type'], parentId?: string | null, testId?: string) => TBlock
  insertItem: (type: TBlock['type'], referenceId: string, position: 'before' | 'after') => TBlock // ← Add this
  deleteItem: (id: string) => void
  moveItem: (activeId: UniqueIdentifier, hoverZone: string) => void
  setAll: (blocks: TBlock[]) => void
  applyDiff: (diff: SerializedDiff) => void
  lastCreatedItem: TBlock | null
  lastDeletedIds: string[]
  lastMoveTimestamp: number
  normalizedIndex: BlockIndex<TBlock>
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
    const computeNormalizedIndex = useCallback((flat: TBlock[]): BlockIndex<TBlock> => {
      const byId = new Map<string, TBlock>()
      const byParent = new Map<string | null, string[]>()

      for (const block of flat) {
        byId.set(block.id, block)
        const key = block.parentId ?? null
        const list = byParent.get(key) ?? []
        byParent.set(key, [...list, block.id])
      }

      return { byId, byParent }
    }, [])

    const [state, dispatch] = useReducer(blockReducer<TBlock>, computeNormalizedIndex(initialBlocks))
    const [lastCreatedItem, setLastCreatedItem] = useState<TBlock | null>(null)
    const [lastDeletedIds, setLastDeletedIds] = useState<string[]>([])
    const [lastMoveTimestamp, setLastMoveTimestamp] = useState<number>(0)

    const blocks = useMemo(() => {
      const result: TBlock[] = []
      const walk = (parentId: string | null) => {
        const children = state.byParent.get(parentId) ?? []
        for (let i = 0; i < children.length; i++) {
          const id = children[i]
          const b = state.byId.get(id)
          if (b) {
            result.push({ ...b, order: i })
            if (b.type === 'section') walk(b.id)
          }
        }
      }
      walk(null)
      return result
    }, [state])

    const blockMap = useMemo(() => state.byId, [state])

    const childrenMap = useMemo(() => {
      const map = new Map<string | null, TBlock[]>()
      for (const [parentId, ids] of state.byParent.entries()) {
        map.set(parentId, ids.map(id => state.byId.get(id)!).filter(Boolean))
      }
      return map
    }, [state])

    const indexMap = useMemo(() => {
      const map = new Map<string, number>()
      for (const ids of state.byParent.values()) {
        ids.forEach((id, index) => {
          map.set(id, index)
        })
      }
      return map
    }, [state])

    const createItem = useCallback((type: TBlock['type'], parentId: string | null = null): TBlock => {
      const newItem = {
        id: uuidv4(),
        type,
        itemId: uuidv4(),
        parentId,
      } as TBlock

      dispatch({ type: 'ADD_ITEM', payload: newItem })
      setLastCreatedItem(newItem)
      return newItem
    }, [])

    const insertItem = useCallback((
      type: TBlock['type'],
      referenceId: string,
      position: 'before' | 'after'
    ): TBlock => {
        const referenceBlock = state.byId.get(referenceId)
        if (!referenceBlock) throw new Error(`Reference block ${referenceId} not found`)

        const parentId = referenceBlock.parentId ?? null
        const siblings = state.byParent.get(parentId) ?? []
        const index = siblings.indexOf(referenceId)
        const insertIndex = position === 'before' ? index : index + 1

        const newItem = {
          id: uuidv4(),
          type,
          itemId: uuidv4(),
          parentId,
        } as TBlock

        dispatch({
          type: 'INSERT_ITEM',
          payload: {
            item: newItem,
            parentId,
            index: insertIndex,
          }
        })

        setLastCreatedItem(newItem)
        return newItem
      }, [state])

    const deleteItem = useCallback((id: string) => {
      setLastDeletedIds([id])
      dispatch({ type: 'DELETE_ITEM', payload: { id } })
    }, [])

    const moveItem = useCallback((activeId: UniqueIdentifier, hoverZone: string) => {
      dispatch({
        type: 'MOVE_ITEM',
        payload: { activeId, hoverZone }
      })
      setLastMoveTimestamp(Date.now())
    }, [])

    const setAll = useCallback((all: TBlock[]) => {
      dispatch({ type: 'SET_ALL', payload: all })
    }, [])

    const applyDiff = useCallback((diff: SerializedDiff ) => {
      dispatch({ type: 'APPLY_DIFF', payload: diff })
    }, [])

    const value: BlockContextValue<TBlock> = useMemo(() => ({
      blocks,
      blockMap,
      childrenMap,
      indexMap,
      createItem,
      insertItem,
      deleteItem,
      moveItem,
      setAll,
      applyDiff,
      lastCreatedItem,
      lastDeletedIds,
      lastMoveTimestamp,
      normalizedIndex: state,
    }), [blocks, blockMap, childrenMap, indexMap, createItem, insertItem, deleteItem, moveItem, setAll, applyDiff, lastCreatedItem, lastDeletedIds, lastMoveTimestamp, state])

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

