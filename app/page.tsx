'use client'

import React, { useReducer, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  UniqueIdentifier,
} from '@dnd-kit/core'
import TreeRenderer from './components/TreeRenderer'

export interface Agenda {
  id: string,
  type: string,
  parentId: string | null
}
// Blueprint: flat list of blocks
const initialBlocks: Agenda[] = [
  { id: '1', type: 'section', parentId: null },
  { id: '2', type: 'topic', parentId: '1' },
  { id: '3', type: 'topic', parentId: null },
  { id: '4', type: 'section', parentId: null },
  { id: '5', type: 'topic', parentId: '4' },
  { id: '6', type: 'objective', parentId: null }
]

type ExpandAction = {
    type: 'TOGGLE';
    id: string;
};

// Reducer for expand/collapse
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

function reparentBlock(blocks: Agenda[], activeId: UniqueIdentifier, hoverZone: string) {
    const dragged = blocks.find(b => b.id === activeId);
    if (!dragged) return blocks;
    const remaining = blocks.filter(b => b.id !== activeId);

    let zone = hoverZone;

    // ── DISALLOW ANY NESTING WHEN DRAGGING A SECTION ──
    if (dragged.type === 'section') {
        // transform 'into-' into 'before-'
        if (zone.startsWith('into-')) {
            zone = 'before-' + zone.slice('into-'.length);
        }
        // for before-/after- on nested items, point at the parent instead
        if (zone.startsWith('before-') || zone.startsWith('after-')) {
            const [, targetId] = zone.split('-', 2);
            const target = blocks.find(b => b.id === targetId);
            if (target && target.parentId !== null) {
                const prefix = zone.split('-')[0];
                zone = `${prefix}-${target.parentId}`;
            }
        }
    }

    // ── rest of your existing logic unchanged ──

    let newParentId: string | null = null;
    let insertIndex: number = remaining.length;

    if (zone.startsWith('into-')) {
        newParentId = zone.replace('into-', '');
        const siblings = remaining.filter(b => b.parentId === newParentId);
        if (siblings.length > 0) {
            const last = siblings[siblings.length - 1];
            const idx = remaining.findIndex(b => b.id === last.id);
            insertIndex = idx + 1;
        } else {
            const parentIdx = remaining.findIndex(b => b.id === newParentId);
            insertIndex = parentIdx + 1;
        }
    } else {
        const isAfter = zone.startsWith('after-');
        const targetId = zone.replace(/^(before|after)-/, '');
        const target = blocks.find(b => b.id === targetId);
        newParentId = target?.parentId ?? null;
        let idx = remaining.findIndex(b => b.id === targetId);
        if (idx === -1) idx = remaining.length;
        insertIndex = isAfter ? idx + 1 : idx;
    }

    const moved = { ...dragged, parentId: newParentId };
    return [
        ...remaining.slice(0, insertIndex),
        moved,
        ...remaining.slice(insertIndex),
    ];
}

// DnD config
const dndConfig = { collisionDetection: closestCenter }

// Main agenda demo
export default function Agenda() {
  const [blocks, setBlocks] = useState(initialBlocks)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [hoverZone, setHoverZone] = useState<string | null>(null)
  const [expandedMap, dispatchExpand] = useReducer(expandReducer, { '1': true, '4': true })

  const handleDragEnd = () => {
    if (!activeId || !hoverZone) return
    setBlocks(prev => reparentBlock(prev, activeId, hoverZone))
    setActiveId(null)
    setHoverZone(null)
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Agenda DnD Demo</h1>
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

