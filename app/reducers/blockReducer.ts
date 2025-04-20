import { BaseBlock, BlockAction } from "../types/block";
import { reparentBlock } from "../utils/blocks";

function collectDescendantsDFS<T extends BaseBlock>(state: T[], rootId: string): Set<string> {
    const map = new Map<string, T[]>()
    for (const item of state) {
        const list = map.get(item.parentId ?? '') ?? []
        map.set(item.parentId ?? '', [...list, item])
    }

    const toDelete = new Set<string>()
    const stack = [rootId]

    while (stack.length > 0) {
        const id = stack.pop()!
        toDelete.add(id)
        const children = map.get(id) ?? []
        for (const child of children) {
            stack.push(child.id)
        }
    }

    return toDelete
}

export function blockReducer<T extends BaseBlock>(
  state: T[],
  action: BlockAction<T>
): T[] {
  switch (action.type) {
    case 'ADD_ITEM':
      return [...state, action.payload];

    case 'DELETE_ITEM': {
      const toDelete = collectDescendantsDFS(state, action.payload.id)
      return state.filter(item => !toDelete.has(item.id))
    }

    case 'SET_ALL':
      return action.payload;

    case 'MOVE_ITEM': {
      const { activeId, hoverZone, blockMap, childrenMap, indexMap } = action.payload

      return reparentBlock<T>(
        state,
        blockMap,
        childrenMap,
        indexMap,
        activeId,
        hoverZone
      );
    }

    default:
      return state;
  }
}
