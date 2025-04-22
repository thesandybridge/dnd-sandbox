'use client'

import { Fragment, memo, useRef } from 'react'
import SectionContainer from './SectionContainer'
import ItemWrapper from './ItemWrapper'
import DropZone from './DropZone'
import { useTreeContext } from '@/app/providers/TreeProvider'
import { useVirtualizer } from '@tanstack/react-virtual'

interface Props {
  parentId?: string | null
}


const VirtualTreeRenderer = ({ parentId = null }: Props) => {
  const {
    blocksByParent,
    expandedMap,
  } = useTreeContext()

  const items = blocksByParent.get(parentId) ?? []
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 10,
  })

  const indent = parentId
    ? 'ml-6 border-l border-gray-300 pl-4'
    : 'flex flex-col gap-2'

  return (
    <div ref={parentRef}>
      <div
        className={indent}
        style={{
          paddingTop: rowVirtualizer.getVirtualItems()[0]?.start ?? 0,
          paddingBottom:
          rowVirtualizer.getTotalSize() -
            (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0),
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const idx = virtualRow.index
          const block = items[idx]

          const parentIsCollapsed = block.parentId &&
            items.find(b => b.id === block.parentId)?.type === 'section' &&
            !expandedMap[block.parentId]

          if (parentIsCollapsed) return null

          return (
            <Fragment key={block.id}>
              {idx === 0 && (
                <DropZone
                  id={`before-${block.id}`}
                  parentId={block.parentId}
                />
              )}
              {block.type === 'section' ? (
                <SectionContainer block={block} />
              ) : (
                  <ItemWrapper id={block.id} />
                )}
              <DropZone
                id={`after-${block.id}`}
                parentId={block.parentId}
              />
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default memo(VirtualTreeRenderer)
