'use client'

import { useAgendaItem } from './useAgendaItem'
import { useBlocks } from '@/app/providers/BlockProvider'
import type { BlockContent } from '@/app/hooks/useAgendaDetails'
import { Block } from '@/app/types/block'

type BlockContentWithoutId = Omit<BlockContent, 'id'>

export function useConvertItem() {
  const { create } = useAgendaItem()
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
