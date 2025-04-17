import { useDraggable } from "@dnd-kit/core"
import { memo } from "react"
import { Agenda } from "../page"

interface Props {
  block: Agenda
}

const ItemWrapper = ({ block }: Props) => {
const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: block.id })
  const style = { transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)` }
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="border border-gray-300 rounded-lg p-3 bg-white mb-2 shadow-sm"
      style={style}
    >
      TOPIC {block.id}
    </div>
  )
}

export default memo(ItemWrapper)
