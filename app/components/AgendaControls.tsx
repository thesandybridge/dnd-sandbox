import { memo } from "react"
import { useTreeContext } from "../providers/TreeProvider"
import { useBlocks } from "../providers/BlockProvider"
import useTestMode from "../hooks/useTestMode"

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

export default memo(AgendaControls)
