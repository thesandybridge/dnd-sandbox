'use client'

import Agenda from '@/app/components/Agenda'
import { useEffect } from 'react'
import { useAgenda } from '@/app/providers/AgendaProvider'
import { useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

export default function TestAgenda() {
  const { setAll } = useAgenda()
  const query = useSearchParams()
  const queryClient = useQueryClient()

  useEffect(() => {
    const numSections = parseInt(query.get('sections') ?? '10', 10)
    const numTopics = parseInt(query.get('topics') ?? '10', 10)

    const testBlocks = []
    const detailsMap = new Map()

    for (let i = 0; i < numSections; i++) {
      const sectionId = `section-${i}`
      testBlocks.push({
        id: sectionId,
        type: 'section' as const,
        parentId: null,
        testId: sectionId
      })
      detailsMap.set(sectionId, {
        type: 'section',
        title: `Section ${i}`,
        summary: ''
      })

      for (let j = 0; j < numTopics; j++) {
        const topicId = `topic-${i}-${j}`
        testBlocks.push({
          id: topicId,
          type: 'topic' as const,
          parentId: sectionId,
          testId: topicId
        })
        detailsMap.set(topicId, {
          type: 'topic',
          title: `Topic ${i}-${j}`,
          description: ''
        })
      }
    }

    setAll(testBlocks)
    queryClient.setQueryData(['agenda-details'], detailsMap)
  }, [setAll, query, queryClient])

  return <Agenda />
}
