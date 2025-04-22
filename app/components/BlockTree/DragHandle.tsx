import { memo, useRef } from 'react'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { DraggableAttributes } from '@dnd-kit/core'
import { useLocalModifierKey } from '@/app/hooks/useLocalModifierKey'

type Props = {
  listeners?: SyntheticListenerMap
  attributes: DraggableAttributes
  onMenuOpen?: () => void
  testId?: string
}

const DragHandle = ({ listeners, attributes, onMenuOpen, testId }: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const shiftPressed = useLocalModifierKey(ref, 'Shift')

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    onMenuOpen?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation()

      if (shiftPressed) {
        onMenuOpen?.()
      } else {
        // trigger drag via DnDKit
        listeners?.onKeyDown?.(e)
      }
    }
  }

  return (
    <div
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
    </div>
  )
}

export default memo(DragHandle)
