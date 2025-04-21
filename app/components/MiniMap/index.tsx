import { Block } from "@/app/types/block"
import { BlockChange } from "@/app/utils/serializer"
import { TreeNode, buildTree } from "@/app/utils/serializer"

export function MiniMap({ blocks, changes }: { blocks: Block[], changes: BlockChange[] }) {
  const changeMap = new Map<string, BlockChange>()
  for (const change of changes) {
    changeMap.set(change.block.id, change)
  }

  const removedBlocks = changes
  .filter(c => c.type === 'removed')
  .map(c => c.block)

  const tree = buildTree(blocks, removedBlocks)

  return (
    <div className="p-2 rounded text-sm font-mono text-gray-800 bg-gray-100 border">
      {tree.map(node => (
        <MiniBlock key={node.id} block={node} changeMap={changeMap} />
      ))}
    </div>
  )
}

function MiniBlock({
  block,
  changeMap
}: {
  block: TreeNode
  changeMap: Map<string, BlockChange>
}) {
  const change = changeMap.get(block.id)
  let icon = ''
  let color = 'bg-gray-100'

  switch (change?.type) {
    case 'added':
      icon = '+'
      color = 'bg-green-100'
      break
    case 'removed':
      icon = '-'
      color = 'bg-red-100'
      break
    case 'changed':
      icon = '⚡️'
      color = 'bg-yellow-100'
      break
  }

  return (
    <div
      style={{ paddingLeft: block.depth * 12 }}
      className={`py-0.5 ${color} hover:bg-gray-200 flex flex-col`}
    >
      <div className="flex gap-1 items-center">
        <span className="text-sm">{icon}</span>
        <span className="text-xs">{block.type.toUpperCase()}</span>
        <span className="text-gray-500 text-xs ml-auto">{block.id}</span>
      </div>

      {block.children.map(child => (
        <MiniBlock key={child.id} block={child} changeMap={changeMap} />
      ))}
    </div>
  )
}
