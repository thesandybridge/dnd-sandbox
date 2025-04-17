import { memo } from "react"
import { Agenda } from "../page";

interface Props {
  block: Agenda
}

const Objective = ({ block }: Props) => {
  return (
    <div
      className="border border-gray-300 rounded-lg p-3 bg-blue-100 mb-2 shadow-sm"
    >
      Objective {block.id}
    </div>
  );
}

export default memo(Objective)
