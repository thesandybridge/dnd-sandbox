import { useQuery } from '@tanstack/react-query'
import { Block } from '../providers/BlockProvider'

export type SectionContent = {
  type: 'section'
  title: string
  summary: string
}

export type TopicContent = {
  type: 'topic'
  title: string
  description: string
}

export type ObjectiveContent = {
  type: 'objective'
  title: string
  progress: number
}

export type BlockContent = SectionContent | TopicContent | ObjectiveContent

const mockContentStore = new Map<string, BlockContent>()

export const useAgendaDetails = (blocks: Block[]) => {
  return useQuery({
    queryKey: ['agenda-details'],
    queryFn: async () => {
      await new Promise(res => setTimeout(res, 100))

      const map = new Map<string, BlockContent>()

      for (const b of blocks) {
        let existing = mockContentStore.get(b.id)

        if (!existing) {
          if (b.type === 'section') {
            existing = {
              type: 'section',
              title: `SECTION ${b.id.slice(0, 4)}`,
              summary: ''
            }
          } else if (b.type === 'topic') {
            existing = {
              type: 'topic',
              title: `TOPIC ${b.id.slice(0, 4)}`,
              description: ''
            }
          } else if (b.type === 'objective') {
            existing = {
              type: 'objective',
              title: `OBJECTIVE ${b.id.slice(0, 4)}`,
              progress: 0
            }
          }

          mockContentStore.set(b.id, existing!)
        }

        map.set(b.id, existing!)
      }

      return map
    },
    staleTime: Infinity
  })
}
