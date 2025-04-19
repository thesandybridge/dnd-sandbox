# 🗂️ Agenda DnD Demo

This is a performant, testable drag-and-drop agenda editor built with [@dnd-kit/core](https://github.com/clauderic/dnd-kit), [Next.js App Router](https://nextjs.org/docs/app), and React. It supports:

- Nested, sortable blocks (`section`, `topic`, `objective`)
- Modifier key interactions (<kbd>Shift</kbd> to collapse/expand sections)
- Accessible drag handles with overlays
- Deep testing: unit, performance, and E2E

---

## 📦 Setup

```bash
pnpm install
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

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

## 🧠 Design Notes

- State lives in `AgendaProvider`
- Items are rendered in a flattened tree via `TreeRenderer`
- Shift modifier key toggles collapsed state of sections
- Drag overlays reflect real block content
- Performance is capped under 3ms per move at 10,000+ items

---

## 📁 File Structure

```
app/
  ├── components/
  │   ├── Agenda.tsx
  │   ├── TreeRenderer.tsx
  │   └── ...
  ├── providers/
  │   └── AgendaProvider.tsx
  ├── reducers/
  │   ├── agendaReducer.ts
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

---

PRs and forks welcome.
