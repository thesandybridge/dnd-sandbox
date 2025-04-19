'use client'

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import expandReducer, { ExpandAction } from '@/app/reducers/expandReducer'
import { Agenda, useAgenda } from '@/app/providers/AgendaProvider'
import { BlockContent, useAgendaDetails } from '@/app/hooks/useAgendaDetails'
import { useModifierKey } from '@/app/hooks/useModifierKey'

interface TreeContextType {
  blocks: Agenda[]
  blocksByParent: Map<string | null, Agenda[]>
  agendaData: Map<string, BlockContent> | undefined
  expandedMap: Record<string, boolean>
  dispatchExpand: React.Dispatch<ExpandAction>
  hoverZone: string | null
  setHoverZone: (z: string | null) => void
  activeId: string | null
  setActiveId: (id: string | null) => void
  activeBlock: Agenda | null
  isShiftHeld: boolean
  DisplayKey: React.FC
  handleHover: (zoneId: string, parentId: string | null) => void
}

const TreeContext = createContext<TreeContextType | null>(null)

export const useTreeContext = () => {
  const ctx = useContext(TreeContext)
  if (!ctx) throw new Error('useTreeContext must be used within TreeProvider')
  return ctx
}

export function TreeProvider({ children }: { children: ReactNode }) {
  const { blocks } = useAgenda()
  const { data: agendaData } = useAgendaDetails(blocks)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoverZone, setHoverZone] = useState<string | null>(null)
  const [expandedMap, dispatchExpand] = useReducer(expandReducer, {})

  const {
    pressed: isShiftHeld,
    DisplayKey
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
    const map = new Map<string | null, Agenda[]>()
    for (const block of blocks) {
      const list = map.get(block.parentId ?? null) ?? []
      map.set(block.parentId ?? null, [...list, block])
    }
    return map
  }, [blocks])

  const handleHover = useCallback((zoneId: string, parentId: string | null) => {
    const dragged = blocks.find(b => b.id === activeId)
    if (!dragged) return
    if (dragged.type === 'section' && parentId) return
    setHoverZone(zoneId)
  }, [activeId, blocks])

  const value: TreeContextType = {
    blocks,
    blocksByParent,
    agendaData,
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
  }

  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>
}
