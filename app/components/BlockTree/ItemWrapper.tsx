'use client'

import { memo } from "react"
import { useTreeContext } from "@/app/providers/TreeProvider"
import { useBlocks } from "@/app/providers/BlockProvider"

interface Props {
  id: string
}

const ItemWrapper = ({ id }: Props) => {
  const { blockMap } = useBlocks()
  const { data, ItemRenderer } = useTreeContext()

  const block = blockMap.get(id)
  const content = data?.get(id)

  if (!block || !content) return null

  return <ItemRenderer id={id} content={content} />

}

function areEqual(prev: Props, next: Props) {
  return prev.id === next.id
}

export default memo(ItemWrapper, areEqual)
