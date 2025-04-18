import type { UniqueIdentifier } from '@dnd-kit/core'
import { Agenda } from '../page';

export function reparentBlock(
  blocks: Agenda[],
  activeId: UniqueIdentifier,
  hoverZone: string,
) {
  // Find the currently dragged block by ID
  const dragged = blocks.find(b => b.id === activeId)
  if (!dragged) return blocks

  // Remove the dragged block from the current block list
  const remaining = blocks.filter(b => b.id !== activeId)

  // DropZones are named like: before-<id>, after-<id>, into-<id>
  // This strips the prefix to get the actual target block ID
  const zoneTargetId = hoverZone.replace(/^(before|after|into)-/, '')

  // Find the target block associated with the hover zone
  const target = blocks.find(b => b.id === zoneTargetId)
  const isAfter = hoverZone.startsWith('after-')
  const isInto = hoverZone.startsWith('into-')

  // Determine the new parentId based on whether the drop is "into" or not
  // Sections cannot be nested, so if a section is being moved and a new parentId is inferred, abort
  const newParentIdGuess = isInto
    ? zoneTargetId
    : target?.parentId ?? null

  if (dragged.type === 'section' && newParentIdGuess !== null) {
    return blocks
  }

  // Determine where in the array the dragged item should be inserted
  let insertIndex = remaining.length

  if (isInto) {
    // Reparenting "into" another block — only sections can accept this
    const siblings = remaining.filter(b => b.parentId === zoneTargetId)

    if (siblings.length > 0) {
      const last = siblings[siblings.length - 1]
      const idx = remaining.findIndex(b => b.id === last.id)
      insertIndex = idx + 1
    } else {
      const parentIdx = remaining.findIndex(b => b.id === zoneTargetId)
      insertIndex = parentIdx + 1
    }
  } else {
    // Dropping before or after a sibling
    let idx = remaining.findIndex(b => b.id === zoneTargetId)
    if (idx === -1) idx = remaining.length
    insertIndex = isAfter ? idx + 1 : idx
  }

  // Rebuild the dragged block with its new parent
  const moved = {
    ...dragged,
    parentId: newParentIdGuess
  }

  // Insert the moved block at the calculated index
  return [
    ...remaining.slice(0, insertIndex),
    moved,
    ...remaining.slice(insertIndex)
  ]
}
