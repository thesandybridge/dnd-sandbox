'use client'

import { useDroppable } from '@dnd-kit/core'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { useTreeContext } from '@/app/providers/TreeProvider'

interface Props {
  id: string
  parentId: string | null
  type?: 'topic' | 'section' | 'objective'
}

const DropZone = ({ id, parentId, type }: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id })
  const { handleHover } = useTreeContext()

  const handleInternalHover = useCallback(() => {
    handleHover(id, parentId)
  }, [handleHover, id, parentId])

  useEffect(() => {
    if (isOver) handleInternalHover()
  }, [isOver, handleInternalHover])

  const color = useMemo(() => {
    switch (type) {
      case 'section':
        return 'bg-green-500'
      default:
        return 'bg-blue-500'
    }
  }, [type])

  return (
    <div
      ref={setNodeRef}
      data-zone-id={id}
      data-testid={id}
      data-parent-id={parentId ?? ''}
      onDragOver={e => {
        e.preventDefault()
        const zoneId = e.currentTarget.dataset.zoneId
        const parent = e.currentTarget.dataset.parentId || null
        if (zoneId) handleHover(zoneId, parent)
      }}
      className={`flex-none h-1 rounded transition-colors ${isOver ? color : 'bg-transparent'}`}
    />
  )
}

export default memo(DropZone)
