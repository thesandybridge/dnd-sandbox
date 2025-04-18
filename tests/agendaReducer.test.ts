import type { Agenda } from '@/app/page'
import { agendaReducer } from '@/app/reducers/agendaReducer'

describe('agendaReducer', () => {
  it('adds an item', () => {
    const state: Agenda[] = []
    const newItem: Agenda = { id: '1', type: 'section', parentId: null }
    const next = agendaReducer(state, { type: 'ADD_ITEM', payload: newItem })

    expect(next).toHaveLength(1)
    expect(next[0]).toEqual(newItem)
  })

  it('deletes a block and its children', () => {
    const state: Agenda[] = [
      { id: '1', type: 'section', parentId: null },
      { id: '2', type: 'topic', parentId: '1' },
      { id: '3', type: 'topic', parentId: null },
    ]
    const next = agendaReducer(state, { type: 'DELETE_ITEM', payload: { id: '1' } })

    expect(next).toHaveLength(1)
    expect(next[0].id).toBe('3')
  })

  it('sets all blocks', () => {
    const newState: Agenda[] = [
      { id: 'a', type: 'section', parentId: null }
    ]
    const result = agendaReducer([], { type: 'SET_ALL', payload: newState })

    expect(result).toEqual(newState)
  })

  it('moves a topic into a section', () => {
    const state: Agenda[] = [
      { id: '1', type: 'section', parentId: null },
      { id: '2', type: 'topic', parentId: null }
    ]

    const next = agendaReducer(state, {
      type: 'MOVE_ITEM',
      payload: {
        activeId: '2',
        hoverZone: 'into-1'
      }
    })

    const moved = next.find(b => b.id === '2')
    expect(moved?.parentId).toBe('1')
  })
})
