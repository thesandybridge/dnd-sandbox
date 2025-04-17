import { useDroppable } from "@dnd-kit/core"
import { memo, useCallback, useEffect } from "react"

interface Props {
  id: string,
  onHover: (zoneId: string, parentId: string | null) => void
  parentId: string | null,
}

const DropZone = ({ id, onHover, parentId }: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  const handleHover = useCallback(() => onHover(id, parentId), [id, parentId, onHover])

  useEffect(() => { if (isOver) handleHover() }, [isOver, handleHover])
  return (
    <div
      ref={setNodeRef}
      data-zone-id={id}
      data-parent-id={parentId ?? ''}
      onDragOver={e => {
        e.preventDefault()
        const zoneId = e.currentTarget.dataset.zoneId
        const parentId = e.currentTarget.dataset.parentId || null
        if (zoneId) {
          onHover(zoneId, parentId)
        }
      }}
      className={`h-1 rounded transition-colors ${isOver ? 'bg-blue-500' : 'bg-transparent'}`} />
  )
}

export default memo(DropZone)
