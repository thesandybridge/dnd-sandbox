import { useDroppable } from "@dnd-kit/core"
import { memo, useCallback, useEffect, useMemo } from "react"

interface Props {
  id: string,
  onHover: (zoneId: string, parentId: string | null) => void
  parentId: string | null,
  type?: 'topic' | 'section' | 'objective'
}

const DropZone = ({ id, onHover, parentId, type }: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  const handleHover = useCallback(() => onHover(id, parentId), [id, parentId, onHover])

  useEffect(() => { if (isOver) handleHover() }, [isOver, handleHover])

  const color = useMemo(() => {
    switch (type) {
      case "section":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }, [type]);

  return (
    <div
      ref={setNodeRef}
      data-zone-id={id}
      data-testid={id}
      data-parent-id={parentId ?? ''}
      onDragOver={e => {
        e.preventDefault()
        const zoneId = e.currentTarget.dataset.zoneId
        const parentId = e.currentTarget.dataset.parentId || null
        if (zoneId) {
          onHover(zoneId, parentId)
        }
      }}
      className={`flex-none h-1 rounded transition-colors ${isOver ? color : 'bg-transparent'}`} />
  )
}

export default memo(DropZone)
