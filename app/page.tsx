'use client'
import React, { useState, useCallback, useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
  getFirstCollision,
  UniqueIdentifier,
  closestCorners,
  CollisionDetection,
  Collision,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Item = {
  id: string
  type: 'item' | 'container'
  parentType: 'root' | 'container'
  items?: Item[]
}

const initialData: Item[] = [
  { id: 'item-1', type: 'item', parentType: 'root' },
  {
    id: 'container-1', type: 'container', parentType: 'root', items: [
      { id: 'item-2', type: 'item', parentType: 'container' },
      { id: 'item-3', type: 'item', parentType: 'container' }
    ]
  },
  {
    id: 'container-2', type: 'container', parentType: 'root', items: [
      { id: 'item-4', type: 'item', parentType: 'container' },
      { id: 'item-5', type: 'item', parentType: 'container' }
    ]
  },
  { id: 'item-6', type: 'item', parentType: 'root' }
]

export default function App() {
  const [items, setItems] = useState<Item[]>(initialData)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null)

  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    const pointerIntersections = pointerWithin(args)
    const intersections = pointerIntersections.length > 0 ? pointerIntersections : closestCorners(args)

    // Get the first valid collision
    const overId = getFirstCollision(intersections, 'id')
    lastOverId.current = overId || lastOverId.current

    return [{ id: lastOverId.current } as Collision]
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return


    const newItems = moveItem(items, active.id, over.id)

    setItems(newItems)
    setActiveId(null)
  }

  return (
    <main>
      <DndContext
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <SortableItems items={items} />
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div style={{
              padding: '10px',
              background: 'lightgray',
              border: '1px solid #151515',
              borderRadius: '5px',
            }}>
              Dragging {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  )
}

function SortableItems({ items }: { items: Item[] }) {
  return (
    <>
      {items.map((item) => (
        item.type === 'item'
          ? <SortableItem key={item.id} id={item.id} />
          : <SortableContainer key={item.id} id={item.id} items={item.items || []} />
      ))}
    </>
  )
}

function SortableItem({ id }: { id: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {id}
    </div>
  )
}

function SortableContainer({ id, items }: { id: string, items: Item[] }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
  })

  const [showFooter, setShowFooter] = useState(false)

  const handleMouseEnter = () => {
    setShowFooter(true);
  }

  const handleMouseLeave = () => {
    setShowFooter(false);
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '10px',
    border: '1px solid #888',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        {id} (Container)
      </div>
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <SortableItems items={items} />
      </SortableContext>
      {showFooter && (
        <footer>
          This is the footer of a container
        </footer>
      )}
    </div>
  )
}

function moveItem(items: Item[], activeId: UniqueIdentifier, overId: UniqueIdentifier): Item[] {
  console.log(`Moving item ${activeId} over ${overId}`)

  const activeResult = findItem(items, activeId)
  const overResult = findItem(items, overId)

  // Check if either result is undefined
  if (!activeResult || !overResult) {
    console.error('Active or Over item not found:', { activeResult, overResult })
    return items
  }

  const { activeItem, activePath } = activeResult
  const { activeItem: overItem, activePath: overPath } = overResult


  const newItems = structuredClone(items) // Deep copy to avoid mutation

  // Prevent containers from being moved inside other containers
  if (activeItem.type === 'container' && overItem.parentType === 'container') {
    console.error("Containers cannot be moved inside another container")
    return items
  }

  // Handle inserting into an empty container
  if (overItem.type === 'container' && (!overItem.items || overItem.items.length === 0)) {
    const containerLevel = newItems
    let targetContainer = containerLevel
    for (let i = 0; i < overPath.length - 1; i++) {
      targetContainer = targetContainer[overPath[i]].items || []
    }

    if (!targetContainer[overPath[overPath.length - 1]].items) {
      targetContainer[overPath[overPath.length - 1]].items = []
    }

    const target = targetContainer[overPath[overPath.length - 1]]

    if (target && !target.items) {
      target.items = []
    }

    if (target) {
      target.items?.push(activeItem)
      console.log(`Inserted ${activeItem.id} into empty container ${overItem.id}`)
    } else {
      console.error('Target container not found')
      return items
    }

    // Remove the item from its previous position
    return removeActiveItem(newItems, activePath)
  }

  // Remove the active item from its current position
  let currentLevel = newItems
  for (let i = 0; i < activePath.length - 1; i++) {
    currentLevel = currentLevel[activePath[i]].items || []
  }
  currentLevel.splice(activePath[activePath.length - 1], 1)

  // Navigate to the level where the over item is located
  currentLevel = newItems
  for (let i = 0; i < overPath.length - 1; i++) {
    currentLevel = currentLevel[overPath[i]].items || []
  }

  // Insert the active item into the new position
  const insertPosition = overPath[overPath.length - 1]
  currentLevel.splice(insertPosition, 0, activeItem)
  console.log(`Inserted ${activeItem.id} into position ${insertPosition} at ${overPath}`)

  return newItems
}

// Helper function to remove active item from the original position
function removeActiveItem(items: Item[], activePath: number[]) {
  let currentLevel = items
  for (let i = 0; i < activePath.length - 1; i++) {
    currentLevel = currentLevel[activePath[i]].items || []
  }
  currentLevel.splice(activePath[activePath.length - 1], 1)
  return items
}

function findItem(
  items: Item[],
  id: UniqueIdentifier
): { activeItem: Item; activePath: number[] } | undefined {
  let path: number[] | null = null
  let foundItem: Item | null = null

  function search(items: Item[], currentPath: number[]) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      if (item.id === id) {
        path = [...currentPath, i]
        foundItem = item
        return
      }

      if (item.type === 'container' && item.items) {
        search(item.items, [...currentPath, i])

        // If the item was found in the recursive search, exit the loop
        if (foundItem) return
      }
    }
  }

  search(items, [])

  // Return undefined if no item was found
  if (!foundItem || !path) {
    return undefined
  }

  return { activeItem: foundItem, activePath: path }
}
