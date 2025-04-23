import type { UniqueIdentifier } from '@dnd-kit/core'
import { BaseBlock, BlockIndex } from '../types/block'
import { extractUUID } from './helper'

export function cloneMap<K, V>(map: Map<K, V>): Map<K, V> {
  return new Map(map)
}

export function cloneParentMap(map: Map<string | null, string[]>): Map<string | null, string[]> {
  const newMap = new Map<string | null, string[]>()
  for (const [k, v] of map.entries()) {
    newMap.set(k, [...v])
  }
  return newMap
}

export function reparentBlockIndex<T extends BaseBlock>(
  state: BlockIndex<T>,
  activeId: UniqueIdentifier,
  hoverZone: string
): BlockIndex<T> {
  const byId = cloneMap(state.byId)
  const byParent = cloneParentMap(state.byParent)

  const dragged = byId.get(String(activeId))
  if (!dragged) return state

  const zoneTargetId = extractUUID(hoverZone)
  const isAfter = hoverZone.startsWith('after-')
  const isInto = hoverZone.startsWith('into-')
  const target = byId.get(zoneTargetId)

  const oldParentId = dragged.parentId ?? null
  const newParentId = isInto ? zoneTargetId : target?.parentId ?? null

  if (dragged.type === 'section' && newParentId !== null) return state
  if (dragged.id === zoneTargetId) return state

  // Remove dragged from old parent
  const oldList = byParent.get(oldParentId) ?? []
  const filtered = oldList.filter(id => id !== dragged.id)
  byParent.set(oldParentId, filtered)

  // Insert dragged into new parent
  const newList = [...(byParent.get(newParentId) ?? [])]
  let insertIndex = newList.length

  if (!isInto) {
    const idx = newList.indexOf(zoneTargetId)
    insertIndex = idx === -1 ? newList.length : isAfter ? idx + 1 : idx
  }

  const currentIndex = newList.indexOf(dragged.id)

  if (
    dragged.parentId === newParentId &&
      currentIndex === insertIndex
  ) {
    return state
  }


  newList.splice(insertIndex, 0, dragged.id)
  byParent.set(newParentId, newList)

  byId.set(dragged.id, {
    ...dragged,
    parentId: newParentId,
  })

  return { byId, byParent }
}
