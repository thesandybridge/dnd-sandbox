import { useTreeContext } from "@/app/providers/TreeProvider"
import VirtualTreeRenderer from "./VirtualTreeRenderer"
import TreeRenderer from "./TreeRenderer"
import { memo } from "react"

const BlockTree = () => {
  const { isVirtual } = useTreeContext()

  if (isVirtual) return <VirtualTreeRenderer parentId={null} />

  return <TreeRenderer parentId={null} />
}

export default memo(BlockTree)
