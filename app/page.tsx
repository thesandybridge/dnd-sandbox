'use client'

import React, { useReducer, useState, useMemo, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCenter
} from '@dnd-kit/core'

// Blueprint: flat list of blocks
const initialBlocks = [
  { id: '1', type: 'section', parentId: null },
  { id: '2', type: 'topic', parentId: '1' },
  { id: '3', type: 'topic', parentId: null },
  { id: '4', type: 'section', parentId: null },
  { id: '5', type: 'topic', parentId: '4' }
]

// Reducer for expand/collapse
function expandReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE':
      return { ...state, [action.id]: !state[action.id] }
    default:
      return state
  }
}

// Utility to handle reparenting, disallow sections nesting via into-
function reparentBlock(blocks, activeId, hoverZone) {
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

    let newParentId = null;
    let insertIndex = remaining.length;

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

// Hook stub: section fetches own children
function useSectionChildren(sectionId, blocks) {
  return useMemo(() => blocks.filter(b => b.parentId === sectionId), [blocks, sectionId])
}

// Topic wrapper
function TopicItem({ block }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: block.id })
  const style = { transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)` }
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="border border-gray-300 rounded-lg p-3 bg-white mb-2 shadow-sm"
      style={style}
    >
      TOPIC {block.id}
    </div>
  )
}

// Section header wrapper
function SectionItem({ block }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: block.id })
  const style = { transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)` }
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex-1 border border-gray-400 rounded px-2 py-1 bg-gray-100 cursor-move"
      style={style}
    >
      SECTION {block.id}
    </div>
  )
}

// Ghost drop zone
function DropZone({ id, onHover }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const handleHover = useCallback(() => onHover(id), [id, onHover])
  React.useEffect(() => { if (isOver) handleHover() }, [isOver, handleHover])
  return <div ref={setNodeRef} className={`h-4 my-1 rounded transition-colors ${isOver ? 'bg-blue-500' : 'bg-transparent'}`} />
}

// Section container component
function SectionContainer({ block, expandedMap, dispatchExpand, onHover, blocks }) {
  const children = useSectionChildren(block.id, blocks)
  const isExpanded = !!expandedMap[block.id]
  return (
    <div className="mb-4 border border-gray-300 rounded-lg p-2 bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => dispatchExpand({ type: 'TOGGLE', id: block.id })} className="text-gray-600">
          {isExpanded ? '▾' : '▸'}
        </button>
        <SectionItem block={block} />
      </div>
      {children.length === 0 && (
        <DropZone id={`into-${block.id}`} onHover={onHover} />
      )}
      {isExpanded && (
        <div className="ml-6 mt-2 border-l border-gray-300 pl-4">
          {children.map(child => (
            <React.Fragment key={child.id}>
              <DropZone id={`before-${child.id}`} onHover={onHover} />
              <TopicItem block={child} />
              <DropZone id={`after-${child.id}`} onHover={onHover} />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

// Recursive tree
function TreeRenderer({ blocks, parentId, onHover, expandedMap, dispatchExpand }) {
  const items = useMemo(() => blocks.filter(b => b.parentId === parentId), [blocks, parentId])
  const indent = parentId ? 'ml-6 border-l border-gray-300 pl-4' : ''
  return (
    <div className={indent}>
      {items.map(block => (
        <React.Fragment key={block.id}>
          <DropZone id={`before-${block.id}`} onHover={onHover} />
          {block.type === 'section' ? (
            <SectionContainer block={block} expandedMap={expandedMap} dispatchExpand={dispatchExpand} onHover={onHover} blocks={blocks} />
          ) : (
            <TopicItem block={block} />
          )}
          <DropZone id={`after-${block.id}`} onHover={onHover} />
        </React.Fragment>
      ))}
    </div>
  )
}

// Main agenda demo
export default function AgendaDemo() {
  const [blocks, setBlocks] = useState(initialBlocks)
  const [activeId, setActiveId] = useState(null)
  const [hoverZone, setHoverZone] = useState(null)
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
        <TreeRenderer blocks={blocks} parentId={null} onHover={setHoverZone} expandedMap={expandedMap} dispatchExpand={dispatchExpand} />
        <DragOverlay>{activeId && <div className="bg-gray-200 p-2 rounded">Dragging {activeId}</div>}</DragOverlay>
      </DndContext>
    </div>
  )
}

