import { blockReducer } from '../app/reducers/blockReducer'
import { Block } from '../app/types/block'
import { BlockIndex } from '../app/reducers/blockReducer'

const normalize = (blocks: Block[]): BlockIndex<Block> => {
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

describe('blockReducer', () => {
  it('adds an item', () => {
    const initial = normalize([])
    const newItem: Block = {
      id: '1',
      itemId: '1',
      parentId: null,
      type: 'section'
    }

    const result = blockReducer(initial, { type: 'ADD_ITEM', payload: newItem })
    expect(result.byId.get('1')).toEqual(newItem)
    expect(result.byParent.get(null)).toContain('1')
  })

  it('deletes a block and its children', () => {
    const section: Block = { id: 's', itemId: 's', parentId: null, type: 'section' }
    const topic: Block = { id: 't', itemId: 't', parentId: 's', type: 'topic' }
    const initial = normalize([section, topic])

    const result = blockReducer(initial, { type: 'DELETE_ITEM', payload: { id: 's' } })
    expect(result.byId.has('s')).toBe(false)
    expect(result.byId.has('t')).toBe(false)
    expect(result.byParent.get(null)).not.toContain('s')
    expect(result.byParent.get('s')).toBeUndefined()
  })

  it('sets all blocks', () => {
    const newBlocks: Block[] = [
      { id: 'a', itemId: 'a', parentId: null, type: 'section' }
    ]
    const result = blockReducer(normalize([]), { type: 'SET_ALL', payload: newBlocks })
    expect(result.byId.get('a')).toEqual(newBlocks[0])
    expect(result.byParent.get(null)).toEqual(['a'])
  })

  it('moves a topic into a section', () => {
    const section: Block = { id: 's', itemId: 's', parentId: null, type: 'section' }
    const topic: Block = { id: 't', itemId: 't', parentId: null, type: 'topic' }
    const initial = normalize([section, topic])

    const result = blockReducer(initial, {
      type: 'MOVE_ITEM',
      payload: { activeId: 't', hoverZone: 'into-s' }
    })

    expect(result.byId.get('t')?.parentId).toBe('s')
    expect(result.byParent.get(null)).toContain('s')
    expect(result.byParent.get('s')).toContain('t')
  })
})
