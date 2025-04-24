'use client'

import { memo, useCallback } from 'react'

import { useDraggable } from '@dnd-kit/core'
import { Block } from '@/app/types/block'
import { useBlocks } from '@/app/providers/BlockProvider'
import DragHandle from '../BlockTree/DragHandle'
import { useAgenda } from '@/app/hooks/useAgenda'
import { ActionItemContent } from '@/app/types/agenda'

interface Props {
  blockId: Block['id']
  content?: ActionItemContent
}

const ActionItem = ({ blockId, content }: Props) => {
  const { deleteItem } = useBlocks()
  const { remove } = useAgenda()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: blockId
  });
  const style = {
    transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
  };

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem(blockId);
    remove(blockId)
  }, [blockId, deleteItem, remove]);


  if (!content) return null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-opacity ${isDragging ? 'opacity-0' : 'opacity-100'} flex gap-2 p-2 items-center space-between rounded-lg p-4 border border-gray-300`}
    >
      <DragHandle
        listeners={listeners}
        attributes={attributes}
        blockId={blockId}
      />
      <div className='grow'>
        {content.title}
      </div>
      <button
        onClick={handleDelete}
      >
        ×
      </button>
    </div>
  )
}

export default memo(ActionItem)
