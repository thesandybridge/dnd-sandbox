import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { Popover } from '@mui/material'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { DraggableAttributes } from '@dnd-kit/core'
import { useLocalModifierKey } from '@/app/hooks/useLocalModifierKey'
import { Block } from '@/app/types/block'
import AddItemMenu from './AddItemMenu'
import { useBlocks } from '@/app/providers/BlockProvider'
import { useAgenda } from '@/app/hooks/useAgenda'

type Props = {
  listeners?: SyntheticListenerMap
  attributes: DraggableAttributes
  blockId: Block['id']
}

const DragHandle = ({
  listeners,
  attributes,
  blockId,
}: Props) => {
  const { blockMap } = useBlocks()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const block = blockMap.get(blockId)
  const testId = block?.testId
  const ref = useRef<HTMLButtonElement>(null)
  const shiftPressed = useLocalModifierKey(ref, 'Shift')
  const { deleteItem } = useBlocks()
  const { remove, get } = useAgenda()

  const agendaItem = useMemo(() => block && get(block.id), [block, get])

  const openMenu = () => {
    if (ref.current) setAnchorEl(ref.current)
  }

  const handleRemove = useCallback(() => {
    if (!block) return
    deleteItem(block.id)
    remove(block.itemId)
  }, [block, deleteItem, remove])

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    openMenu()
  }
  const handleClose = useCallback(() => setAnchorEl(null), [setAnchorEl])

  const open = Boolean(anchorEl);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation()

      if (shiftPressed) {
        console.log(blockId)
      } else {
        // trigger drag via DnDKit
        listeners?.onKeyDown?.(e)
      }
    }
  }, [blockId, listeners, shiftPressed])

  return (
    <div className='flex gap-2 items-center'>
      <AddItemMenu targetId={blockId} />
      <button
        {...listeners}
        {...attributes}
        ref={ref}
        onClick={handleClick}
        onTouchEnd={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="flex items-center justify-center text-sm w-6 h-6 cursor-grab active:cursor-grabbing select-none rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        data-testid={testId ? `drag-handle-${testId}` : undefined}
      >
        <FontAwesomeIcon icon={faGripVertical} />
      </button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div className="w-48 p-2">
          <button className="w-full text-left px-2 py-1 hover:bg-gray-100" onClick={handleRemove}>
            Remove {agendaItem?.type.toUpperCase()}
          </button>
        </div>
      </Popover>
    </div>
  )
}

export default memo(DragHandle)
