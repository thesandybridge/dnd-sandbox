import { memo, useCallback } from 'react'
import { useTreeContext } from "@/app/providers/TreeProvider"
import VirtualTreeRenderer from "./VirtualTreeRenderer"
import TreeRenderer from "./TreeRenderer"
import useTestMode from "@/app/hooks/useTestMode"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  MouseSensor,
} from '@dnd-kit/core'
import { useBlocks } from '@/app/providers/BlockProvider'

const dndConfig = { collisionDetection: closestCenter }
const BlockTree = () => {

  const { moveItem } = useBlocks()
  const {
    isVirtual,
    activeBlock,
    setActiveId,
    activeId,
    hoverZone,
    data,
    setHoverZone,
  } = useTreeContext()
  const { isTesting } = useTestMode()
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      }
    }),
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


  return (
    <DndContext
      {...dndConfig}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      {(isVirtual || isTesting) ? (
          <VirtualTreeRenderer parentId={null} />
      ) : (
          <TreeRenderer parentId={null} />
        )}
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

export default memo(BlockTree)
