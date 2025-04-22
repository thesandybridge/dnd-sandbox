import { memo, useRef } from 'react'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { DraggableAttributes } from '@dnd-kit/core'
import { useLocalModifierKey } from '@/app/hooks/useLocalModifierKey'
import { Block } from '@/app/types/block'
import AddItemMenu from './AddItemMenu'

type Props = {
  listeners?: SyntheticListenerMap
  attributes: DraggableAttributes
  testId?: string
  blockId: Block['id']
}

const DragHandle = ({
  listeners,
  attributes,
  testId,
  blockId,
}: Props) => {
  const ref = useRef<HTMLButtonElement>(null)
  const shiftPressed = useLocalModifierKey(ref, 'Shift')

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    console.log(blockId)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation()

      if (shiftPressed) {
        console.log(blockId)
      } else {
        // trigger drag via DnDKit
        listeners?.onKeyDown?.(e)
      }
    }
  }

  return (
    <div className='flex gap-1 items-center'>
      <AddItemMenu targetId={blockId} />
      <button
        {...listeners}
        {...attributes}
        ref={ref}
        onClick={handleClick}
        onTouchEnd={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="w-8 h-8 cursor-grab active:cursor-grabbing select-none p-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        data-testid={testId ? `drag-handle-${testId}` : undefined}
      >
        ☰
      </button>
    </div>
  )
}

export default memo(DragHandle)
