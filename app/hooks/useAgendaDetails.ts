import { useQuery } from '@tanstack/react-query'
import { Agenda } from '../page'

export type BlockContent = {
  title: string
  content: string // tiptap JSON or markdown
}

const mockContentStore = new Map<string, BlockContent>()

export const useAgendaDetails = (blocks: Agenda[]) => {
  return useQuery({
    queryKey: ['agenda-details'],
    queryFn: async () => {
      // simulate fetch delay
      await new Promise(res => setTimeout(res, 100))
      const map = new Map<string, BlockContent>()
      for (const b of blocks) {
        const existing = mockContentStore.get(b.id)
        if (!existing) {
          const mock: BlockContent = {
            title: `${b.type.toUpperCase()} ${b.id.slice(0, 4)}`,
            content: ''
          }
          mockContentStore.set(b.id, mock)
        }
        map.set(b.id, mockContentStore.get(b.id)!)
      }
      return map
    },
    staleTime: Infinity
  })
}
