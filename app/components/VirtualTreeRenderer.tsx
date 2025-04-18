'use client'

import { memo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import DropZone from './DropZone'
import SectionContainer from './SectionContainer'
import ItemWrapper from './ItemWrapper'
import type { Agenda } from '../page'
import type { BlockContent } from '../hooks/useAgendaDetails'
import type { ExpandAction } from './TreeRenderer'

interface FlattenedBlock extends Agenda {
  depth: number
}

interface Props {
  blocks: Agenda[]
  expandedMap: Record<string, boolean>
  dispatchExpand: React.Dispatch<ExpandAction>
  onHover: (zoneId: string, parentId: string | null) => void
  data?: Map<string, BlockContent>
}

function flattenVisible(blocks: Agenda[], map: Record<string, boolean>): FlattenedBlock[] {
  const result: FlattenedBlock[] = []
  const walk = (parentId: string | null, depth = 0) => {
    blocks
      .filter(b => b.parentId === parentId)
      .forEach(block => {
        result.push({ ...block, depth })
        if (map[block.id]) walk(block.id, depth + 1)
      })
  }
  walk(null)
  return result
}

const VirtualTreeRenderer = ({
  blocks,
  expandedMap,
  dispatchExpand,
  onHover,
  data
}: Props) => {
  const parentRef = useRef(null)
  const flattened = flattenVisible(blocks, expandedMap)

  const virtualizer = useVirtualizer({
    count: flattened.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52
  })

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(({ index, key, start }) => {
          const block = flattened[index]

          return (
            <div
              key={key}
              ref={virtualizer.measureElement}
              className='flex flex-col gap-2'
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${start}px)`,
                paddingLeft: `${block.depth * 1.25}rem`
              }}
            >
              <DropZone
                id={`before-${block.id}`}
                onHover={onHover}
                parentId={block.parentId}
              />
              {block.type === 'section' ? (
                <SectionContainer
                  block={block}
                  blocks={[]} // not needed anymore
                  expandedMap={expandedMap}
                  dispatchExpand={dispatchExpand}
                  onHover={onHover}
                  data={data}
                />
              ) : (
                <ItemWrapper id={block.id} data={data} />
              )}
              <DropZone
                id={`after-${block.id}`}
                onHover={onHover}
                parentId={block.parentId}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(VirtualTreeRenderer)
