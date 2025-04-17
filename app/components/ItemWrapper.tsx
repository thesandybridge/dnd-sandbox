import { useDraggable } from "@dnd-kit/core";
import { memo, useCallback } from "react";
import Topic from "./Topic";
import Objective from "./Objective";
import { useAgenda } from "../providers/AgendaProvider";
import { BlockContent } from "../hooks/useAgendaDetails";

interface Props {
  id: string
  data?: Map<string, BlockContent>
}

const ItemWrapper = ({ id, data }: Props) => {
  const { blockMap, deleteItem } = useAgenda();
  const block = blockMap.get(id)
  const content = data?.get(id)
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = {
    transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
  };

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem(id);
  }, [deleteItem, id]);

  if (!block) return null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-2 p-2 items-center space-between rounded-lg p-4 border border-gray-300"
    >
      <div {...listeners} {...attributes} className="cursor-move px-1">
        ☰ {/* drag handle icon */}
      </div>

      <div className="grow">
        {block.type === "topic" && <Topic block={block} content={content} />}
        {block.type === "objective" && <Objective block={block} content={content} />}
      </div>

      <button
        onClick={handleDelete}
      >
        ×
      </button>
    </div>
  );
};

function areEqual(prev: Props, next: Props) {
  return prev.id === next.id
}

export default memo(ItemWrapper, areEqual)
