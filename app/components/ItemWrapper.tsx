import { memo } from "react";
import Topic from "./Topic";
import Objective from "./Objective";
import { useAgenda } from "../providers/AgendaProvider";
import { BlockContent } from "../hooks/useAgendaDetails";

interface Props {
  id: string
  data?: Map<string, BlockContent>
}

const ItemWrapper = ({ id, data }: Props) => {
  const { blockMap } = useAgenda();
  const block = blockMap.get(id)
  const content = data?.get(id)

  if (!block) return null

  if (!content) return null

  switch (content.type) {
    case "topic":
      return <Topic block={block} content={content} />
    case "objective":
      return <Objective block={block} content={content} />
    default:
      return null
  }

};

function areEqual(prev: Props, next: Props) {
  return prev.id === next.id
}

export default memo(ItemWrapper, areEqual)
