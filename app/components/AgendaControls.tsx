import { memo, useCallback } from "react"
import { useTreeContext } from "../providers/TreeProvider"
import { useBlocks } from "../providers/BlockProvider"
import useTestMode from "../hooks/useTestMode"
import { Block } from "../types/block"
import { useAgenda } from "../hooks/useAgenda"

const AgendaControls = () => {
  const { createItem, setAll } = useBlocks()
  const { create, removeAll } = useAgenda()
  const { isTesting } = useTestMode()
  const { DisplayKey, isShiftHeld, toggleVirtual, isVirtual } = useTreeContext()

  const handleCreateItem = useCallback((type: Block['type']) => {
    const itemId = crypto.randomUUID()
    const block = createItem(type, null, itemId)

    switch (type) {
      case 'section':
        create({
          id: itemId,
          type,
          title: `SECTION ${itemId.slice(0, 4)}`,
          summary: '',
        }, block.id)
        break
      case 'topic':
        create({
          id: itemId,
          type,
          title: `TOPIC ${itemId.slice(0, 4)}`,
          description: '',
        }, block.id)
        break
      case 'objective':
        create({
          id: itemId,
          type,
          title: `OBJECTIVE ${itemId.slice(0, 4)}`,
          progress: 0,
        }, block.id)
        break
      case 'action-item':
        create({
          id: itemId,
          type,
          title: `ACTION ITEM ${itemId.slice(0, 4)}`,
        }, block.id)
        break
    }
  }, [create, createItem])

  const handleReset = useCallback(() => {
    setAll([])
    removeAll()
  }, [removeAll, setAll])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex p-1 gap-2 items-center">
        <button
          onClick={() => handleCreateItem('section')}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Section
        </button>
        <button
          onClick={() => handleCreateItem('topic')}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Topic
        </button>
        <button
          onClick={() => handleCreateItem('objective')}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Objective
        </button>
        <button
          onClick={() => handleCreateItem('action-item')}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Action Item
        </button>
        <button
          onClick={handleReset}
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

export default memo(AgendaControls)
