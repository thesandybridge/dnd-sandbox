import { createHash } from 'crypto'
import { Block } from '../types/block'

export type SerializedAgenda = {
  blocks: string // base64 or JSON-encoded block array
  hash: string   // SHA-256 hash of canonical content
}

export function serializeBlocks(blocks: Block[]): SerializedAgenda {
  const sorted = [...blocks].sort((a, b) => {
    if (a.parentId === b.parentId) return a.order - b.order
    return String(a.parentId).localeCompare(String(b.parentId))
  })

  const minimal = sorted.map(b => [
    b.id,
    b.parentId,
    b.order,
    b.type,
  ])

  const raw = JSON.stringify(minimal)
  const hash = cryptoHash(raw)

  return {
    blocks: raw,
    hash
  }
}

export function deserializeBlocks(serialized: string): Block[] {
  const arr: [string, string | null, number, 'section' | 'topic' | 'objective'][] = JSON.parse(serialized)
  return arr.map(([id, parentId, order, type]) => ({ id, parentId, order, type }))
}

function cryptoHash(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

export type BlockChange =
| { type: 'added'; block: Block }
| { type: 'removed'; block: Block }
| { type: 'changed'; block: Block }

export function diffBlocks(
  prev: Block[],
  next: Block[]
): BlockChange[] {
  const prevMap = new Map(prev.map(b => [b.id, b]))
  const nextMap = new Map(next.map(b => [b.id, b]))
  const changes: BlockChange[] = []

  for (const [id, nextBlock] of nextMap.entries()) {
    const prevBlock = prevMap.get(id)

    if (!prevBlock) {
      changes.push({ type: 'added', block: nextBlock })
    } else {
      const parentChanged = prevBlock.parentId !== nextBlock.parentId
      const orderChanged = prevBlock.order !== nextBlock.order
      const typeChanged = prevBlock.type !== nextBlock.type

      if (parentChanged || orderChanged || typeChanged) {
        changes.push({ type: 'changed', block: nextBlock })
      }
    }
  }

  for (const [id, prevBlock] of prevMap.entries()) {
    if (!nextMap.has(id)) {
      changes.push({ type: 'removed', block: prevBlock })
    }
  }

  return changes
}

export type TreeNode = Block & { children: TreeNode[], depth: number }

export function buildTree(blocks: Block[], extraBlocks: Block[] = []): TreeNode[] {
  const map = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  const allBlocks = [...blocks, ...extraBlocks]

  for (const block of allBlocks) {
    if (map.has(block.id)) continue // don't re-add same ID
    map.set(block.id, { ...block, children: [], depth: 0 })
  }

  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId)!
      node.depth = parent.depth + 1
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots.sort((a, b) => a.order - b.order)
}
