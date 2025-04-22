'use client'

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import expandReducer, { ExpandAction } from '@/app/reducers/expandReducer'
import { useBlocks } from './BlockProvider'
import { Block } from '../types/block'
import { useDraggingModifierKey } from '../hooks/useDraggingModifierKey'

export function createTreeContext<TContent = unknown, TBlock extends Block = Block>() {
  const TreeContext = createContext<TreeContextType<TContent, TBlock> | null>(null)

  const useTreeContext = () => {
    const ctx = useContext(TreeContext)
    if (!ctx) throw new Error('useTreeContext must be used within TreeProvider')
    return ctx as TreeContextType<TContent, TBlock>
  }

  function createTreeProvider() {
    const TreeProvider = ({
      children,
      data,
      ItemRenderer,
      expandAll,
    }: {
        children: ReactNode
        data: Map<string, TContent>
        ItemRenderer: ItemRenderer<TContent>
        expandAll?: boolean
      }) => {
      const { blocks } = useBlocks()
      const [activeIdRaw, setActiveIdRaw] = useState<string | null>(null)
      const [isDragging, setIsDragging] = useState(false)

      const setActiveId = useCallback((id: string | null) => {
        setIsDragging(!!id)
        setActiveIdRaw(id)
      }, [])
      const [hoverZone, setHoverZone] = useState<string | null>(null)
      const [isVirtual, setIsVirtual] = useState(false);
      const [hoveredId, setHoveredId] = useState<string | null>(null)


      const toggleVirtual = useCallback((): void => setIsVirtual(!isVirtual), [isVirtual])

      const initialExpanded = useMemo(() => {
        if (expandAll) {
          const map: Record<string, boolean> = {}
          blocks.forEach(b => {
            if (b.type === 'section') map[b.id] = true
          })
          return map
        }
        return {}
      }, [blocks, expandAll])

      const [expandedMap, dispatchExpand] = useReducer(expandReducer,initialExpanded)

      const { pressed: isShiftHeld, DisplayKey } = useDraggingModifierKey('Shift', isDragging)

      const effectiveExpandedMap = useMemo(() => {
        if (!(isDragging && isShiftHeld)) return expandedMap

        const collapsed: Record<string, boolean> = {}
        blocks.forEach(b => {
          if (b.type === 'section') collapsed[b.id] = false
        })
        return collapsed
      }, [isDragging, isShiftHeld, expandedMap, blocks])

      const activeBlock = useMemo(
        () => blocks.find(b => b.id === activeIdRaw) || null,
        [activeIdRaw, blocks]
      )

      const blocksByParent = useMemo(() => {
        const map = new Map<string | null, TBlock[]>()
        for (const block of blocks) {
          const list = map.get(block.parentId ?? null) ?? []
          map.set(block.parentId ?? null, [...list, block as TBlock])
        }
        return map
      }, [blocks])

      const activeItem = useMemo(() => {
        if (!activeIdRaw) return null
        return data.get(activeIdRaw) ?? null
      }, [activeIdRaw, data])

      const handleHover = useCallback(
        (zoneId: string, parentId: string | null) => {
          const dragged = blocks.find(b => b.id === activeIdRaw)
          if (!dragged) return
          if (dragged.type === 'section' && parentId) return
          setHoverZone(zoneId)
        },
        [activeIdRaw, blocks]
      )

      const value: TreeContextType<TContent, TBlock> = useMemo(() => ({
        blocks: blocks as TBlock[],
        blocksByParent,
        data,
        expandedMap: effectiveExpandedMap,
        dispatchExpand,
        hoverZone,
        setHoverZone,
        activeIdRaw,
        setActiveId,
        activeBlock: activeBlock as TBlock | null,
        isShiftHeld,
        DisplayKey,
        handleHover,
        ItemRenderer,
        activeItem,
        expandAll,
        isVirtual,
        toggleVirtual,
        hoveredId,
        setHoveredId
      }), [blocks, blocksByParent, data, effectiveExpandedMap, hoverZone, activeIdRaw, setActiveId, activeBlock, isShiftHeld, DisplayKey, handleHover, ItemRenderer, activeItem, expandAll, isVirtual, toggleVirtual, hoveredId])

      return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>
    }

    return TreeProvider
  }

  return { createTreeProvider, useTreeContext }
}

interface TreeContextType<T, TBlock extends Block> {
  blocks: TBlock[]
  blocksByParent: Map<string | null, TBlock[]>
  data: Map<string, T>
  expandedMap: Record<string, boolean>
  dispatchExpand: React.Dispatch<ExpandAction>
  hoverZone: string | null
  setHoverZone: (z: string | null) => void
  activeIdRaw: string | null
  setActiveId: (id: string | null) => void
  activeBlock: TBlock | null
  isShiftHeld: boolean
  DisplayKey: React.FC
  handleHover: (zoneId: string, parentId: string | null) => void
  ItemRenderer: ItemRenderer<T>
  activeItem: T | null
  expandAll?: boolean
  isVirtual: boolean
  toggleVirtual: () => void
  hoveredId: string | null
  setHoveredId: (id: string | null) => void
}

type ItemRenderer<T> = (props: { id: string; content: T }) => JSX.Element | null
