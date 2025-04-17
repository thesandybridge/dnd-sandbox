import { useDraggable } from "@dnd-kit/core"
import { memo } from "react"
import { Agenda } from "../page"

interface Props {
  block: Agenda
}

const SectionWrapper = ({
  block
}: Props) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: block.id })
  const style = { transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)` }
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex-1 border border-gray-400 rounded px-2 py-1 bg-gray-100 cursor-move"
      style={style}
    >
      SECTION {block.id}
    </div>
  )
}

export default memo(SectionWrapper)
