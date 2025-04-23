import { useQuery } from '@tanstack/react-query'
import { Block } from '../types/block'

export type SectionContent = {
  id: string,
  type: 'section'
  title: string
  summary: string
}

export type TopicContent = {
  id: string,
  type: 'topic'
  title: string
  description: string
}

export type ObjectiveContent = {
  id: string,
  type: 'objective'
  title: string
  progress: number
}

export type ActionItemContent = {
  id: string,
  type: 'action-item'
  title: string
}

export type BlockContent =
  | SectionContent
  | TopicContent
  | ObjectiveContent
  | ActionItemContent

export const mockContentStore = new Map<string, BlockContent>()

export const useAgendaDetails = (blocks: Block[]) => {
  return useQuery({
    queryKey: ['agenda-details'],
    queryFn: async () => {
      await new Promise(res => setTimeout(res, 100))

      const map = new Map<string, BlockContent>()

      for (const b of blocks) {
        const itemId = b.itemId
        let existing = mockContentStore.get(itemId)

        if (!existing) {
          let defaults: BlockContent

          switch (b.type) {
            case 'section':
              defaults = {
                id: itemId,
                type: 'section',
                title: `SECTION ${itemId.slice(0, 4)}`,
                summary: '',
              }
              break
            case 'topic':
              defaults = {
                id: itemId,
                type: 'topic',
                title: `TOPIC ${itemId.slice(0, 4)}`,
                description: '',
              }
              break
            case 'objective':
              defaults = {
                id: itemId,
                type: 'objective',
                title: `OBJECTIVE ${itemId.slice(0, 4)}`,
                progress: 0,
              }
              break
            case 'action-item':
              defaults = {
                id: itemId,
                type: 'action-item',
                title: `ACTION ITEM ${itemId.slice(0, 4)}`,
              }
              break
            default:
              continue
          }

          existing = defaults
          mockContentStore.set(itemId, existing)
        }

        map.set(b.id, existing)
      }

      return map
    },
    staleTime: Infinity,
  })
}
