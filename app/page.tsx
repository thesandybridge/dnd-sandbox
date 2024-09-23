'use client'
import { useState, useRef, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  getFirstCollision,
  UniqueIdentifier,
  closestCorners,
  closestCenter,
  pointerWithin,
  CollisionDetection,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
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
  const lastOverId = useRef<UniqueIdentifier | null>(null); // Cache the last known overId

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      const { active, droppableContainers } = args;

      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: droppableContainers.filter(
            (container) => container.id in items
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections // If there are droppables intersecting with the pointer, return those
          : closestCorners(args); // Fallback to closestCorners for general collision detection

      let overId = getFirstCollision(intersections, 'id');

      // If the overId is a valid container and contains items
      if (overId && overId in items) {
        const containerItems = items[overId].items || [];

        if (containerItems.length > 0) {
          // If a container has items, return the closest item within that container
          overId = closestCenter({
            ...args,
            droppableContainers: droppableContainers.filter(
              (container) =>
                container.id !== overId && containerItems.includes(container.id)
            ),
          })[0]?.id;
        }
      }

      // If no droppable is matched, return the last match
      lastOverId.current = overId ?? lastOverId.current;

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return


    const newItems = moveItem(items, active.id, over.id)

    setItems(newItems)
    setActiveId(null)
    lastOverId.current = null; // Reset the lastOverId

  }

  return (
    <main>
      <DndContext
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
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
  console.log(`Moving item ${activeId} over ${overId}`);

  const activeResult = findItem(items, activeId);
  const overResult = findItem(items, overId);

  // Check if either result is undefined
  if (!activeResult || !overResult) {
    console.error('Active or Over item not found:', { activeResult, overResult });
    return items;
  }

  const { activeItem, activePath } = activeResult;
  const { activeItem: overItem, activePath: overPath } = overResult;

  // Deep copy to avoid mutation
  const newItems = structuredClone(items);

  // Prevent moving containers inside other containers
  if (activeItem.type === 'container' && overItem.parentType === 'container') {
    console.log("Containers cannot be moved inside other containers");
    return items;
  }

  if (overItem.type === 'container' && (!overItem.items || overItem.items.length === 0)) {
    // Find the empty container in the newItems array
    let targetLevel = newItems;
    for (let i = 0; i < overPath.length - 1; i++) {
      targetLevel = targetLevel[overPath[i]].items!;
    }

    const emptyContainer = targetLevel[overPath[overPath.length - 1]];

    if (!emptyContainer.items) {
      emptyContainer.items = [];
    }

    // Insert the active item into the empty container
    emptyContainer.items.push(activeItem);

    // Remove the active item from its original position
    removeActiveItem(newItems, activePath);

    console.log(`Moved ${activeItem.id} into empty container ${overItem.id}`);
    return newItems;
  }

  // Check if the item is being moved between different containers or levels
  const isSameLevel = isSameContainer(activePath, overPath);
  const isMovingUpward = activePath[0] > overPath[0];

  if (isSameLevel) {
    // Reordering within the same container or level
    let currentLevel = newItems;
    for (let i = 0; i < activePath.length - 1; i++) {
      currentLevel = currentLevel[activePath[i]].items!;
    }

    // Remove the active item from the current level
    const activeIndex = activePath[activePath.length - 1];
    const [movedItem] = currentLevel.splice(activeIndex, 1);

    // Insert the item into the new position
    const overIndex = overPath[overPath.length - 1];
    currentLevel.splice(overIndex, 0, movedItem);

    console.log(`Moved ${activeItem.id} within the same container or level from index ${activeIndex} to ${overIndex}`);
  } else {
    // Handle moving between different containers or from container to top level
    if (overPath.length === 1) {
      // Moving to the top level
      if (isMovingUpward && activePath[0] > overPath[0]) {
        // Moving upward out of a container to a position before the container
        insertItem(newItems, activeItem, overPath, overItem);
        removeActiveItem(newItems, activePath);
      } else {
        // Moving downward or to a position after the container
        removeActiveItem(newItems, activePath);
        insertItem(newItems, activeItem, overPath, overItem);
      }
    } else {
      // Moving between containers (not top level)
      if (isMovingUpward) {
        // Remove first if moving upward to prevent shift issues
        removeActiveItem(newItems, activePath);
        insertItem(newItems, activeItem, overPath, overItem);
      } else {
        // Moving downward, insert first then remove
        insertItem(newItems, activeItem, overPath, overItem);
        removeActiveItem(newItems, activePath);
      }
    }
  }

  return newItems;
}

// Helper function to check if two paths are in the same container
function isSameContainer(activePath: number[], overPath: number[]): boolean {
  return JSON.stringify(activePath.slice(0, -1)) === JSON.stringify(overPath.slice(0, -1));
}

// Helper function to remove the active item from the original container
function removeActiveItem(items: Item[], activePath: number[]) {
  let currentLevel = items;

  // Navigate to the active item's container level
  for (let i = 0; i < activePath.length - 1; i++) {
    currentLevel = currentLevel[activePath[i]].items || [];
  }

  // Remove the active item from its current container level
  currentLevel.splice(activePath[activePath.length - 1], 1);
  console.log(`Removed item from original container`);
  return items;
}

// Helper function to insert the active item into the new position
function insertItem(newItems: Item[], activeItem: Item, overPath: number[], overItem: Item) {
  let targetLevel = newItems;

  // Insert the item into the new container (or top level)
  for (let i = 0; i < overPath.length - 1; i++) {
    targetLevel = targetLevel[overPath[i]].items!;
  }

  const overIndex = overPath[overPath.length - 1];
  targetLevel.splice(overIndex, 0, activeItem);
  console.log(`Inserted ${activeItem.id} into position ${overIndex} in the new container`);
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
