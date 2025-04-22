'use client'

import { Dispatch, memo, SetStateAction, useCallback } from 'react'
import { useBlocks } from '@/app/providers/BlockProvider'
import type { Block } from '@/app/types/block'
import { Popover } from '@mui/material'

type Props = {
  targetId: Block['id']
  anchorEl: HTMLButtonElement | null
  setAnchorEl: Dispatch<SetStateAction<HTMLButtonElement | null>>
}

const AddItemMenu = ({ targetId, anchorEl, setAnchorEl }: Props) => {
  const { insertItem } = useBlocks()

  const handleAdd = useCallback((type: Block['type']) => {
    insertItem(type, targetId, 'after')
    setAnchorEl(null)
  }, [insertItem, targetId, setAnchorEl])

  const handleClose = useCallback(() => setAnchorEl(null), [setAnchorEl])

  const open = Boolean(anchorEl);

  return (
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
  )
}

export default memo(AddItemMenu)
