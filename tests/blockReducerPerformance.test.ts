import { Block } from '@/app/types/block'
import { blockReducer } from "@/app/reducers/blockReducer"

function createLargeBlock(sectionCount: number, topicsPerSection = 10): Block[] {
  const blocks: Block[] = []
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

function buildMaps(blocks: Block[]) {
  const blockMap = new Map<string, Block>()
  const childrenMap = new Map<string | null, Block[]>()
  const indexMap = new Map<string, number>()

  blocks.forEach((block, index) => {
    blockMap.set(block.id, block)
    indexMap.set(block.id, index)
    const key = block.parentId ?? null
    const children = childrenMap.get(key) ?? []
    childrenMap.set(key, [...children, block])
  })

  return { blockMap, childrenMap, indexMap }
}

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

describe('blockReducer performance under randomized MOVE_ITEM', () => {
  const testScenarios = [
    { sectionCount: 100, topicsPerSection: 10, maxMs: 500 },
    { sectionCount: 500, topicsPerSection: 10, maxMs: 7000 },
    { sectionCount: 1000, topicsPerSection: 10, maxMs: 40000 },
  ]

  testScenarios.forEach(({ sectionCount, topicsPerSection, maxMs }) => {
    it(`performs ${sectionCount * topicsPerSection} MOVE_ITEM actions in under ${maxMs}ms`, () => {
      const topicCount = sectionCount * topicsPerSection
      const movesToPerform = topicCount

      let state = createLargeBlock(sectionCount, topicsPerSection)

      const topicIds = state.filter(b => b.type === 'topic').map(b => b.id)
      const dropZones = topicIds.map(id => `after-${id}`)

      const start = performance.now()

      for (let i = 0; i < movesToPerform; i++) {
        const activeId = getRandom(topicIds)
        let hoverZone = getRandom(dropZones)

        while (hoverZone === `after-${activeId}`) {
          hoverZone = getRandom(dropZones)
        }

        const { blockMap, childrenMap, indexMap } = buildMaps(state)

        state = blockReducer(state, {
          type: 'MOVE_ITEM',
          payload: {
            activeId,
            hoverZone,
            blockMap,
            childrenMap,
            indexMap,
          }
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
