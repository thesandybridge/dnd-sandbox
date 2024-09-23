'use client'
import React, { useState, useCallback, useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  pointerWithin,
  getFirstCollision,
  UniqueIdentifier,
  closestCorners,
  closestCenter,
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

  const customCollisionDetection: CollisionDetection = (args) => {
    const { droppableContainers } = args;

    // First, try closestCorners for items inside containers
    const closestCornersIntersections = closestCorners(args);
    const closestCornersCollision = getFirstCollision(closestCornersIntersections, 'id') as UniqueIdentifier | null;

    // Safely find the droppable container with the matching id
    const container = closestCornersCollision
      ? Object.values(droppableContainers).find(droppable => droppable?.id === closestCornersCollision)
      : null;

    // Check if the found container is a 'container' type
    const isOverContainer = container?.data?.current?.type === 'container';

    // If we're inside a container, use closestCorners logic
    if (isOverContainer) {
      return closestCornersIntersections;
    }

    // If we're not inside a container, fallback to closestCenter
    const closestCenterIntersections = closestCenter(args);
    return closestCenterIntersections;
  };

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

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (over) {
      lastOverId.current = over.id

      // Here, you could also highlight a container or provide other visual feedback
    }
  }

  return (
    <main>
      <DndContext
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
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

  // Deep copy to avoid mutation
  const newItems = structuredClone(items)

  // Handle reordering of containers at the same level
  const isSameLevel = JSON.stringify(activePath.slice(0, -1)) === JSON.stringify(overPath.slice(0, -1))

  // Prevent containers from being moved inside each other, but allow reordering within the same level
  if (activeItem.type === 'container' && overItem.type === 'container') {
    if (!isSameLevel) {
      console.error("Containers cannot be moved inside another container")
      return items
    }
  }

  let currentLevel = newItems
  let targetLevel = newItems

  // Handle reordering within the same container or level (items or containers)
  if (isSameLevel) {
    // Navigate to the level where both active and over items are located
    for (let i = 0; i < activePath.length - 1; i++) {
      currentLevel = currentLevel[activePath[i]].items!
    }

    // Remove the active item from the current level
    const activeIndex = activePath[activePath.length - 1]
    const [movedItem] = currentLevel.splice(activeIndex, 1)

    // Insert the item into the new position
    const overIndex = overPath[overPath.length - 1]

    // If the item is moved downward (from a lower index to a higher index),
    // we do NOT need to adjust the index. Splicing naturally handles it.
    currentLevel.splice(overIndex, 0, movedItem)

    console.log(`Moved ${activeItem.id} within the same container or level from index ${activeIndex} to ${overIndex}`)

  } else {
    // Handle moving between different containers

    // First, insert the item into the new container (over item)
    for (let i = 0; i < overPath.length - 1; i++) {
      targetLevel = targetLevel[overPath[i]].items!
    }

    // Insert into the target container or position
    const overIndex = overPath[overPath.length - 1]
    targetLevel.splice(overIndex, 0, activeItem)

    console.log(`Inserted ${activeItem.id} into position ${overIndex} in the new container`)

    // Now remove the item from its original position after insertion
    removeActiveItem(newItems, activePath)
  }

  return newItems
}

// Helper function to remove the active item from the original position
function removeActiveItem(items: Item[], activePath: number[]) {
  let currentLevel = items

  // Navigate to the active item's level
  for (let i = 0; i < activePath.length - 1; i++) {
    currentLevel = currentLevel[activePath[i]].items || []
  }

  // Remove the active item from its current level
  currentLevel.splice(activePath[activePath.length - 1], 1)
  return items
}

// Recursive search to find the item by id
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
