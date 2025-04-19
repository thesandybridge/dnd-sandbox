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
import { useModifierKey } from '@/app/hooks/useModifierKey'
import { Block, useBlocks } from './BlockProvider'

export function createTreeContext<T = unknown>() {
  const TreeContext = createContext<TreeContextType<T> | null>(null)

  const useTreeContext = () => {
    const ctx = useContext(TreeContext)
    if (!ctx) throw new Error('useTreeContext must be used within TreeProvider')
    return ctx
  }

  function TreeProvider({
    children,
    data,
    ItemRenderer,
  }: {
      children: ReactNode;
      data: Map<string, T>;
      ItemRenderer: ItemRenderer<T>
    }): JSX.Element {
    const { blocks } = useBlocks()
    const [activeId, setActiveId] = useState<string | null>(null)
    const [hoverZone, setHoverZone] = useState<string | null>(null)
    const [expandedMap, dispatchExpand] = useReducer(expandReducer, {})

    const {
      pressed: isShiftHeld,
      DisplayKey,
    } = useModifierKey('Shift')

    const effectiveExpandedMap = useMemo(() => {
      if (!isShiftHeld) return expandedMap
      const collapsed: Record<string, boolean> = {}
      blocks.forEach(b => {
        if (b.type === 'section') collapsed[b.id] = false
      })
      return collapsed
    }, [isShiftHeld, expandedMap, blocks])

    const activeBlock = useMemo(
      () => blocks.find(b => b.id === activeId) || null,
      [activeId, blocks]
    )

    const blocksByParent = useMemo(() => {
      const map = new Map<string | null, Block[]>()
      for (const block of blocks) {
        const list = map.get(block.parentId ?? null) ?? []
        map.set(block.parentId ?? null, [...list, block])
      }
      return map
    }, [blocks])

    const activeItem = useMemo(() => {
      if (!activeId) return null
      return data.get(activeId) ?? null
    }, [activeId, data])

    const handleHover = useCallback(
      (zoneId: string, parentId: string | null) => {
        const dragged = blocks.find(b => b.id === activeId)
        if (!dragged) return
        if (dragged.type === 'section' && parentId) return
        setHoverZone(zoneId)
      },
      [activeId, blocks]
    )

    const value = useMemo<TreeContextType<T>>(() => ({
      blocks,
      blocksByParent,
      data,
      expandedMap: effectiveExpandedMap,
      dispatchExpand,
      hoverZone,
      setHoverZone,
      activeId,
      setActiveId,
      activeBlock,
      isShiftHeld,
      DisplayKey,
      handleHover,
      ItemRenderer,
      activeItem,
    }), [
        blocks,
        blocksByParent,
        data,
        effectiveExpandedMap,
        dispatchExpand,
        hoverZone,
        setHoverZone,
        activeId,
        activeItem,
        setActiveId,
        activeBlock,
        isShiftHeld,
        DisplayKey,
        handleHover,
        ItemRenderer,
      ])

    return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>
  }

  return { TreeProvider, useTreeContext }
}

interface TreeContextType<T> {
  blocks: Block[]
  blocksByParent: Map<string | null, Block[]>
  data: Map<string, T>
  expandedMap: Record<string, boolean>
  dispatchExpand: React.Dispatch<ExpandAction>
  hoverZone: string | null
  setHoverZone: (z: string | null) => void
  activeId: string | null
  setActiveId: (id: string | null) => void
  activeBlock: Block | null
  isShiftHeld: boolean
  DisplayKey: React.FC
  handleHover: (zoneId: string, parentId: string | null) => void
  ItemRenderer: ItemRenderer<T>
  activeItem: T | null
}

type ItemRenderer<T> = (props: { id: string; content: T }) => JSX.Element | null
