'use client'

import { Fragment, memo, useCallback } from 'react'
import SectionContainer from './SectionContainer'
import ItemWrapper from './ItemWrapper'
import DropZone from './DropZone'
import { useTreeContext } from '@/app/providers/TreeProvider'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
} from '@dnd-kit/core'
import { useBlocks } from '@/app/providers/BlockProvider'

interface Props {
  parentId?: string | null
}

const dndConfig = { collisionDetection: closestCenter }

const TreeRenderer = ({ parentId = null }: Props) => {
  const { moveItem } = useBlocks()
  const {
    blocksByParent,
    activeBlock,
    setActiveId,
    activeId,
    hoverZone,
    data,
    setHoverZone,
  } = useTreeContext()

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [setActiveId])

  const handleDragEnd = useCallback(() => {
    if (!activeId || !hoverZone) return
    moveItem(activeId, hoverZone)
    setActiveId(null)
    setHoverZone(null)
  }, [activeId, hoverZone, moveItem, setActiveId, setHoverZone])

  const items = blocksByParent.get(parentId) ?? []
  const indent = parentId
    ? 'ml-6 border-l border-gray-300 pl-4'
    : 'flex flex-col gap-2'

  return (
    <DndContext
      {...dndConfig}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className={indent}>
        {items.map((block, idx) => {
          return (
            <Fragment key={block.id}>
              {idx === 0 && (
                <DropZone
                  id={`before-${block.id}`}
                  parentId={block.parentId}
                />
              )}
              {block.type === 'section' ? (
                <SectionContainer block={block} />
              ) : (
                  <ItemWrapper id={block.id} />
                )}
              <DropZone
                id={`after-${block.id}`}
                parentId={block.parentId}
              />
            </Fragment>
          )
        })}
      </div>
      <DragOverlay>
        {activeBlock && (
          <div className="bg-white border border-gray-300 shadow-md rounded-md p-3 text-sm w-64 pointer-events-none">
            <div className="text-gray-500 uppercase text-xs tracking-wide mb-1">
              {activeBlock.type}
            </div>
            <div className="font-semibold text-gray-800 mb-2">
              {data?.get(activeBlock.id)?.title ?? `Untitled ${activeBlock.type}`}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default memo(TreeRenderer)
