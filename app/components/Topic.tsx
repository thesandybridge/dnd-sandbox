import { memo } from "react"
import { Agenda } from "../page";

interface Props {
  block: Agenda
}

const Topic = ({ block }: Props) => {
  return (
    <div
      className="border border-gray-300 rounded-lg p-3 bg-green-100 mb-2 shadow-sm"
    >
      Topic {block.id}
    </div>
  );
}

export default memo(Topic)
