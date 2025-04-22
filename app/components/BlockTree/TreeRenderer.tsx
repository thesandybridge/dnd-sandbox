'use client'

import { Fragment, memo } from 'react'
import SectionContainer from './SectionContainer'
import ItemWrapper from './ItemWrapper'
import DropZone from './DropZone'
import { useTreeContext } from '@/app/providers/TreeProvider'
interface Props {
  parentId?: string | null
}


const TreeRenderer = ({ parentId = null }: Props) => {
  const { blocksByParent } = useTreeContext()

  const items = blocksByParent.get(parentId) ?? []
  const indent = parentId
    ? 'ml-6 border-l border-gray-300 pl-4'
    : 'flex flex-col gap-2'

  return (
    <div className={indent}>
      {items.map((block, idx) => {
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
  )
}

export default memo(TreeRenderer)
