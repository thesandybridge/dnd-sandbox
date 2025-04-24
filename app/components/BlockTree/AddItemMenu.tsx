'use client'

import { memo, useCallback, useRef, useState } from 'react'
import { useBlocks } from '@/app/providers/BlockProvider'
import type { Block } from '@/app/types/block'
import { Popover } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useAgenda } from '@/app/hooks/useAgenda'

type Props = {
  targetId: Block['id']
}

const AddItemMenu = ({ targetId }: Props) => {
  const ref = useRef<HTMLButtonElement>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const { insertItem } = useBlocks()
  const { create } = useAgenda()

  const openMenu = () => {
    if (ref.current) setAnchorEl(ref.current)
  }

  const handleAdd = useCallback((type: Block['type']) => {
    const itemId = crypto.randomUUID()
    const block = insertItem(type, targetId, 'after')
    switch (type) {
      case 'section':
        create({
          id: itemId,
          type,
          title: `SECTION ${itemId.slice(0, 4)}`,
          summary: '',
        }, block.id)
        break
      case 'topic':
        create({
          id: itemId,
          type,
          title: `TOPIC ${itemId.slice(0, 4)}`,
          description: '',
        }, block.id)
        break
      case 'objective':
        create({
          id: itemId,
          type,
          title: `OBJECTIVE ${itemId.slice(0, 4)}`,
          progress: 0,
        }, block.id)
        break
      case 'action-item':
        create({
          id: itemId,
          type,
          title: `ACTION ITEM ${itemId.slice(0, 4)}`,
        }, block.id)
        break
    }
    setAnchorEl(null)
  }, [insertItem, targetId, create])

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    openMenu()
  }

  const handleClose = useCallback(() => setAnchorEl(null), [setAnchorEl])

  const open = Boolean(anchorEl);

  return (
    <>
      <button
        ref={ref}
        onClick={handleClick}
        onTouchEnd={handleClick}
        className="flex items-center justify-center w-6 h-6 text-sm select-none rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FontAwesomeIcon icon={faPlus} />
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
          <button className="w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => handleAdd('topic')}>
            + Add Topic
          </button>
          <button className="w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => handleAdd('objective')}>
            + Add Objective
          </button>
          <button className="w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => handleAdd('action-item')}>
            + Add Action Item
          </button>
        </div>
      </Popover>
    </>
  )
}

export default memo(AddItemMenu)
