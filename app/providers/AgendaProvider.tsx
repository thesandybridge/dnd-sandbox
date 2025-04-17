// src/context/AgendaContext.tsx
'use client'
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useMemo,
  useCallback
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { UniqueIdentifier } from '@dnd-kit/core'
import { Agenda } from '../page'
import { reparentBlock } from '../utils/blocks'

export type AgendaAction =
| { type: 'ADD_ITEM';    payload: Agenda }
| { type: 'DELETE_ITEM'; payload: { id: string } }
| { type: 'SET_ALL';     payload: Agenda[] }
| { type: 'MOVE_ITEM';   payload: { activeId: UniqueIdentifier; hoverZone: string } }

function agendaReducer(state: Agenda[], action: AgendaAction): Agenda[] {
  switch (action.type) {
    case 'ADD_ITEM':
      return [...state, action.payload];
    case 'DELETE_ITEM': {
      const toDelete = new Set<string>([action.payload.id]);
      // keep adding children of anything in toDelete
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
    };
    case 'SET_ALL':
      return action.payload;
    case 'MOVE_ITEM':
      return reparentBlock (state, action.payload.activeId, action.payload.hoverZone);
    default:
      return state;
  }
}

interface AgendaContextValue {
  blocks: Agenda[];
  blockMap: Map<string, Agenda>
  createItem: (type: Agenda['type'], parentId?: string | null) => Agenda;
  deleteItem: (id: string) => void;
  moveItem: (activeId: UniqueIdentifier, hoverZone: string) => void;
  setAll: (blocks: Agenda[]) => void;
}

const AgendaContext = createContext<AgendaContextValue | undefined>(undefined);

export function AgendaProvider({ children }: { children: ReactNode }) {
  const [blocks, dispatch] = useReducer(agendaReducer, []);

  const blockMap = useMemo(() => {
    const map = new Map<string, Agenda>()
    for (const block of blocks) {
      map.set(block.id, block)
    }
    return map
  }, [blocks])

  const createItem = useCallback((type: Agenda['type'], parentId: string | null = null) => {
    const newItem: Agenda = { id: uuidv4(), type, parentId };
    dispatch({ type: 'ADD_ITEM', payload: newItem });
    return newItem;
  }, []);

  const deleteItem = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: { id } });
  }, []);

  const moveItem = useCallback((activeId: UniqueIdentifier, hoverZone: string) => {
    dispatch({ type: 'MOVE_ITEM', payload: { activeId, hoverZone } });
  }, []);

  const setAll = useCallback((all: Agenda[]) => {
    dispatch({ type: 'SET_ALL', payload: all });
  }, []);

  const contextValue = useMemo(() => ({
    blocks,
    blockMap,
    createItem,
    deleteItem,
    moveItem,
    setAll
  }), [blockMap, blocks, createItem, deleteItem, moveItem, setAll])

  return (
    <AgendaContext.Provider value={contextValue}>
      {children}
    </AgendaContext.Provider>
  );
}

export function useAgenda() {
  const ctx = useContext(AgendaContext);
  if (!ctx) throw new Error('useAgenda must be inside AgendaProvider');
  return ctx;
}
