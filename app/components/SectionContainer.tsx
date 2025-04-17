import { Fragment, memo, useMemo } from "react"
import SectionWrapper from "./SectionWrapper"
import ItemWrapper from "./ItemWrapper"
import DropZone from "./DropZone"
import { Agenda } from "../page"
import { Dispatch } from "react"

function useSectionChildren(sectionId: string, blocks: Agenda[]) {
  return useMemo(() => blocks.filter(b => b.parentId === sectionId), [blocks, sectionId])
}

export type ExpandAction = {
    type: 'TOGGLE';
    id: string;
};

export interface Props {
    block: Agenda;
    blocks: Agenda[];
    expandedMap: Record<string, boolean>;
    dispatchExpand: Dispatch<ExpandAction>;
    onHover: (zoneId: string) => void;
}

const SectionContainer = ({
  block,
  expandedMap,
  dispatchExpand,
  onHover,
  blocks,
}: Props) => {
  const children = useSectionChildren(block.id, blocks)
  const isExpanded = !!expandedMap[block.id]
  return (
    <div className="mb-4 border border-gray-300 rounded-lg p-2 bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => dispatchExpand({ type: 'TOGGLE', id: block.id })} className="text-gray-600">
          {isExpanded ? '▾' : '▸'}
        </button>
        <SectionWrapper block={block} />
      </div>
      {children.length === 0 && (
        <DropZone id={`into-${block.id}`} onHover={onHover} />
      )}
      {isExpanded && (
        <>
          <div className="ml-6 mt-2 border-l border-gray-300 pl-4">
            {children.map(child => (
              <Fragment key={child.id}>
                <DropZone id={`before-${child.id}`} onHover={onHover} />
                <ItemWrapper block={child} />
                <DropZone id={`after-${child.id}`} onHover={onHover} />
              </Fragment>
            ))}
          </div>
          <div className="flex items-center justify-center p-2">
            Add Item
          </div>
        </>
      )}
    </div>
  )
}

export default memo(SectionContainer)
