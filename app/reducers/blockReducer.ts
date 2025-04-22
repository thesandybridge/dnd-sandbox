import { BaseBlock, BlockAction, BlockIndex } from "../types/block"
import { cloneMap, cloneParentMap, reparentBlockIndex } from "../utils/blocks"

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
      const list = byParent.get(item.parentId ?? null) ?? []
      byParent.set(item.parentId ?? null, [...list, item.id])

      return { byId, byParent }
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

    default:
      return state
  }
}

