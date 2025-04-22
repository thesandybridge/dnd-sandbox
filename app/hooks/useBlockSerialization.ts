import { useEffect, useMemo, useRef, useState } from 'react'
import { serializeBlockIndex, serializeDiff, deserializeBlocks } from '../utils/serializer'
import { Block, BlockIndex } from '../types/block'

export function useBlockSerialization(blocks: Block[], index: BlockIndex<Block>) {
  const serialized = useMemo(() => serializeBlockIndex(index), [index])

  const prev = useRef<Block[]>(blocks)
  const [lastDiff, setLastDiff] = useState<Block[]>([])
  const [lastPrev, setLastPrev] = useState<Block[]>([])

  const currentDiff = useMemo(() => {
    return serializeDiff(prev.current, blocks)
  }, [blocks])

  useEffect(() => {
    if (
      currentDiff.added.length > 0 ||
      currentDiff.removed.length > 0 ||
      currentDiff.changed.length > 0
    ) {
      setLastPrev(prev.current)
      setLastDiff(blocks)
    }

    prev.current = blocks
  }, [blocks, currentDiff.added.length, currentDiff.changed.length, currentDiff.hash, currentDiff.removed.length])

  return {
    serialized,
    prev: lastPrev,
    next: lastDiff,
    deserialize: deserializeBlocks,
    diff: currentDiff,
  }
}
