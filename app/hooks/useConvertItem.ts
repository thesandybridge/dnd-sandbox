'use client'

import { useBlocks } from '@/app/providers/BlockProvider'
import { Block } from '@/app/types/block'
import { BlockContent } from '../types/agenda'
import { useAgenda } from './useAgenda'

type BlockContentWithoutId = Omit<BlockContent, 'id'>

export function useConvertItem() {
  const { create } = useAgenda()
  const { createItem } = useBlocks()

  const convert = <T extends BlockContentWithoutId>(
    content: T
  ): { blockId: string; itemId: string } => {
    const itemId = crypto.randomUUID()
    const block = createItem(content.type as Block['type'], null, itemId)

    create({ ...content, id: itemId } as BlockContent, block.id)

    return {
      blockId: block.id,
      itemId,
    }
  }

  return { convert }
}
