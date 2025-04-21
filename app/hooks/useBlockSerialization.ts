import { useEffect, useMemo, useRef } from 'react'
import { serializeBlocks, diffBlocks, deserializeBlocks } from '../utils/serializer'
import { Block } from '../types/block'

export function useBlockSerialization(blocks: Block[]) {
  const serialized = useMemo(() => serializeBlocks(blocks), [blocks])
  const prev = useRef<Block[]>(blocks)

  const diff = useMemo(() => diffBlocks(prev.current, blocks), [blocks])

  useEffect(() => {
    prev.current = blocks
  }, [blocks])

  return {
    serialized,
    diff,
    deserialize: deserializeBlocks
  }
}
