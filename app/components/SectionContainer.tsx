import { Fragment, memo, useCallback, useMemo } from "react"
import ItemWrapper from "./ItemWrapper"
import DropZone from "./DropZone"
import { Agenda } from "../page"
import { Dispatch } from "react"
import { useAgenda } from "../providers/AgendaProvider"
import { BlockContent } from "../hooks/useAgendaDetails"
import { useDraggable } from "@dnd-kit/core"
import Section from "./Section"

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
  onHover: (zoneId: string, parentId: string | null) => void;
  data?: Map<string, BlockContent>
}

const SectionContainer = ({
  block,
  expandedMap,
  dispatchExpand,
  onHover,
  blocks,
  data,
}: Props) => {
  const { createItem, deleteItem } = useAgenda()
  const children = useSectionChildren(block.id, blocks)
  const isExpanded = !!expandedMap[block.id]
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: block.id });
  const content = data?.get(block.id)

  const style = {
    transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
  };

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem(block.id);
  }, [block.id, deleteItem]);

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-center gap-2 justify-between bg-gray-50 rounded-lg p-2">
        <div className="flex gap-2 align-center justify-center">
          <div {...listeners} {...attributes} className="cursor-move px-1">
            ☰ {/* drag handle icon */}
          </div>
          <button onClick={() => dispatchExpand({ type: 'TOGGLE', id: block.id })} className="text-gray-600">
            {isExpanded ? '▾' : '▸'}
          </button>
        </div>
        {content?.type === 'section' && <Section block={block} content={content} />}
        <button
          onClick={handleDelete}
          className="p-1 text-red-600"
        >
          ×
        </button>
        {!isExpanded && (
          <div>{children.length} Item{`${children.length === 1 ? '' : 's'}`}</div>
        )}
      </div>
      {children.length === 0 && isExpanded && (
        <DropZone
          id={`into-${block.id}`}
          onHover={onHover}
          parentId={block.parentId}
          type="section"
        />
      )}
      {!isExpanded && (
        <DropZone
          id={`into-${block.id}`}
          onHover={onHover}
          parentId={block.parentId}
          type="section"
        />
      )}
      {isExpanded && (
        <>
          <div className="">
            {children.map(child => (
              <Fragment key={child.id}>
                <DropZone
                  id={`before-${child.id}`}
                  onHover={onHover}
                  parentId={child.parentId}
                />
                <ItemWrapper id={child.id} data={data} />
                <DropZone
                  id={`after-${child.id}`}
                  onHover={onHover}
                  parentId={child.parentId}
                />
              </Fragment>
            ))}
          </div>
          <div className="flex p-4 gap-2">
            <div
              className="flex items-center justify-center p-2 cursor-pointer"
              onClick={() => createItem('topic', block.id)}
            >
              + Add Topic
            </div>
            <div
              className="flex items-center justify-center p-2 cursor-pointer"
              onClick={() => createItem('objective', block.id)}
            >
              + Add Objective
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default memo(SectionContainer)
