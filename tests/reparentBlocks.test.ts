// tests/reparentBlock.test.ts
import { reparentBlock } from '@/app/utils/blocks'
import type { Agenda } from '@/app/page'

function createMaps(blocks: Agenda[]) {
  const blockMap = new Map<string, Agenda>()
  const childrenMap = new Map<string | null, Agenda[]>()
  const indexMap = new Map<string, number>()

  blocks.forEach((block, i) => {
    blockMap.set(block.id, block)
    indexMap.set(block.id, i)
    const key = block.parentId ?? null
    const list = childrenMap.get(key) ?? []
    childrenMap.set(key, [...list, block])
  })

  return { blockMap, childrenMap, indexMap }
}

describe('reparentBlock', () => {
  const base: Agenda[] = [
    { id: '1', type: 'section', parentId: null },
    { id: '2', type: 'topic', parentId: '1' },
    { id: '3', type: 'topic', parentId: null },
    { id: '4', type: 'section', parentId: null }
  ]

  it('moves a topic into a section', () => {
    const maps = createMaps(base)
    const result = reparentBlock(base, maps.blockMap, maps.childrenMap, maps.indexMap, '3', 'into-1')

    const moved = result.find(b => b.id === '3')
    expect(moved?.parentId).toBe('1')
  })

  it('prevents a section from being nested', () => {
    const maps = createMaps(base)
    const result = reparentBlock(base, maps.blockMap, maps.childrenMap, maps.indexMap, '4', 'into-1')

    expect(result).toEqual(base)
  })

  it('moves a topic before another', () => {
    const maps = createMaps(base)
    const result = reparentBlock(base, maps.blockMap, maps.childrenMap, maps.indexMap, '3', 'before-4')

    const ids = result.map(b => b.id)
    expect(ids).toEqual(['1', '2', '3', '4'])
  })
})
