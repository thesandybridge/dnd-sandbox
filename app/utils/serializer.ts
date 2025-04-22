import { createHash } from 'crypto'
import { Block, BlockIndex } from '../types/block'

export type SerializedAgenda = {
  blocks: string
  hash: string
  base64: string
}

type BlockType = Block['type']

type SerializedBlock = [
  id: string,
  parentId: string | null,
  order: number,
  type: BlockType,
  itemId?: string
]

function sortBlocks(blocks: Block[], indexMap?: Map<string, number>) {
  return [...blocks].sort((a, b) => {
    if (a.parentId === b.parentId) {
      if (a.order === b.order) {
        const ai = indexMap?.get(a.id) ?? 0
        const bi = indexMap?.get(b.id) ?? 0
        return ai - bi || a.id.localeCompare(b.id)
      }
      return a.order - b.order
    }
    return String(a.parentId).localeCompare(String(b.parentId)) || a.id.localeCompare(b.id)
  })
}

function serializedOutput(minimal: SerializedBlock[]) {
  const raw = JSON.stringify(minimal)
  const hash = cryptoHash(raw)
  const base64 = Buffer.from(raw).toString('base64')

  return {
    blocks: raw,
    hash,
    base64,
  }
}

export function serializeBlocks(blocks: Block[]): SerializedAgenda {
  const sorted = sortBlocks(blocks)

  const minimal: SerializedBlock[] = sorted.map(b => [
    b.id,
    b.parentId,
    b.order,
    b.type,
    b.itemId,
  ])

  return serializedOutput(minimal)
}

export function serializeBlockIndex(index: BlockIndex<Block>): SerializedAgenda {
  const flat = Array.from(index.byParent.entries())
  .flatMap(([parentId, ids]) => ids.map((id, i) => ({ id, i, parentId })))

  const indexMap = new Map(flat.map(({ id }, idx) => [id, idx]))

  const sorted = sortBlocks(Array.from(index.byId.values()), indexMap)

  const minimal: SerializedBlock[] = sorted.map(b => [
    b.id,
    b.parentId,
    b.order,
    b.type,
    b.itemId,
  ])

  return serializedOutput(minimal)
}

export function deserializeBlocks(serialized: string): Block[] {
  const arr: SerializedBlock[] = JSON.parse(serialized)
  return arr.map(([id, parentId, order, type, itemId]) => ({
    id,
    parentId,
    order,
    type: type as Block['type'],
    itemId: itemId ?? id
  }))
}

export function cryptoHash(input: string): string {
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

export type SerializedDiff = {
  added: SerializedBlock[]
  removed: SerializedBlock[]
  changed: SerializedBlock[]
  hash: string
}

function serializeBlock(b: Block): SerializedBlock {
  return [b.id, b.parentId, b.order, b.type, b.itemId]
}

export function serializeDiff(prev: Block[], next: Block[]): SerializedDiff {
  const changes = diffBlocks(prev, next)

  const added: SerializedBlock[] = []
  const removed: SerializedBlock[] = []
  const changed: SerializedBlock[] = []

  for (const change of changes) {
    const serialized = serializeBlock(change.block)
    if (change.type === 'added') {
      added.push(serialized)
    } else if (change.type === 'removed') {
      removed.push(serialized)
    } else if (change.type === 'changed') {
      changed.push(serialized)
    }
  }

  const raw = JSON.stringify({ added, removed, changed })
  const hash = cryptoHash(raw)

  return {
    added,
    removed,
    changed,
    hash
  }
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
