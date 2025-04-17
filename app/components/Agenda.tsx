'use client'

import { memo, useReducer, useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  UniqueIdentifier,
} from '@dnd-kit/core'
import TreeRenderer from './TreeRenderer'
import { useAgenda } from '../providers/AgendaProvider'

type ExpandAction = {
    type: 'TOGGLE';
    id: string;
};

function expandReducer(
    state: Record<string, boolean>,
    action: ExpandAction
): Record<string, boolean> {
  switch (action.type) {
    case 'TOGGLE':
      return { ...state, [action.id]: !state[action.id] }
    default:
      return state
  }
}

const dndConfig = { collisionDetection: closestCenter }

const Agenda = () => {
  const { blocks, createItem, moveItem } = useAgenda()
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [hoverZone, setHoverZone] = useState<string | null>(null)
  const [expandedMap, dispatchExpand] = useReducer(expandReducer, { '1': true, '4': true })

  const handleDragEnd = () => {
    if (!activeId || !hoverZone) return
    moveItem(activeId, hoverZone);
    setActiveId(null)
    setHoverZone(null)
  }

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
      </div>
      <DndContext {...dndConfig} onDragStart={e => setActiveId(e.active.id)} onDragEnd={handleDragEnd}>
        <TreeRenderer
          blocks={blocks}
          parentId={null}
          onHover={setHoverZone}
          expandedMap={expandedMap}
          dispatchExpand={dispatchExpand}
        />
        <DragOverlay>{activeId && <div className="bg-gray-200 p-2 rounded">Dragging {activeId}</div>}</DragOverlay>
      </DndContext>
    </div>
  )
}

export default memo(Agenda)
