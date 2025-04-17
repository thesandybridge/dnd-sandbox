import { useDraggable } from "@dnd-kit/core"
import { memo } from "react"
import { Agenda } from "../page"
import Topic from "./Topic"
import Objective from "./Objective"

interface Props {
  block: Agenda
}

const ItemWrapper = ({ block }: Props) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: block.id })
  const style = { transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)` }

  if (!block) return null

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
    >
      {block.type === 'topic' && (
        <Topic block={block}/>
      )}
      {block.type === 'objective' && (
        <Objective block={block} />
      )}
    </div>
  )
}

export default memo(ItemWrapper)
