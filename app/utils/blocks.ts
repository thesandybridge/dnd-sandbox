import type { UniqueIdentifier } from '@dnd-kit/core'
import { Agenda } from '../page';

export function reparentBlock(
  blocks: Agenda[],
  blockMap: Map<string, Agenda>,
  childrenMap: Map<string | null, Agenda[]>,
  indexMap: Map<string, number>,
  activeId: UniqueIdentifier,
  hoverZone: string
): Agenda[] {
  const dragged = blockMap.get(activeId)
  if (!dragged) return blocks

  const zoneTargetId = hoverZone.replace(/^(before|after|into)-/, '')
  const target = blockMap.get(zoneTargetId)
  const isAfter = hoverZone.startsWith('after-')
  const isInto = hoverZone.startsWith('into-')

  const newParentId = isInto
    ? zoneTargetId
    : target?.parentId ?? null

  if (dragged.type === 'section' && newParentId !== null) {
    return blocks
  }

  if (dragged.id === zoneTargetId) return blocks

  const remaining = blocks.filter(b => b.id !== activeId)

  const remainingIndexMap = new Map<string, number>()
  for (let i = 0; i < remaining.length; i++) {
    remainingIndexMap.set(remaining[i].id, i)
  }

  let insertIndex = remaining.length

  if (isInto) {
    const siblings = childrenMap.get(zoneTargetId) ?? []

    if (siblings.length > 0) {
      const last = siblings[siblings.length - 1]
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

  return [
    ...remaining.slice(0, insertIndex),
    moved,
    ...remaining.slice(insertIndex)
  ]
}
