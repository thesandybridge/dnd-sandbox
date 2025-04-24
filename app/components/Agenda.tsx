'use client'

import { memo } from "react"
import { TreeProvider } from '../providers/TreeProvider'
import { useBlocks } from "../providers/BlockProvider"
import Topic from "./Items/Topic"
import Objective from "./Items/Objective"
import { useBlockSerialization } from "../hooks/useBlockSerialization"
import { MiniMap } from "./MiniMap"
import ActionItem from "./Items/ActionItem"
import BlockTree from "./BlockTree"
import useTestMode from "../hooks/useTestMode"
import SandboxControls from "./SandboxControls"
import AgendaControls from "./AgendaControls"
import { useAgenda } from "../hooks/useAgenda"

const ItemRenderer = ({ id }: { id: string }) => {
  const { get } = useAgenda()
  const content = get(id)

  if (!content) return null

  switch (content.type) {
    case "topic":
      return <Topic blockId={id} content={content} />
    case "objective":
      return <Objective blockId={id} content={content} />
    case "action-item":
      return <ActionItem blockId={id} content={content} />
    default:
      return null
  }
}


const Agenda = () => {
  const { blocks, normalizedIndex} = useBlocks()
  const { getAll } = useAgenda()
  const agendaData = getAll()
  const { prev, next } = useBlockSerialization(blocks, normalizedIndex)
  const { isTesting } = useTestMode()

  if (!agendaData) return null

  return (
    <TreeProvider
      data={agendaData}
      ItemRenderer={ItemRenderer}
      expandAll={isTesting}
    >
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Agenda DnD Demo</h1>
        <AgendaControls />
        <div className="flex flex-col-reverse md:flex-row gap-2">
          <div className={isTesting ? "w-full" : "md:w-2/3"}>
            <BlockTree />
          </div>
          {!isTesting && (
            <div className="md:w-1/3">
              <SandboxControls />
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
