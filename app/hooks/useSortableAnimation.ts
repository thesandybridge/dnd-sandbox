import { useEffect, useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'

export function useSortableAnimation(ref: React.RefObject<HTMLElement>, id: string) {
  const prevRect = useRef<DOMRect | null>(null)
  const { isDragging } = useDraggable({ id })

  useEffect(() => {
    const node = ref.current
    if (!node || isDragging) {
      prevRect.current = node?.getBoundingClientRect() ?? null
      return
    }

    const newRect = node.getBoundingClientRect()

    if (prevRect.current) {
      const dx = prevRect.current.left - newRect.left
      const dy = prevRect.current.top - newRect.top

      if (dx !== 0 || dy !== 0) {
        node.style.transition = 'none'
        node.style.transform = `translate(${dx}px, ${dy}px)`

        // force reflow
        node.getBoundingClientRect()

        node.style.transition = 'transform 150ms ease'
        node.style.transform = ''
      }
    }

    prevRect.current = newRect
  })
}
