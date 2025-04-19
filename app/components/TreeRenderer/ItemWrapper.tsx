'use client'

import { memo } from "react"
import Topic from "../Topic"
import Objective from "../Objective"
import { useTreeContext } from "@/app/providers/TreeProvider"
import { useBlocks } from "@/app/providers/BlockProvider"

interface Props {
  id: string
}

const ItemWrapper = ({ id }: Props) => {
  const { blockMap } = useBlocks()
  const { data } = useTreeContext()

  const block = blockMap.get(id)
  const content = data?.get(id)

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
