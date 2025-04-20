# Block Protocol Specification

> A unified contract for structuring, rendering, and synchronizing agenda-based block systems.

---

## Purpose

This document defines the universal protocol used for managing **blocks** within an agenda system. It formalizes how **structure** (layout) and **content** (data) are separated, fetched, reordered, and rendered in a scalable, modular architecture.

---

## 1. Block Structure

```ts
interface Block {
  id: string
  parentId: string | null
  order: number
  type: string
}
```

- `id`: Unique identifier for the block.
- `parentId`: Points to the parent block; `null` if root.
- `order`: Numeric value representing position among siblings.
- `type`: Determines the kind of block (e.g., `section`, `topic`, `objective`).

> Blocks define structure only. All business-specific data is handled separately.

---

## 2. Separation of Concerns

- **Blocks**: Responsible for layout and hierarchy.
- **Content**: Responsible for the specific data (titles, progress, etc.) based on block type.
- Each block `type` maps to a content source, fetched independently via batch APIs.

---

## 3. Content Schemas

Each `type` maps to its own schema:

### Topic
```ts
interface Topic {
  id: string
  title: string
}
```

### Objective
```ts
interface Objective {
  id: string
  title: string
  progress: number
}
```

### Section
```ts
interface Section {
  id: string
  title: string
  color: string
  ownerId: string
}
```

---

## 4. Reordering Protocol

Reordering is independent of content and affects only `blocks`.

### Reorder Payload

```ts
type ReorderPayload = {
  id: string
  parentId: string | null
  order: number
}[]
```

### Example Request

```http
POST /api/agenda/:id/reorder
```

```json
[
  { "id": "3", "parentId": "2", "order": 0 },
  { "id": "4", "parentId": "2", "order": 1 }
]
```

---

## 5. API Endpoints

### Structure

- `GET /api/agenda/:id/blocks` — fetches layout blueprint

### Content Batches

- `POST /api/sections/batch`
- `POST /api/topics/batch`
- `POST /api/objectives/batch`

Each takes an `ids` array and returns keyed objects by block ID.

Example:
```json
{
  "3": {
    "id": "3",
    "title": "Refactor onboarding",
    "progress": 20
  }
}
```

---

## 6. Realtime Events

### Reorder

```json
{
  "type": "reorder",
  "blocks": [
    { "id": "3", "parentId": "2", "order": 0 }
  ]
}
```

### Content Update

```json
{
  "type": "update",
  "blockType": "objective",
  "data": {
    "id": "3",
    "title": "Updated title",
    "progress": 70
  }
}
```

---

## 7. Rendering Flow

1. Fetch all `blocks` to get the agenda layout.
2. Extract IDs by type.
3. Fetch content for each type in parallel.
4. Build maps by block ID.
5. Render each block by looking up its content.

This approach decouples rendering from logic and enables future block types to be added without structural changes.

---