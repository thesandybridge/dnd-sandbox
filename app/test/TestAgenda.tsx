'use client'

import { BlockProvider } from "../providers/BlockProvider"
import { useSearchParams } from 'next/navigation'
import { useMemo } from "react"
import { Block } from "../types/block"

export default function TestAgendaLayout({ children }: { children: React.ReactNode }) {
  const query = useSearchParams()

  const initialBlocks: Block[] = useMemo(() => {
    const sections = parseInt(query.get('sections') ?? '5', 10)
    const topics = parseInt(query.get('topics') ?? '5', 10)

    const blocks: Block[] = []

    for (let i = 0; i < sections; i++) {
      const sectionId = `section-${i}`
      blocks.push({
        id: sectionId,
        type: 'section',
        parentId: null,
        testId: sectionId,
      })

      for (let j = 0; j < topics; j++) {
        const topicId = `topic-${i}-${j}`
        blocks.push({
          id: topicId,
          type: 'topic',
          parentId: sectionId,
          testId: topicId,
        })
      }
    }

    return blocks
  }, [query])

  return (
    <BlockProvider initialBlocks={initialBlocks}>
      {children}
    </BlockProvider>
  )
}
