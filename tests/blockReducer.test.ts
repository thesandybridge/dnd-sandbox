import { Block } from '@/app/types/block'
import { blockReducer } from '@/app/reducers/blockReducer'

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

describe('blockReducer', () => {
  it('adds an item', () => {
    const state: Block[] = []
    const newItem: Block = { id: '1', type: 'section', parentId: null }
    const next = blockReducer(state, { type: 'ADD_ITEM', payload: newItem })

    expect(next).toHaveLength(1)
    expect(next[0]).toEqual(newItem)
  })

  it('deletes a block and its children', () => {
    const state: Block[] = [
      { id: '1', type: 'section', parentId: null },
      { id: '2', type: 'topic', parentId: '1' },
      { id: '3', type: 'topic', parentId: null },
    ]
    const next = blockReducer(state, { type: 'DELETE_ITEM', payload: { id: '1' } })

    expect(next).toHaveLength(1)
    expect(next[0].id).toBe('3')
  })

  it('sets all blocks', () => {
    const newState: Block[] = [
      { id: 'a', type: 'section', parentId: null }
    ]
    const result = blockReducer([], { type: 'SET_ALL', payload: newState })

    expect(result).toEqual(newState)
  })

  it('moves a topic into a section', () => {
    const state: Block[] = [
      { id: '1', type: 'section', parentId: null },
      { id: '2', type: 'topic', parentId: null }
    ]

    const { blockMap, childrenMap, indexMap } = buildMaps(state)

    const next = blockReducer(state, {
      type: 'MOVE_ITEM',
      payload: {
        activeId: '2',
        hoverZone: 'into-1',
        blockMap,
        childrenMap,
        indexMap,
      }
    })

    const moved = next.find(b => b.id === '2')
    expect(moved?.parentId).toBe('1')
  })
})
