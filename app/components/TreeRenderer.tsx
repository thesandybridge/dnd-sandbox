import { Fragment, memo, useMemo, Dispatch } from "react"
import SectionContainer from "./SectionContainer"
import ItemWrapper from "./ItemWrapper"
import DropZone from "./DropZone"
import { Agenda } from "../page"

export type ExpandAction = {
  type: 'TOGGLE'
  id: string
}

export interface Props {
  blocks: Agenda[]
  expandedMap: Record<string, boolean>
  dispatchExpand: Dispatch<ExpandAction>
  onHover: (zoneId: string) => void
  parentId: string | null
}

const TreeRenderer = ({
  blocks,
  parentId,
  onHover,
  expandedMap,
  dispatchExpand
}: Props) => {
  const blocksByParent = useMemo(() => {
    const map = new Map<string | null, Agenda[]>()
    for (const block of blocks) {
      const list = map.get(block.parentId ?? null) ?? []
      map.set(block.parentId ?? null, [...list, block])
    }
    return map
  }, [blocks])

  const items = blocksByParent.get(parentId) ?? []
  const indent = parentId ? 'ml-6 border-l border-gray-300 pl-4' : ''

  return (
    <div className={indent}>
      {items.map(block => {
        const childBlocks = blocksByParent.get(block.id) ?? []

        return (
          <Fragment key={block.id}>
            <DropZone id={`before-${block.id}`} onHover={onHover} />
            {block.type === 'section' ? (
              <SectionContainer
                block={block}
                blocks={childBlocks}
                expandedMap={expandedMap}
                dispatchExpand={dispatchExpand}
                onHover={onHover}
              />
            ) : (
                <ItemWrapper id={block.id} />
              )}
            <DropZone id={`after-${block.id}`} onHover={onHover} />
          </Fragment>
        )
      })}
    </div>
  )
}

export default memo(TreeRenderer)
