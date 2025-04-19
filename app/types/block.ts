import { UniqueIdentifier } from "@dnd-kit/core";

export interface BaseBlock {
  id: string
  type: string
  parentId: string | null
  [key: string]: unknown
}

export type BlockAction<T extends BaseBlock> =
  | { type: 'ADD_ITEM'; payload: T }
  | { type: 'DELETE_ITEM'; payload: { id: string } }
  | { type: 'SET_ALL'; payload: T[] }
  | { type: 'MOVE_ITEM'; payload: { activeId: UniqueIdentifier; hoverZone: string } }


export interface Block extends BaseBlock {
  type: 'section' | 'topic' | 'objective'
  testId?: string
}
