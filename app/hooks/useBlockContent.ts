import { useAgendaDetails } from '@/app/hooks/useAgendaDetails'
import { Block } from '@/app/types/block'
import { BlockContent } from '@/app/hooks/useAgendaDetails'

export function useBlockContent(block: Block | undefined, blocks: Block[]): BlockContent | undefined {
  const { data } = useAgendaDetails(blocks)
  if (!block) return
  return data?.get(block.id)
}
