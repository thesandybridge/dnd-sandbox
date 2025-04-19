# 🗂️ Agenda DnD Demo

This is a performant, testable drag-and-drop agenda editor built with [@dnd-kit/core](https://github.com/clauderic/dnd-kit), [Next.js App Router](https://nextjs.org/docs/app), and React. It supports:

- Nested, sortable blocks (`section`, `topic`, `objective`)
- Modifier key interactions (<kbd>Shift</kbd> to collapse/expand sections)
- Accessible drag handles with overlays
- User-defined block content via a generic `TreeProvider`
- Deep testing: unit, performance, and E2E

---

## 📦 Setup

```bash
pnpm install
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🧠 Architecture

This editor is built around two key providers:

### `BlockProvider`

Manages tree structure and mutation logic:

- Block creation, deletion, and movement
- Internal maps (`blockMap`, `childrenMap`, `indexMap`) for fast lookups
- Reducer-based state model

You can pass initial data via:

```tsx
<BlockProvider initialBlocks={myBlocks}>
  <Agenda />
</BlockProvider>
```

### `TreeProvider<T>`

Generic context for rendering block content:

- Accepts a `Map<string, T>` of block content
- Renders items via a user-supplied `ItemRenderer`
- Provides collapse state, DnD state, and keyboard modifiers

```tsx
<TreeProvider
  data={myContentMap}
  ItemRenderer={({ id, content }) => <MyCustomItem id={id} content={content} />}
/>
```

---

## 🧪 Testing

### Unit tests (Jest)

Includes reducer logic, structural correctness, and performance profiling.

```bash
pnpm test
```

- `tests/agendaReducer.test.ts` — core reducer behavior
- `tests/reparentBlocks.test.ts` — logic for drop target resolution
- `tests/agendaReducerPerformance.test.ts` — randomized move performance

### E2E tests (Playwright)

Simulates real drag-and-drop behavior across many elements.

```bash
pnpm test:e2e
pnpm test:e2e:headed
```

To customize the E2E test size:

```ts
await page.goto('/test?sections=5&topics=10')
```

Tests generate screenshots in `/screenshots`.

---

## 📁 File Structure

```
app/
  ├── components/
  │   ├── Agenda.tsx
  │   ├── TreeRenderer.tsx
  │   └── ...
  ├── providers/
  │   ├── BlockProvider.tsx
  │   └── TreeProvider.tsx
  ├── reducers/
  │   ├── blockReducer.ts
  │   └── expandReducer.ts
  ├── hooks/
  │   ├── useModifierKey.ts
  │   └── useAgendaDetails.ts
  └── test/
      └── page.tsx
```

---

## 🧼 Roadmap

- [ ] Add keyboard accessibility for DnD
- [ ] Virtualize block rendering (e.g., `react-virtual`)
- [ ] Real API layer + persistence
- [ ] Publish as a reusable component library

---
