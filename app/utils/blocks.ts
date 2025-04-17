import type { UniqueIdentifier } from '@dnd-kit/core'
import { Agenda } from '../page';

export function reparentBlock(blocks: Agenda[], activeId: UniqueIdentifier, hoverZone: string) {
  const dragged = blocks.find(b => b.id === activeId)
  if (!dragged) return blocks

  const remaining = blocks.filter(b => b.id !== activeId)

  const zoneTargetId = hoverZone.replace(/^(before|after|into)-/, '')
  const target = blocks.find(b => b.id === zoneTargetId)
  const isAfter = hoverZone.startsWith('after-')
  const isInto = hoverZone.startsWith('into-')

  // ── HARD BLOCK: prevent nesting a section under any parent ──
  const newParentIdGuess = isInto
    ? zoneTargetId
    : target?.parentId ?? null

  if (dragged.type === 'section' && newParentIdGuess !== null) {
    return blocks
  }

  // ── compute insertIndex ──
  let insertIndex = remaining.length

  if (isInto) {
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
    let idx = remaining.findIndex(b => b.id === zoneTargetId)
    if (idx === -1) idx = remaining.length
    insertIndex = isAfter ? idx + 1 : idx
  }

  const moved = {
    ...dragged,
    parentId: newParentIdGuess
  }

  return [
    ...remaining.slice(0, insertIndex),
    moved,
    ...remaining.slice(insertIndex)
  ]
}
