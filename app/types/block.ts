import { UniqueIdentifier } from "@dnd-kit/core";

export interface BaseBlock {
  id: string
  type: 'section' | 'topic' | 'objective' | 'action-item'
  parentId: string | null
  order: number
  itemId: string
  [key: string]: unknown
}

export type BlockAction<T extends BaseBlock> =
| { type: 'ADD_ITEM'; payload: T }
| { type: 'DELETE_ITEM'; payload: { id: string } }
| { type: 'SET_ALL'; payload: T[] }
| {
  type: 'MOVE_ITEM'
  payload: {
    activeId: UniqueIdentifier
    hoverZone: string
    blockMap: Map<string, T>
    childrenMap: Map<string | null, T[]>
    indexMap: Map<string, number>
  }
}


export interface Block extends BaseBlock {
  testId?: string
}

export interface BlockIndex<T extends BaseBlock = BaseBlock> {
  byId: Map<string, T>
  byParent: Map<string | null, string[]>
}
