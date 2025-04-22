import { useEffect, useMemo, useRef, useState } from 'react'
import { serializeBlocks, diffBlocks, deserializeBlocks } from '../utils/serializer'
import { Block } from '../types/block'

export function useBlockSerialization(blocks: Block[]) {
  const serialized = useMemo(() => serializeBlocks(blocks), [blocks])
  const prev = useRef<Block[]>(blocks)
  const [lastDiff, setLastDiff] = useState<Block[]>([])
  const [lastPrev, setLastPrev] = useState<Block[]>([])

  const currentDiff = useMemo(() => diffBlocks(prev.current, blocks), [blocks])

  useEffect(() => {
    if (currentDiff.length > 0) {
      setLastPrev(prev.current)
      setLastDiff(blocks)
    }

    prev.current = blocks
  }, [blocks, currentDiff.length])

  return {
    serialized,
    prev: lastPrev,
    next: lastDiff,
    deserialize: deserializeBlocks
  }
}
