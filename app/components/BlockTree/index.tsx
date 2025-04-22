import { useTreeContext } from "@/app/providers/TreeProvider"
import VirtualTreeRenderer from "./VirtualTreeRenderer"
import TreeRenderer from "./TreeRenderer"
import { memo } from "react"
import useTestMode from "@/app/hooks/useTestMode"

const BlockTree = () => {
  const { isVirtual } = useTreeContext()
  const { isTesting } = useTestMode()

  if (isVirtual || isTesting) return <VirtualTreeRenderer parentId={null} />

  return <TreeRenderer parentId={null} />
}

export default memo(BlockTree)
