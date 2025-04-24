'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useBlocks } from '@/app/providers/BlockProvider'
import { cryptoHash, serializeBlock, SerializedDiff } from '@/app/utils/serializer'
import type { Block } from '@/app/types/block'
import { useQueryClient } from '@tanstack/react-query'
import { BlockContent } from '../types/agenda'
import { useAgenda } from '../hooks/useAgenda'

export default function SandboxControls() {
  const queryClient = useQueryClient()
  const { blocks, applyDiff } = useBlocks()
  const { create } = useAgenda()

  const [queuedDiff, setQueuedDiff] = useState<SerializedDiff>({
    added: [],
    removed: [],
    changed: [],
    hash: '',
  })

  const queueAdd = (type: Block['type']) => {
    const parentId = null
    const siblings = blocks.filter(b => b.parentId === parentId)
    const order = siblings.length

    const block: Block = {
      id: uuidv4(),
      parentId,
      order,
      type,
      itemId: uuidv4(),
    }

    // ⬇️ Add to diff queue
    setQueuedDiff(prev => ({
      ...prev,
      added: [...prev.added, serializeBlock(block)],
    }))

     switch (type) {
      case 'section':
        create({
          id: block.itemId,
          type,
          title: `SECTION ${block.itemId.slice(0, 4)}`,
          summary: '',
        }, block.id)
        break
      case 'topic':
        create({
          id: block.itemId,
          type,
          title: `TOPIC ${block.itemId.slice(0, 4)}`,
          description: '',
        }, block.id)
        break
      case 'objective':
        create({
          id: block.itemId,
          type,
          title: `OBJECTIVE ${block.itemId.slice(0, 4)}`,
          progress: 0,
        }, block.id)
        break
      case 'action-item':
        create({
          id: block.itemId,
          type,
          title: `ACTION ITEM ${block.itemId.slice(0, 4)}`,
        }, block.id)
        break
    }
  }

  const applyQueuedDiff = () => {
    const deserializedBlocks = queuedDiff.added.map(([id, parentId, order, type, itemId]) => ({
      id,
      parentId,
      order,
      type,
      itemId: itemId ?? id,
    }))

    // Insert the block content as if it came from realtime
    queryClient.setQueryData<Map<string, BlockContent>>(['agenda-details'], (old) => {
      const map = new Map(old ?? [])

      for (const b of deserializedBlocks) {
        if (map.has(b.itemId)) continue

        let content: BlockContent

        switch (b.type) {
          case 'section':
            content = {
              id: b.itemId,
              type: 'section',
              title: `SECTION ${b.itemId.slice(0, 4)}`,
              summary: '',
            }
            break
          case 'topic':
            content = {
              id: b.itemId,
              type: 'topic',
              title: `TOPIC ${b.itemId.slice(0, 4)}`,
              description: '',
            }
            break
          case 'objective':
            content = {
              id: b.itemId,
              type: 'objective',
              title: `OBJECTIVE ${b.itemId.slice(0, 4)}`,
              progress: 0,
            }
            break
          case 'action-item':
            content = {
              id: b.itemId,
              type: 'action-item',
              title: `ACTION ITEM ${b.itemId.slice(0, 4)}`,
            }
            break
        }

        map.set(b.id, content)
      }

      return map
    })

    // Now actually apply the diff
    const diffWithHash: SerializedDiff = {
      ...queuedDiff,
      hash: cryptoHash(JSON.stringify(queuedDiff)),
    }

    applyDiff(diffWithHash)
    setQueuedDiff({ added: [], removed: [], changed: [], hash: '' })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 p-1 items-center">
        <button onClick={() => queueAdd('section')} className="px-3 py-1 bg-purple-500 text-white rounded">
          + Stage Section
        </button>
        <button onClick={() => queueAdd('topic')} className="px-3 py-1 bg-purple-500 text-white rounded">
          + Stage Topic
        </button>
        <button onClick={() => queueAdd('objective')} className="px-3 py-1 bg-purple-500 text-white rounded">
          + Stage Objective
        </button>
        <button onClick={() => queueAdd('action-item')} className="px-3 py-1 bg-purple-500 text-white rounded">
          + Stage Action Item
        </button>
        <button onClick={applyQueuedDiff} disabled={!queuedDiff.added.length && !queuedDiff.removed.length && !queuedDiff.changed.length} className="px-3 py-1 bg-green-600 text-white rounded">
          Apply Diff
        </button>
      </div>

      <div className="text-sm text-gray-800">
        <p className="font-semibold">Queued Diff:</p>
        <ul className="list-disc list-inside">
          {queuedDiff.added.map(([id, , , type]) => (
            <li key={id}>➕ {type} ({id.slice(0, 6)})</li>
          ))}
          {queuedDiff.changed.map(([id, , , type]) => (
            <li key={id}>✏️ {type} ({id.slice(0, 6)})</li>
          ))}
          {queuedDiff.removed.map(([id, , , type]) => (
            <li key={id}>❌ {type} ({id.slice(0, 6)})</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
