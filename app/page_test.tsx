'use client'
import React, { useState, useCallback } from 'react'
import {
    DndContext,
    closestCenter,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    pointerWithin,
    getFirstCollision,
    rectIntersection
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
    items?: Item[]
}

const initialData: Item[] = [
    { id: 'item-1', type: 'item' },
    {
        id: 'container-1', type: 'container', items: [
            { id: 'item-2', type: 'item' },
            { id: 'item-3', type: 'item' }
        ]
    },
    {
        id: 'container-2', type: 'container', items: [
            { id: 'item-4', type: 'item' },
            { id: 'item-5', type: 'item' }
        ]
    },
    { id: 'item-6', type: 'item' }
]

export default function App() {
    const [items, setItems] = useState<Item[]>(initialData)
    const [activeId, setActiveId] = useState<string | null>(null)

    const handleDragStart = (event: DragStartEvent) => {
        console.log('Drag started:', event.active.id)
        setActiveId(event.active.id)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over) return

        console.log('Drag ended:', { active: active.id, over: over.id })
        console.log('Before move:', JSON.stringify(items, null, 2))

        const newItems = moveItem(items, active.id, over.id, over.data)

        console.log('After move:', JSON.stringify(newItems, null, 2))
        setItems(newItems)
        setActiveId(null)
    }

    // Detect if the item should go inside, above, or below the container
    const collisionDetectionStrategy = useCallback((args) => {
        const { pointerCoordinates, droppableContainers, active } = args
        const pointerIntersections = pointerWithin(args)
        const intersections = pointerIntersections.length > 0
            ? pointerIntersections
            : rectIntersection(args)

        const collision = getFirstCollision(intersections, 'id')
        if (!collision) return []

        const overId = collision.id
        const over = droppableContainers.find(container => container.id === overId)
        const activeId = active.id

        if (!over || !over.rect || !active.rect.current.translated) return []

        const pointerY = pointerCoordinates.y
        const overTop = over.rect.top
        const overBottom = over.rect.bottom

        // Ensure that containers cannot be placed inside other containers
        if (activeId.startsWith('container') && overId.startsWith('container')) {
            const midpoint = (overTop + overBottom) / 2
            if (pointerY < midpoint) {
                console.log('Container placed above another container')
                return [{ id: overId, position: 'above' }]
            } else {
                console.log('Container placed below another container')
                return [{ id: overId, position: 'below' }]
            }
        }

        // Detect if we are above, below, or inside a container
        if (pointerY > overTop && pointerY < overBottom) {
            console.log('Item dropped inside the container')
            return [{ id: overId, position: 'inside' }]
        } else if (pointerY < overTop) {
            console.log('Item dropped above')
            return [{ id: overId, position: 'above' }]
        } else if (pointerY > overBottom) {
            console.log('Item dropped below')
            return [{ id: overId, position: 'below' }]
        }

        return []
    }, [])

    return (
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
                    <div style={{ padding: '10px', background: 'lightgray', border: '1px solid black' }}>
                        Dragging {activeId}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
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
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: '10px',
        border: '1px solid #ccc',
        marginBottom: '5px',
        backgroundColor: '#fff',
        cursor: 'grab'
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {id}
        </div>
    )
}

function SortableContainer({ id, items }: { id: string, items: Item[] }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: '10px',
        border: '1px solid #888',
        marginBottom: '10px',
        backgroundColor: '#f9f9f9'
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {id} (Container)
            </div>
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                {items.length > 0 ? <SortableItems items={items} /> : <EmptyContainer />}
            </SortableContext>
        </div>
    )
}

function EmptyContainer() {
    return (
        <div style={{ padding: '10px', backgroundColor: '#f9f9f9', border: '1px dashed #ccc' }}>
            Empty Container
        </div>
    )
}

// Function to move items based on collision data (inside/above/below)
function moveItem(items: Item[], activeId: string, overId: string, overData: any): Item[] {
    const { activeItem, activePath } = findItem(items, activeId)
    const { overItem, overPath } = findItem(items, overId)

    if (!activeItem || !activePath || !overItem || !overPath) {
        console.error('Active or Over item not found:', { activeItem, overItem })
        return items
    }

    const newItems = [...items]

    // Remove active item from its original position
    let currentLevel = newItems
    for (let i = 0; i < activePath.length - 1; i++) {
        currentLevel = currentLevel[activePath[i]].items || []
    }
    currentLevel.splice(activePath[activePath.length - 1], 1)

    // Insert active item into the new position based on overData
    currentLevel = newItems
    for (let i = 0; i < overPath.length - 1; i++) {
        currentLevel = currentLevel[overPath[i]].items || []
    }

    if (overData?.position === 'inside') {
        overItem.items = overItem.items || []
        overItem.items.push(activeItem)
    } else if (overData?.position === 'above') {
        currentLevel.splice(overPath[overPath.length - 1], 0, activeItem)
    } else if (overData?.position === 'below') {
        currentLevel.splice(overPath[overPath.length - 1] + 1, 0, activeItem)
    }

    return newItems
}

// Utility to find an item and its path in the hierarchy
function findItem(items: Item[], id: string) {
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
            }
        }
    }

    search(items, [])
    return { activeItem: foundItem, activePath: path, overItem: foundItem, overPath: path }
}
