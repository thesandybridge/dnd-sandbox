'use client'

import { memo, useCallback } from 'react'

import { useDraggable } from '@dnd-kit/core'
import { useBlocks } from '../providers/BlockProvider'
import { Block } from '../types/block'
import { ActionItemContent } from '../hooks/useAgendaDetails'
import DragHandle from './BlockTree/DragHandle'

interface Props {
  block: Block
  content?: ActionItemContent
}

const ActionItem = ({ block, content }: Props) => {
  const { deleteItem } = useBlocks()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id
  });
  const style = {
    transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
  };

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem(block.id);
  }, [block.id, deleteItem]);


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
        onMenuOpen={() => console.log(block.itemId)}
        testId={block.testId}
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
