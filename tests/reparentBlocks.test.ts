import { Block, BlockIndex } from '@/app/types/block'
import { reparentBlockIndex } from '@/app/utils/blocks'

function createBlockIndex(blocks: Block[]): BlockIndex<Block> {
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

function flatten(index: BlockIndex<Block>): Block[] {
  const result: Block[] = []

  const walk = (parentId: string | null) => {
    const children = index.byParent.get(parentId) ?? []
    for (const id of children) {
      const b = index.byId.get(id)
      if (b) {
        result.push(b)
        if (b.type === 'section') walk(b.id)
      }
    }
  }

  walk(null)
  return result
}

describe('reparentBlockIndex', () => {
  const base: Block[] = [
    { id: '1', type: 'section', parentId: null, itemId: '1' },
    { id: '2', type: 'topic', parentId: '1', itemId: '2' },
    { id: '3', type: 'topic', parentId: null, itemId: '3' },
    { id: '4', type: 'section', parentId: null, itemId: '4' }
  ]

  it('moves a topic into a section', () => {
    const index = createBlockIndex(base)
    const result = reparentBlockIndex(index, '3', 'into-1')

    const moved = result.byId.get('3')
    expect(moved?.parentId).toBe('1')
  })

  it('prevents a section from being nested', () => {
    const index = createBlockIndex(base)
    const result = reparentBlockIndex(index, '4', 'into-1')

    expect(flatten(result)).toEqual(flatten(index))
  })

  it('moves a topic before another', () => {
    const index = createBlockIndex(base)
    const result = reparentBlockIndex(index, '3', 'before-4')

    const ids = flatten(result).map(b => b.id)
    expect(ids).toEqual(['1', '2', '3', '4'])
  })
})
