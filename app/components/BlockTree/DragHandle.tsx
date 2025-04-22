import { memo, useRef, useState } from 'react'
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
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const openMenu = () => {
    if (ref.current) setAnchorEl(ref.current)
  }

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    openMenu()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation()

      if (shiftPressed) {
        openMenu()
      } else {
        // trigger drag via DnDKit
        listeners?.onKeyDown?.(e)
      }
    }
  }

  return (
    <>
      <button
        {...listeners}
        {...attributes}
        ref={ref}
        onClick={handleClick}
        onTouchEnd={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="cursor-grab active:cursor-grabbing px-1 select-none"
        data-testid={testId ? `drag-handle-${testId}` : undefined}
      >
        ☰
      </button>
      <AddItemMenu
        targetId={blockId}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
      />
    </>
  )
}

export default memo(DragHandle)
