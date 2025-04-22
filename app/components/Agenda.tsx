'use client'

import { memo } from "react"
import { TreeProvider } from '../providers/TreeProvider'
import { useAgendaDetails, BlockContent } from "../hooks/useAgendaDetails"
import { useBlocks } from "../providers/BlockProvider"
import Topic from "./Topic"
import Objective from "./Objective"
import { useSyncAgendaContent } from "../hooks/useSyncAgendaContext"
import { useBlockSerialization } from "../hooks/useBlockSerialization"
import { MiniMap } from "./MiniMap"
import ActionItem from "./ActionItem"
import BlockTree from "./BlockTree"
import useTestMode from "../hooks/useTestMode"
import SandboxControls from "./SandboxControls"
import AgendaControls from "./AgendaControls"

const ItemRenderer = ({ id, content }: { id: string, content: BlockContent }) => {
  const { blockMap } = useBlocks()
  const block = blockMap.get(id)
  if (!block) return null

  switch (content.type) {
    case "topic":
      return <Topic block={block} content={content} />
    case "objective":
      return <Objective block={block} content={content} />
    case "action-item":
      return <ActionItem block={block} content={content} />
    default:
      return null
  }
}


const Agenda = () => {
  const { blocks, normalizedIndex} = useBlocks()
  const { data } = useAgendaDetails(blocks)
  const { prev, next } = useBlockSerialization(blocks, normalizedIndex)
  const { isTesting } = useTestMode()

  useSyncAgendaContent()

  if (!data) return null

  return (
    <TreeProvider
      data={data}
      ItemRenderer={ItemRenderer}
      expandAll={isTesting}
    >
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Agenda DnD Demo</h1>
        <AgendaControls />
        <SandboxControls />
        <div className="flex flex-col-reverse md:flex-row gap-2">
          <div className={isTesting ? "w-full" : "md:w-2/3"}>
            <BlockTree />
          </div>
          {!isTesting && (
            <div className="md:w-1/3">
              <div className="sticky top-2 py-2">
                <MiniMap prev={prev} next={next} />
              </div>
            </div>
          )}
        </div>
      </div>
    </TreeProvider>
  )
}

export default memo(Agenda)
