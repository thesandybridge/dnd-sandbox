import type { UniqueIdentifier } from '@dnd-kit/core'
import { Agenda } from '../providers/AgendaProvider'

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
 * @param blocks - The full list of Agenda blocks in flat structure
 * @param blockMap - Map of block ID to block object for O(1) lookup
 * @param childrenMap - Map of parent ID to list of child blocks
 * @param indexMap - Map of block ID to index in the original list (before removal)
 * @param activeId - The ID of the block being dragged
 * @param hoverZone - The drop zone string, e.g. `before-3`, `after-5`, or `into-4`
 * @returns A new Agenda array with the dragged block repositioned
 */
export function reparentBlock(
  blocks: Agenda[],
  blockMap: Map<string, Agenda>,
  childrenMap: Map<string | null, Agenda[]>,
  indexMap: Map<string, number>,
  activeId: UniqueIdentifier,
  hoverZone: string
): Agenda[] {
  const dragged = blockMap.get(activeId.toString())
  if (!dragged) return blocks

  const zoneTargetId = hoverZone.replace(/^(before|after|into)-/, '')
  const target = blockMap.get(zoneTargetId.toString())
  const isAfter = hoverZone.startsWith('after-')
  const isInto = hoverZone.startsWith('into-')

  // Determine new parent ID based on zone type
  const newParentId = isInto
    ? zoneTargetId
    : target?.parentId ?? null

  // Prevent sections from being nested
  if (dragged.type === 'section' && newParentId !== null) {
    return blocks
  }

  // Prevent dropping onto itself
  if (dragged.id === zoneTargetId) return blocks

  // Remove the dragged block from the list
  const remaining = blocks.filter(b => b.id !== activeId)

  // Rebuild index map for remaining list to ensure index correctness
  const remainingIndexMap = new Map<string, number>()
  for (let i = 0; i < remaining.length; i++) {
    remainingIndexMap.set(remaining[i].id, i)
  }

  let insertIndex = remaining.length

  if (isInto) {
    // Get children of the drop target (section)
    const siblings = childrenMap.get(zoneTargetId) ?? []

    if (siblings.length > 0) {
      // Insert after the last visible child of the target section
      const last = siblings[siblings.length - 1]
      const idx = remaining.findIndex(b => b.id === last.id)
      insertIndex = idx === -1 ? remaining.length : idx + 1
    } else {
      // Section is empty — insert right after it
      const idx = remaining.findIndex(b => b.id === zoneTargetId)
      insertIndex = idx === -1 ? remaining.length : idx + 1
    }
  } else {
    // Insert before or after the hovered sibling
    const idx = remaining.findIndex(b => b.id === zoneTargetId)
    insertIndex = idx === -1 ? remaining.length : (isAfter ? idx + 1 : idx)
  }

  // Return new list with dragged block re-inserted at computed index
  const moved = {
    ...dragged,
    parentId: newParentId
  }

  return [
    ...remaining.slice(0, insertIndex),
    moved,
    ...remaining.slice(insertIndex)
  ]
}
