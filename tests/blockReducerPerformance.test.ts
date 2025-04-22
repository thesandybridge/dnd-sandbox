import { Block } from '@/app/types/block'
import { blockReducer, BlockIndex } from "@/app/reducers/blockReducer"

function createLargeBlock(sectionCount: number, topicsPerSection = 10): Block[] {
  const blocks: Block[] = []
  for (let i = 0; i < sectionCount; i++) {
    const sectionId = `section-${i}`
    blocks.push({ id: sectionId, type: 'section', parentId: null, itemId: sectionId })

    for (let j = 0; j < topicsPerSection; j++) {
      blocks.push({
        id: `topic-${i}-${j}`,
        type: 'topic',
        parentId: sectionId,
        itemId: `topic-${i}-${j}`,
      })
    }
  }
  return blocks
}

function normalize(blocks: Block[]): BlockIndex<Block> {
  const byId = new Map<string, Block>()
  const byParent = new Map<string | null, string[]>()

  for (const block of blocks) {
    byId.set(block.id, block)
    const key = block.parentId ?? null
    const list = byParent.get(key) ?? []
    byParent.set(key, [...list, block.id])
  }

  return { byId, byParent }
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
      const flat = createLargeBlock(sectionCount, topicsPerSection)
      const topicIds = flat.filter(b => b.type === 'topic').map(b => b.id)
      const dropZones = topicIds.map(id => `after-${id}`)

      let state = normalize(flat)

      const start = performance.now()

      for (let i = 0; i < topicIds.length; i++) {
        const activeId = getRandom(topicIds)
        let hoverZone = getRandom(dropZones)

        while (hoverZone === `after-${activeId}`) {
          hoverZone = getRandom(dropZones)
        }

        state = blockReducer(state, {
          type: 'MOVE_ITEM',
          payload: {
            activeId,
            hoverZone,
          }
        })
      }

      const end = performance.now()
      const duration = end - start
      const avg = duration / topicIds.length

      console.log(
        `Performed ${topicIds.length} random MOVE_ITEM actions in ${duration.toFixed(
          2
        )}ms (avg: ${avg.toFixed(4)}ms per move)`
      )

      const totalBlocks = sectionCount + (sectionCount * topicsPerSection)
      expect(state.byId.size).toBe(totalBlocks)

      expect(duration).toBeLessThan(maxMs)
    })
  })
})
