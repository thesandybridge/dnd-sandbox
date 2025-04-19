'use client'

import { memo } from "react"
import { useTreeContext, TreeProvider } from '../providers/TreeProvider'
import { useAgenda } from '../providers/AgendaProvider'
import TreeRenderer from "./TreeRenderer"

const AgendaInner = () => {
  const { createItem } = useAgenda()
  const {
    DisplayKey,
    isShiftHeld
  } = useTreeContext()

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Agenda DnD Demo</h1>
      <div className="flex p-4 gap-2">
        <button onClick={() => createItem('section', null)} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded">+ Section</button>
        <button onClick={() => createItem('topic', null)} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded">+ Topic</button>
        <button onClick={() => createItem('objective', null)} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded">+ Objective</button>
        {isShiftHeld && <DisplayKey />}
      </div>
      <TreeRenderer parentId={null} />
    </div>
  )
}

const Agenda = () => (
  <TreeProvider>
    <AgendaInner />
  </TreeProvider>
)

export default memo(Agenda)
