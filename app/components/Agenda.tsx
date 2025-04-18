'use client'

import { memo, useCallback, useReducer, useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  UniqueIdentifier,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import TreeRenderer from './TreeRenderer'
import { useAgenda } from '../providers/AgendaProvider'
import { useAgendaDetails } from "../hooks/useAgendaDetails"
import { useModifierKey } from "../hooks/useModifierKey"
import { DragStartEvent } from "@dnd-kit/core"

type ExpandAction =
  | { type: 'TOGGLE'; id: string }
  | { type: 'SET_ALL'; map: Record<string, boolean> }

function expandReducer(
  state: Record<string, boolean>,
  action: ExpandAction
): Record<string, boolean> {
  switch (action.type) {
    case 'TOGGLE':
      return { ...state, [action.id]: !state[action.id] }
    case 'SET_ALL':
      return action.map
    default:
      return state
  }
}

const dndConfig = { collisionDetection: closestCenter }

const Agenda = () => {
  const { blocks, createItem, moveItem } = useAgenda()
  const { data: agendaData } = useAgendaDetails(blocks)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [hoverZone, setHoverZone] = useState<string | null>(null)
  const [expandedMap, dispatchExpand] = useReducer(expandReducer, { '1': true, '4': true })
  const {
    pressed: isShiftHeld,
    pressedRef: shiftKeyRef,
    DisplayKey,
  } = useModifierKey('Shift')

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)

    if (shiftKeyRef.current) {
      setTimeout(() => {
        const collapsed: Record<string, boolean> = {}
        blocks.forEach(b => {
          if (b.type === 'section') collapsed[b.id] = false
        })
        dispatchExpand({ type: 'SET_ALL', map: collapsed })
      }, 100) // just enough to stabilize drag overlay
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(() => {
    if (!activeId || !hoverZone) return
    moveItem(activeId, hoverZone);
    setActiveId(null)
    setHoverZone(null)
  }, [activeId, hoverZone, moveItem])

  const handleHover = useCallback((zoneId: string, parentId: string | null) => {
    const dragged = blocks.find(b => b.id === activeId)
    if (!dragged) return

    if (dragged.type === 'section' && parentId) return

    setHoverZone(zoneId)
  }, [activeId, blocks])

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Agenda DnD Demo</h1>
      <div className="flex p-4 gap-2">
        <button
          onClick={() => createItem('section', null)}
          className="mb-4 px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Section
        </button>
        <button
          onClick={() => createItem('topic', null)}
          className="mb-4 px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Topic
        </button>
        <button
          onClick={() => createItem('objective', null)}
          className="mb-4 px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Objective
        </button>
        {isShiftHeld && <DisplayKey />}
      </div>
      <DndContext
        {...dndConfig}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <TreeRenderer
          blocks={blocks}
          data={agendaData}
          parentId={null}
          onHover={handleHover}
          expandedMap={expandedMap}
          dispatchExpand={dispatchExpand}
        />
        <DragOverlay>{activeId && <div className="bg-gray-200 p-2 rounded">Dragging {activeId}</div>}</DragOverlay>
      </DndContext>
    </div>
  )
}

export default memo(Agenda)
