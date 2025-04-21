'use client'

import { memo } from "react"
import { TreeProvider } from '../providers/TreeProvider'
import TreeRenderer from "./TreeRenderer"
import { useAgendaDetails, BlockContent } from "../hooks/useAgendaDetails"
import { useTreeContext } from "../providers/TreeProvider"
import { useBlocks } from "../providers/BlockProvider"
import Topic from "./Topic"
import Objective from "./Objective"
import { useSyncAgendaContent } from "../hooks/useSyncAgendaContext"
import { useBlockSerialization } from "../hooks/useBlockSerialization"
import { MiniMap } from "./MiniMap"

const AgendaControls = () => {
  const { createItem } = useBlocks()
  const { DisplayKey, isShiftHeld } = useTreeContext()

  return (
    <div className="flex p-4 gap-2">
      <button onClick={() => createItem('section', null)} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded">+ Section</button>
      <button onClick={() => createItem('topic', null)} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded">+ Topic</button>
      <button onClick={() => createItem('objective', null)} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded">+ Objective</button>
      {isShiftHeld && <DisplayKey />}
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
    default:
      return null
  }
}

const Agenda = ({
  expandAll
}: {
  expandAll?: boolean,
}) => {
  const { blocks } = useBlocks()
  const { data } = useAgendaDetails(blocks)

  const { diff } = useBlockSerialization(blocks)
  useSyncAgendaContent()
  if (!data) return null

  return (
    <TreeProvider
      data={data}
      ItemRenderer={ItemRenderer}
      expandAll={expandAll}
    >
      <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Agenda DnD Demo</h1>
        <AgendaControls />
        <TreeRenderer parentId={null} />
        <MiniMap blocks={blocks} changes={diff} />
      </div>
    </TreeProvider>
  )
}

export default memo(Agenda)
