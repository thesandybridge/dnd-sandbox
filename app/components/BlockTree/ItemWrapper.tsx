'use client'

import { memo } from "react"
import { useTreeContext } from "@/app/providers/TreeProvider"
import { useBlocks } from "@/app/providers/BlockProvider"

interface Props {
  id: string
}

const ItemWrapper = ({ id }: Props) => {
  const { blockMap } = useBlocks()
  const { ItemRenderer, hoveredId } = useTreeContext()

  const block = blockMap.get(id)

  if (!block) return null

  const isHovered = hoveredId === block.id

  return (
    <div
      className={`rounded-lg border-2 ${isHovered ? 'border-blue-500' : 'border-transparent'}`}
    >
      <ItemRenderer
        id={id}
      />
    </div>
  )

}

function areEqual(prev: Props, next: Props) {
  return prev.id === next.id
}

export default memo(ItemWrapper, areEqual)
