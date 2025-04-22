import { UniqueIdentifier } from "@dnd-kit/core"
import { SerializedDiff } from "../utils/serializer"

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
  | { type: 'MOVE_ITEM'; payload: { activeId: UniqueIdentifier; hoverZone: string } }
  | { type: 'APPLY_DIFF'; payload: SerializedDiff }
  | { type: 'INSERT_ITEM'; payload: { item: T; parentId: string | null; index: number } }

export interface Block extends BaseBlock {
  testId?: string
}

export interface BlockIndex<T extends BaseBlock = BaseBlock> {
  byId: Map<string, T>
  byParent: Map<string | null, string[]>
}
