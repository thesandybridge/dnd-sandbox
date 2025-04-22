import { BlockIndex, BaseBlock } from '@/app/types/block'
import { deserializeBlock, SerializedDiff } from '@/app/utils/serializer'
import { blockReducer } from '@/app/reducers/blockReducer'
import { reparentBlockIndex } from './blocks'

export function applyBlockDiff<T extends BaseBlock>(
  state: BlockIndex<T>,
  diff: SerializedDiff
): BlockIndex<T> {
  const { added, removed, changed } = diff
  let nextState = state

  // 1. DELETE
  for (const [id] of removed) {
    nextState = blockReducer(nextState, {
      type: 'DELETE_ITEM',
      payload: { id },
    })
  }

  // 2. ADD
  for (const serialized of added) {
    const block = deserializeBlock(serialized)
    nextState = blockReducer(nextState, {
      type: 'ADD_ITEM',
      payload: block as T,
    })
  }

  // 3. CHANGE (move/reorder)
  for (const [id, parentId, order, type, itemId] of changed) {
    const current = nextState.byId.get(id)
    if (!current) continue

    const needsMove = current.parentId !== parentId || current.order !== order
    if (!needsMove) continue

    // Update block metadata
    const updated = { ...current, parentId, order, type, itemId }
    const byId = new Map(nextState.byId)
    byId.set(id, updated)

    // Reparent and reorder via shared util
    nextState = reparentBlockIndex(
      { byId, byParent: nextState.byParent },
      id,
      `after-${id}` // hoverZone is faked to trigger reparenting
    )
  }

  return nextState
}
