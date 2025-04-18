'use client'

import { memo, useCallback, useReducer, useState, useMemo } from "react"
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
  DragStartEvent,
} from '@dnd-kit/core'
import TreeRenderer from './TreeRenderer'
import { useAgenda } from '../providers/AgendaProvider'
import { useAgendaDetails } from "../hooks/useAgendaDetails"
import { useModifierKey } from "../hooks/useModifierKey"
import expandReducer from "../reducers/expandReducer"

const dndConfig = { collisionDetection: closestCenter }

const Agenda = () => {
  const { blocks, createItem, moveItem } = useAgenda()
  const { data: agendaData } = useAgendaDetails(blocks)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [hoverZone, setHoverZone] = useState<string | null>(null)
  const [expandedMap, dispatchExpand] = useReducer(expandReducer, { '1': true, '4': true })

  const activeBlock = useMemo(
    () => blocks.find(b => b.id === activeId),
    [activeId, blocks]
  )

  const content = activeBlock ? agendaData?.get(activeBlock.id) : null

  const {
    pressed: isShiftHeld,
    DisplayKey,
  } = useModifierKey('Shift')

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const effectiveExpandedMap = useMemo(() => {
    if (!isShiftHeld) return expandedMap

    const collapsed: Record<string, boolean> = {}
    blocks.forEach(b => {
      if (b.type === 'section') collapsed[b.id] = false
    })
    return collapsed
  }, [isShiftHeld, expandedMap, blocks])

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  )

  const handleDragEnd = useCallback(() => {
    if (!activeId || !hoverZone) return
    moveItem(activeId, hoverZone)
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
          expandedMap={effectiveExpandedMap}
          dispatchExpand={dispatchExpand}
          hoverZone={hoverZone}
        />

        <DragOverlay>
          {activeBlock && (
            activeBlock.type === 'section' ? (
              <div className="bg-white border border-gray-300 shadow-md rounded-md p-3 text-sm w-64 pointer-events-none">
                <div className="text-gray-500 uppercase text-xs tracking-wide mb-1">
                  Section
                </div>
                <div className="font-semibold text-gray-800 mb-2">
                  {content?.title ?? 'Untitled Section'}
                </div>
                <ul className="pl-4 list-disc text-gray-600 text-xs space-y-1">
                  {blocks
                    .filter(b => b.parentId === activeBlock.id)
                    .map(child => (
                      <li key={child.id}>
                        {agendaData?.get(child.id)?.title ?? `Untitled ${child.type}`}
                      </li>
                    ))}
                </ul>
              </div>
            ) : (
                <div className="bg-white border border-gray-300 shadow-md rounded-md px-4 py-2 text-sm max-w-sm pointer-events-none">
                  <div className="text-gray-500 uppercase text-xs tracking-wide mb-1">
                    {activeBlock.type}
                  </div>
                  <div className="font-medium text-gray-800">
                    {content?.title ?? `Untitled ${activeBlock.type}`}
                  </div>
                </div>
              )
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default memo(Agenda)
