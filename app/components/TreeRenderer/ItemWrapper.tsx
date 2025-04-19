'use client'

import { memo } from "react"
import Topic from "../Topic"
import Objective from "../Objective"
import { useAgenda } from "@/app/providers/AgendaProvider"
import { useTreeContext } from "@/app/providers/TreeProvider"

interface Props {
  id: string
}

const ItemWrapper = ({ id }: Props) => {
  const { blockMap } = useAgenda()
  const { agendaData } = useTreeContext()

  const block = blockMap.get(id)
  const content = agendaData?.get(id)

  if (!block || !content) return null

  switch (content.type) {
    case "topic":
      return <Topic block={block} content={content} />
    case "objective":
      return <Objective block={block} content={content} />
    default:
      return null
  }
}

function areEqual(prev: Props, next: Props) {
  return prev.id === next.id
}

export default memo(ItemWrapper, areEqual)
