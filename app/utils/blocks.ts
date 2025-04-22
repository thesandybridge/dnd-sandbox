import type { UniqueIdentifier } from '@dnd-kit/core'
import { BaseBlock } from '../types/block'

/**
 * Reparents and repositions a block within a flat tree structure
 * based on a drag-and-drop hover zone target.
 *
 * This function:
 * - Removes the dragged block from the list
 * - Determines the new parent ID based on drop semantics (`into`, `before`, `after`)
 * - Computes the new insertion index relative to the updated list
 * - Returns a new list with the block moved into the correct position
 *
 * @param blocks - The full list of blocks in flat structure
 * @param blockMap - Map of block ID to block object for O(1) lookup
 * @param childrenMap - Map of parent ID to list of child blocks
 * @param indexMap - Map of block ID to index in the original list (before removal)
 * @param activeId - The ID of the block being dragged
 * @param hoverZone - The drop zone string, e.g. `before-3`, `after-5`, or `into-4`
 * @returns A new Block array with the dragged block repositioned
 */
export function reparentBlock<T extends BaseBlock>(
  blocks: T[],
  blockMap: Map<string, T>,
  childrenMap: Map<string | null, T[]>,
  indexMap: Map<string, number>,
  activeId: UniqueIdentifier,
  hoverZone: string
): T[] {
  const dragged = blockMap.get(activeId.toString())
  if (!dragged) return blocks

  const zoneTargetId = hoverZone.replace(/^(before|after|into)-/, '')
  const target = blockMap.get(zoneTargetId.toString())
  const isAfter = hoverZone.startsWith('after-')
  const isInto = hoverZone.startsWith('into-')

  const newParentId = isInto
    ? zoneTargetId
    : target?.parentId ?? null

  if (dragged.type === 'section' && newParentId !== null) return blocks
  if (dragged.id === zoneTargetId) return blocks

  const oldParentId = dragged.parentId ?? null
  const remaining = blocks.filter(b => b.id !== dragged.id)

  let insertIndex = remaining.length

  if (isInto) {
    const siblings = childrenMap.get(zoneTargetId) ?? []
    const last = siblings.at(-1)
    if (last) {
      const idx = remaining.findIndex(b => b.id === last.id)
      insertIndex = idx === -1 ? remaining.length : idx + 1
    } else {
      const idx = remaining.findIndex(b => b.id === zoneTargetId)
      insertIndex = idx === -1 ? remaining.length : idx + 1
    }
  } else {
    const idx = remaining.findIndex(b => b.id === zoneTargetId)
    insertIndex = idx === -1 ? remaining.length : (isAfter ? idx + 1 : idx)
  }

  const moved = {
    ...dragged,
    parentId: newParentId
  }

  const result = [
    ...remaining.slice(0, insertIndex),
    moved,
    ...remaining.slice(insertIndex)
  ]

  // only rebuild order for affected parent groups
  const parentsToUpdate = new Set<string | null>()
  parentsToUpdate.add(oldParentId)
  parentsToUpdate.add(newParentId)

  const updated: T[] = []

  for (const block of result) {
    if (!parentsToUpdate.has(block.parentId ?? null)) {
      updated.push(block)
      continue
    }

    const siblings = result.filter(b => (b.parentId ?? null) === (block.parentId ?? null))
    const index = siblings.findIndex(b => b.id === block.id)
    const newBlock = block.order !== index ? { ...block, order: index } : block
    updated.push(newBlock)
  }

  return updated
}
