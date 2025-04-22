'use client'

import { Fragment, memo, useCallback, useRef } from 'react'
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
import { useVirtualizer } from '@tanstack/react-virtual'

interface Props {
  parentId?: string | null
}

const dndConfig = { collisionDetection: closestCenter }

const VirtualTreeRenderer = ({ parentId = null }: Props) => {
  const { moveItem } = useBlocks()
  const {
    blocksByParent,
    activeBlock,
    setActiveId,
    activeId,
    hoverZone,
    data,
    setHoverZone,
    expandedMap,
  } = useTreeContext()

  const items = blocksByParent.get(parentId) ?? []
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 10,
  })

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
      <div ref={parentRef}>
        <div
          className={indent}
          style={{
            paddingTop: rowVirtualizer.getVirtualItems()[0]?.start ?? 0,
            paddingBottom:
              rowVirtualizer.getTotalSize() -
              (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0),
          }}
        >
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const idx = virtualRow.index
            const block = items[idx]

            const parentIsCollapsed = block.parentId &&
              items.find(b => b.id === block.parentId)?.type === 'section' &&
              !expandedMap[block.parentId]

            if (parentIsCollapsed) return null

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

export default memo(VirtualTreeRenderer)
