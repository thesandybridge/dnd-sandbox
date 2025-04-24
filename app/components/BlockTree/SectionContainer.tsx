'use client'

import { Fragment, memo, useCallback, useMemo } from 'react'
import ItemWrapper from './ItemWrapper'
import DropZone from './DropZone'
import { useTreeContext } from '@/app/providers/TreeProvider'
import { useDraggable } from '@dnd-kit/core'
import Section from '../Items/Section'
import { useBlocks } from '@/app/providers/BlockProvider'
import { Block } from '@/app/types/block'
import DragHandle from './DragHandle'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDeleteLeft, faSquareMinus, faSquarePlus } from '@fortawesome/free-solid-svg-icons'
import { useAgenda } from '@/app/hooks/useAgenda'

interface Props {
  block: Block
}

const SectionContainer = ({ block }: Props) => {

  const { createItem, deleteItem } = useBlocks()
  const { create, remove, get } = useAgenda()
  const {
    blocksByParent,
    expandedMap,
    dispatchExpand,
    hoverZone,
    activeItem,
    hoveredId,
  } = useTreeContext()

  const isHovered = useMemo(() => {
    if (hoveredId === block.id) return true
    const stack: string[] = [block.id]
    while (stack.length) {
      const id = stack.pop()!
      if (hoveredId === id) return true
      const children = blocksByParent.get(id) ?? []
      stack.push(...children.map(c => c.id))
    }
    return false
  }, [hoveredId, block.id, blocksByParent])

  const children = useMemo(() => blocksByParent.get(block.id) ?? [], [block.id, blocksByParent])
  const isExpanded = !!expandedMap[block.id]
  const content = get(block.id)
  const isSection = activeItem ? activeItem.type === 'section' : false

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
    remove(block.id)
  }, [block.id, deleteItem, remove])

  const handleCreateItem = useCallback((type: Block['type']) => {
    const itemId = crypto.randomUUID()
    const newBlock = createItem(type, block.id, itemId)

    switch (type) {
      case 'topic':
        create({
          id: itemId,
          type,
          title: `TOPIC ${itemId.slice(0, 4)}`,
          description: '',
        }, newBlock.id)
        break
      case 'objective':
        create({
          id: itemId,
          type,
          title: `OBJECTIVE ${itemId.slice(0, 4)}`,
          progress: 0,
        }, newBlock.id)
        break
      case 'action-item':
        create({
          id: itemId,
          type,
          title: `ACTION ITEM ${itemId.slice(0, 4)}`,
        }, newBlock.id)
        break
      case 'section':
        create({
          id: itemId,
          type,
          title: `SECTION ${itemId.slice(0, 4)}`,
          summary: '',
        }, newBlock.id)
        break
    }
  }, [block.id, create, createItem])
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-opacity ${isDragging ? 'opacity-0' : 'opacity-100'} rounded-lg border-2 ${isHovered ? 'border-green-500' : 'border-transparent'}`}
    >
      <div className={`flex items-center gap-2 justify-between bg-gray-50 rounded-lg p-2 transition-colors duration-150`}>
        <div className="flex gap-2 align-center justify-center">
          <DragHandle
            listeners={listeners}
            attributes={attributes}
            blockId={block.id}
          />
          <button
            onClick={() => dispatchExpand({ type: 'TOGGLE', id: block.id })}
            className="text-gray-600 w-8 h-8"
          >
            <FontAwesomeIcon icon={isExpanded ? faSquareMinus : faSquarePlus } />
          </button>
        </div>
        {content?.type === 'section' && <Section blockId={block.id} content={content} />}
        {!isExpanded && <div>{children.length} Item{children.length === 1 ? '' : 's'}</div>}
        <button onClick={handleDelete} className="p-1 text-red-600">
          <FontAwesomeIcon icon={faDeleteLeft} />
        </button>
      </div>

      {children.length === 0 && isExpanded && !isSection && (
        <DropZone
          id={`into-${block.id}`}
          parentId={block.parentId}
          type="section"
        />
      )}
      {!isExpanded && !isSection && (
        <DropZone
          id={`into-${block.id}`}
          parentId={block.parentId}
          type="section"
        />
      )}

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
            <div
              className="flex items-center justify-center p-2 cursor-pointer"
              onClick={() => handleCreateItem('topic')}>
              + Add Topic
            </div>
            <div
              className="flex items-center justify-center p-2 cursor-pointer"
              onClick={() => handleCreateItem('objective')}>
              + Add Objective
            </div>
            <div
              className="flex items-center justify-center p-2 cursor-pointer"
              onClick={() => handleCreateItem('action-item')}>
              + Add Action Item
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default memo(SectionContainer)
