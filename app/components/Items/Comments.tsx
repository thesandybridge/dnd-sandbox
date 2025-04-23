'use client'

import {
  ActionItemContent,
  ObjectiveContent,
  SectionContent,
  TopicContent,
} from '@/app/hooks/useAgendaDetails'
import { useConvertItem } from '@/app/hooks/useConvertItem'
import { memo, useCallback } from 'react'

const commentData = {
  text: 'This is a test comment',
}

const Comments = ({ id }: { id: number}) => {
  const { convert } = useConvertItem()
  const title = `${commentData.text} - ${String(id)}`

  const convertToTopic = useCallback(() => {
    convert<Omit<TopicContent, 'id'>>({
      type: 'topic',
      title,
      description: '',
    })
  }, [convert, title])

  const convertToSection = useCallback(() => {
    convert<Omit<SectionContent, 'id'>>({
      type: 'section',
      title,
      summary: '',
    })
  }, [convert, title])

  const convertToActionItem = useCallback(() => {
    convert<Omit<ActionItemContent, 'id'>>({
      type: 'action-item',
      title,
    })
  }, [convert, title])

  const convertToObjective = useCallback(() => {
    convert<Omit<ObjectiveContent, 'id'>>({
      type: 'objective',
      title,
      progress: 80,
    })
  }, [convert, title])

  return (
    <div className="flex gap-2">
      {title}
      <div className="flex gap-1">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={convertToTopic}
        >
          + topic
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={convertToActionItem}
        >
          + action-item
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={convertToObjective}
        >
          + objective
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={convertToSection}
        >
          + section
        </button>
      </div>
    </div>
  )
}

export default memo(Comments)
