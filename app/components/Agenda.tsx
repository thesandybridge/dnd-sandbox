'use client'

import { memo } from "react"
import { TreeProvider } from '../providers/TreeProvider'
import { useAgendaDetails, BlockContent } from "../hooks/useAgendaDetails"
import { useTreeContext } from "../providers/TreeProvider"
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

const AgendaControls = () => {
  const { createItem, setAll } = useBlocks()
  const { isTesting } = useTestMode()
  const { DisplayKey, isShiftHeld, toggleVirtual, isVirtual } = useTreeContext()

  return (
    <div className="flex flex-col gap-1">
      <div className="flex p-1 gap-2 items-center">
        <button
          onClick={() => createItem('section', null)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Section
        </button>
        <button
          onClick={() => createItem('topic', null)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Topic
        </button>
        <button
          onClick={() => createItem('objective', null)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Objective
        </button>
        <button
          onClick={() => createItem('action-item', null)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Action Item
        </button>
        <button
          onClick={() => setAll([])}
          className="px-3 py-1 bg-orange-500 text-white rounded"
        >
          Reset
        </button>
      </div>
      <div className="flex p-1 gap-2 items-center">
        {!isTesting && (
          <button
            onClick={toggleVirtual}
            className="px-3 py-1 bg-blue-500 text-white rounded">
            Toggle Virtual
          </button>
        )}
        {(isVirtual || isTesting) && <div className="p-1 border-solid border border-purple-100">Virtual Tree Renderer Enabled</div>}
        {isShiftHeld && <DisplayKey />}
      </div>
    </div>
  )
}

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
