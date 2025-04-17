import { useDraggable } from "@dnd-kit/core";
import { memo, useCallback } from "react";
import Topic from "./Topic";
import Objective from "./Objective";
import { useAgenda } from "../providers/AgendaProvider";

interface Props {
  id: string
}

const ItemWrapper = ({ id }: Props) => {
  const { blockMap, deleteItem } = useAgenda();
  const block = blockMap.get(id)
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
      {...listeners}
      {...attributes}
      style={style}
      className="relative"
    >
      {block.type === "topic" && <Topic block={block} />}
      {block.type === "objective" && <Objective block={block} />}
      <button
        onClick={handleDelete}
        onPointerDown={e => e.stopPropagation()}
        className="absolute top-0 right-0 p-1"
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
