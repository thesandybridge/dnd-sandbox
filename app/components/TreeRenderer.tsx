import { Fragment, memo, useMemo, Dispatch } from "react"
import SectionContainer from "./SectionContainer"
import ItemWrapper from "./ItemWrapper"
import DropZone from "./DropZone"
import { Agenda } from "../page"
import { BlockContent } from "../hooks/useAgendaDetails"

export type ExpandAction = {
  type: 'TOGGLE'
  id: string
}

export interface Props {
  blocks: Agenda[]
  expandedMap: Record<string, boolean>
  dispatchExpand: Dispatch<ExpandAction>
  onHover: (zoneId: string, parentId: string | null) => void
  parentId: string | null
  data?: Map<string, BlockContent>
}

const TreeRenderer = ({
  blocks,
  parentId,
  onHover,
  expandedMap,
  dispatchExpand,
  data,
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
  const indent = parentId ? 'ml-6 border-l border-gray-300 pl-4' : 'flex flex-col gap-2'

  return (
    <div className={indent}>
      {items.map((block, idx) => {
        const childBlocks = blocksByParent.get(block.id) ?? []

        return (
          <Fragment key={block.id}>
            {idx === 0 && (
              <DropZone
                id={`before-${block.id}`}
                onHover={onHover}
                parentId={block.parentId}
              />
            )}
            {block.type === 'section' ? (
              <SectionContainer
                block={block}
                blocks={childBlocks}
                expandedMap={expandedMap}
                dispatchExpand={dispatchExpand}
                onHover={onHover}
                data={data}
              />
            ) : (
                <ItemWrapper id={block.id} data={data} />
              )}
            <DropZone
              id={`after-${block.id}`}
              onHover={onHover}
              parentId={block.parentId}
            />
          </Fragment>
        )
      })}
    </div>
  )
}

export default memo(TreeRenderer)
