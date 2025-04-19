'use client'

import { Fragment, memo, useCallback, useMemo } from 'react'
import ItemWrapper from './ItemWrapper'
import DropZone from './DropZone'
import { useTreeContext } from '@/app/providers/TreeProvider'
import { useDraggable } from '@dnd-kit/core'
import Section from '../Section'
import { Block, useBlocks } from '@/app/providers/BlockProvider'

interface Props {
  block: Block
}

const SectionContainer = ({ block }: Props) => {
  const { createItem, deleteItem } = useBlocks()
  const {
    blocksByParent,
    expandedMap,
    dispatchExpand,
    data,
    hoverZone,
  } = useTreeContext()

  const children = useMemo(() => blocksByParent.get(block.id) ?? [], [block.id, blocksByParent])
  const isExpanded = !!expandedMap[block.id]
  const content = data?.get(block.id)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: block.id })

  const style = {
    transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`
  }

  const isHoveredOverThis = useMemo(() => {
    if (!hoverZone || children.length === 0) return false
    const dropZones = [`into-${block.id}`, ...children.flatMap(c => [`before-${c.id}`, `after-${c.id}`])]
    return dropZones.includes(hoverZone)
  }, [hoverZone, block.id, children])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    deleteItem(block.id)
  }, [block.id, deleteItem])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-opacity ${isDragging ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="flex items-center gap-2 justify-between bg-gray-50 rounded-lg p-2">
        <div className="flex gap-2 align-center justify-center">
          <div
            {...listeners}
            {...attributes}
            className="cursor-move px-1"
            data-testid={block.testId ? `drag-handle-${block.testId}` : undefined}
          >
            ☰
          </div>
          <button
            onClick={() => dispatchExpand({ type: 'TOGGLE', id: block.id })}
            className="text-gray-600"
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        </div>
        {content?.type === 'section' && <Section block={block} content={content} />}
        <button onClick={handleDelete} className="p-1 text-red-600">×</button>
        {!isExpanded && <div>{children.length} Item{children.length === 1 ? '' : 's'}</div>}
      </div>

      {!isExpanded &&
        <DropZone id={`into-${block.id}`} parentId={block.parentId} type="section" />
      }

      {isExpanded && (
        <>
          <div className={`p-2 flex flex-col gap-2 transition-all duration-150 ${isHoveredOverThis ? 'border rounded-lg border-dashed border-blue-400' : ''}`}>
            {children.map((child, idx) => (
              <Fragment key={child.id}>
                {idx === 0 && (
                  <DropZone id={`before-${child.id}`} parentId={child.parentId} />
                )}
                <ItemWrapper id={child.id} />
                <DropZone id={`after-${child.id}`} parentId={child.parentId} />
              </Fragment>
            ))}
          </div>

          <div className="flex p-4 gap-2">
            <div className="flex items-center justify-center p-2 cursor-pointer" onClick={() => createItem('topic', block.id)}>
              + Add Topic
            </div>
            <div className="flex items-center justify-center p-2 cursor-pointer" onClick={() => createItem('objective', block.id)}>
              + Add Objective
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default memo(SectionContainer)
