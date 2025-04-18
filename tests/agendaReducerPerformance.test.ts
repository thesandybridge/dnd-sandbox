import { agendaReducer } from '@/app/reducers/agendaReducer'
import type { Agenda } from '@/app/page'

function createLargeAgenda(sectionCount: number, topicsPerSection = 10): Agenda[] {
  const blocks: Agenda[] = []
  for (let i = 0; i < sectionCount; i++) {
    const sectionId = `section-${i}`
    blocks.push({ id: sectionId, type: 'section', parentId: null })

    for (let j = 0; j < topicsPerSection; j++) {
      blocks.push({
        id: `topic-${i}-${j}`,
        type: 'topic',
        parentId: sectionId,
      })
    }
  }
  return blocks
}

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

describe('agendaReducer performance under randomized MOVE_ITEM', () => {
  const testScenarios = [
    { sectionCount: 100, topicsPerSection: 10, maxMs: 500 },
    { sectionCount: 500, topicsPerSection: 10, maxMs: 7000 },
    { sectionCount: 1000, topicsPerSection: 10, maxMs: 40000 },
  ]

  testScenarios.forEach(({ sectionCount, topicsPerSection, maxMs }) => {
    it(`performs ${sectionCount * topicsPerSection} MOVE_ITEM actions in under ${maxMs}ms`, () => {
      const topicCount = sectionCount * topicsPerSection
      const movesToPerform = topicCount

      let state = createLargeAgenda(sectionCount, topicsPerSection)

      const topicIds = state.filter(b => b.type === 'topic').map(b => b.id)
      const dropZones = topicIds.map(id => `after-${id}`)

      const start = performance.now()

      for (let i = 0; i < movesToPerform; i++) {
        const activeId = getRandom(topicIds)
        let hoverZone = getRandom(dropZones)

        // Avoid no-op
        while (hoverZone === `after-${activeId}`) {
          hoverZone = getRandom(dropZones)
        }

        state = agendaReducer(state, {
          type: 'MOVE_ITEM',
          payload: { activeId, hoverZone },
        })
      }

      const end = performance.now()
      const duration = end - start
      const avg = duration / movesToPerform

      expect(state.length).toBe(sectionCount + topicCount)

      console.log(
        `Performed ${movesToPerform} random MOVE_ITEM actions in ${duration.toFixed(
2
)}ms (avg: ${avg.toFixed(4)}ms per move)`
      )

      expect(duration).toBeLessThan(maxMs)
    })
  })
})
