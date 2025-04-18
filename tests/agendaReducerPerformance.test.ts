import { agendaReducer } from '@/app/reducers/agendaReducer'
import type { Agenda } from '@/app/page'

function createLargeAgenda(count: number): Agenda[] {
  const blocks: Agenda[] = []
  for (let i = 0; i < count; i++) {
    const sectionId = `section-${i}`
    blocks.push({ id: sectionId, type: 'section', parentId: null })

    for (let j = 0; j < 10; j++) {
      blocks.push({
        id: `topic-${i}-${j}`,
        type: 'topic',
        parentId: sectionId,
      })
    }
  }
  return blocks
}

describe('agendaReducer performance', () => {
  it('handles moving an item in a large agenda', () => {
    const initialState = createLargeAgenda(100) // 1,100 items

    const moveAction = {
      type: 'MOVE_ITEM' as const,
      payload: {
        activeId: 'topic-50-5',
        hoverZone: 'after-topic-50-6',
      },
    }

    const start = performance.now()

    const nextState = agendaReducer(initialState, moveAction)

    const end = performance.now()
    const duration = end - start

    expect(nextState).toHaveLength(initialState.length)
    expect(nextState.find(b => b.id === 'topic-50-5')?.parentId).toBe('section-50')

    console.log(`agendaReducer MOVE_ITEM took ${duration.toFixed(2)}ms`)
    expect(duration).toBeLessThan(50)
  })
})
