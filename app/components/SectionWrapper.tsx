import { useDraggable } from "@dnd-kit/core";
import { memo } from "react";
import { Agenda } from "../page";
import { useAgenda } from "../providers/AgendaProvider";

interface Props {
    block: Agenda;
}

const SectionWrapper = ({ block }: Props) => {
    const { deleteItem } = useAgenda();
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: block.id });
    const style = {
        transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteItem(block.id);
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="flex-1 border border-gray-400 rounded px-2 py-1 bg-gray-100 cursor-move relative"
            style={style}
        >
            <span>SECTION {block.id}</span>
            <button
                onPointerDown={e => e.stopPropagation()}
                onClick={handleDelete}
                className="absolute top-0 right-0 p-1 text-red-600"
            >
                ×
            </button>
        </div>
    );
};

export default memo(SectionWrapper)
