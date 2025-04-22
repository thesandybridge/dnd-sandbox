import { Block } from "@/app/types/block"
import { serializeDiff } from "@/app/utils/serializer"
import { TreeNode, buildTree } from "@/app/utils/serializer"

export function MiniMap({ prev, next }: { prev: Block[], next: Block[] }) {
  const { added, removed, changed } = serializeDiff(prev, next)

  const changeMap = new Map<string, { type: 'added' | 'removed' | 'changed' }>()

  for (const [id] of added) {
    changeMap.set(id, { type: 'added' })
  }

  for (const [id] of removed) {
    changeMap.set(id, { type: 'removed' })
  }

  for (const [id] of changed) {
    // only set 'changed' if not already marked as 'added' or 'removed'
    if (!changeMap.has(id)) {
      changeMap.set(id, { type: 'changed' })
    }
  }

  const allBlocks = next.concat(
    removed.map(([id, parentId, order, type, itemId]) => ({
      id,
      parentId,
      order,
      type: type as Block['type'],
      itemId: itemId ?? id
    }))
  )

  const tree = buildTree(allBlocks)

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
  changeMap: Map<string, { type: 'added' | 'removed' | 'changed' }>
}) {
  const change = changeMap.get(block.id)

  const color  = {
    added: 'bg-green-100',
    removed: 'bg-red-100',
    changed: 'bg-yellow-100'
  }[change?.type ?? ''] ?? 'bg-gray-100'

  const icon = {
    added: '+',
    removed: '_',
    changed: '⚡️'
  }[change?.type ?? ''] ?? ''

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
