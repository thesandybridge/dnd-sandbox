import { BaseBlock, BlockAction, BlockIndex } from "../types/block"
import { cloneMap, cloneParentMap, reparentBlockIndex } from "../utils/blocks"
import { applyBlockDiff } from "../utils/diff"

export function blockReducer<T extends BaseBlock>(
  state: BlockIndex<T>,
  action: BlockAction<T>
): BlockIndex<T> {
  switch (action.type) {
    case 'ADD_ITEM': {
      const byId = cloneMap(state.byId)
      const byParent = cloneParentMap(state.byParent)
      const item = action.payload

      byId.set(item.id, item)

      const parentKey = item.parentId ?? null
      const list = byParent.get(parentKey) ?? []

      // Insert using provided order if present
      const insertAt = typeof item.order === 'number' && item.order <= list.length
        ? item.order
        : list.length

      const newList = [...list]
      newList.splice(insertAt, 0, item.id)

      byParent.set(parentKey, newList)

      return { byId, byParent }
    }

    case 'INSERT_ITEM': {
      const { item, parentId, index } = action.payload
      const updated = new Map(state.byParent)
      const siblings = [...(updated.get(parentId) ?? [])]
      siblings.splice(index, 0, item.id)
      updated.set(parentId, siblings)

      return {
        byId: new Map(state.byId).set(item.id, item),
        byParent: updated,
      }
    }

    case 'DELETE_ITEM': {
      const byId = cloneMap(state.byId)
      const byParent = cloneParentMap(state.byParent)

      const collectDescendants = (id: string): Set<string> => {
        const toDelete = new Set<string>()
        const stack = [id]
        while (stack.length > 0) {
          const current = stack.pop()!
          toDelete.add(current)
          const children = byParent.get(current) ?? []
          stack.push(...children)
        }
        return toDelete
      }

      const idsToDelete = collectDescendants(action.payload.id)
      for (const id of idsToDelete) {
        byId.delete(id)
        byParent.delete(id)
      }

      for (const [parent, list] of byParent.entries()) {
        byParent.set(parent, list.filter(id => !idsToDelete.has(id)))
      }

      return { byId, byParent }
    }

    case 'SET_ALL': {
      const byId = new Map<string, T>()
      const byParent = new Map<string | null, string[]>()

      for (const block of action.payload) {
        byId.set(block.id, block)
        const key = block.parentId ?? null
        const list = byParent.get(key) ?? []
        byParent.set(key, [...list, block.id])
      }

      return { byId, byParent }
    }

    case 'MOVE_ITEM': {
      return reparentBlockIndex(state, action.payload.activeId, action.payload.hoverZone)
    }

    case 'APPLY_DIFF': {
      return applyBlockDiff(state, action.payload)
    }

    default:
      return state
  }
}

