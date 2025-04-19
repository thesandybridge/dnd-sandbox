import { BaseBlock, BlockAction } from "../types/block";
import { reparentBlock } from "../utils/blocks";

export function blockReducer<T extends BaseBlock>(
  state: T[],
  action: BlockAction<T>
): T[] {
  switch (action.type) {
    case 'ADD_ITEM':
      return [...state, action.payload];

    case 'DELETE_ITEM': {
      const toDelete = new Set<string>([action.payload.id]);
      let oldSize: number;
      do {
        oldSize = toDelete.size;
        for (const item of state) {
          if (item.parentId && toDelete.has(item.parentId)) {
            toDelete.add(item.id);
          }
        }
      } while (toDelete.size !== oldSize);

      return state.filter(item => !toDelete.has(item.id));
    }

    case 'SET_ALL':
      return action.payload;

    case 'MOVE_ITEM': {
      const blockMap = new Map<string, T>();
      const childrenMap = new Map<string | null, T[]>();
      const indexMap = new Map<string, number>();

      for (let i = 0; i < state.length; i++) {
        const block = state[i];
        blockMap.set(block.id, block);
        indexMap.set(block.id, i);

        const key = block.parentId ?? null;
        const list = childrenMap.get(key) ?? [];
        childrenMap.set(key, [...list, block]);
      }

      return reparentBlock<T>(
        state,
        blockMap,
        childrenMap,
        indexMap,
        action.payload.activeId,
        action.payload.hoverZone
      );
    }

    default:
      return state;
  }
}
