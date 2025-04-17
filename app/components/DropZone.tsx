import { useDroppable } from "@dnd-kit/core"
import { memo, useCallback, useEffect } from "react"

interface Props {
  id: string,
  onHover: (id: string) => void
}

const DropZone = ({ id, onHover }: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id })
  const handleHover = useCallback(() => onHover(id), [id, onHover])
  useEffect(() => { if (isOver) handleHover() }, [isOver, handleHover])
  return (
    <div
    ref={setNodeRef}
    className={`h-1 rounded transition-colors ${isOver ? 'bg-blue-500' : 'bg-transparent'}`} />
  )
}

export default memo(DropZone)
