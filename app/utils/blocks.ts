import type { UniqueIdentifier } from '@dnd-kit/core'
import { Agenda } from '../page';

export function reparentBlock(blocks: Agenda[], activeId: UniqueIdentifier, hoverZone: string) {
  const dragged = blocks.find(b => b.id === activeId);
  if (!dragged) return blocks;
  const remaining = blocks.filter(b => b.id !== activeId);

  let zone = hoverZone;

  // ── DISALLOW ANY NESTING WHEN DRAGGING A SECTION ──
  if (dragged.type === 'section') {
    // transform 'into-' into 'before-'
    if (zone.startsWith('into-')) {
      zone = 'before-' + zone.slice('into-'.length);
    }
    // for before-/after- on nested items, point at the parent instead
    if (zone.startsWith('before-') || zone.startsWith('after-')) {
      const [, targetId] = zone.split('-', 2);
      const target = blocks.find(b => b.id === targetId);
      if (target && target.parentId !== null) {
        const prefix = zone.split('-')[0];
        zone = `${prefix}-${target.parentId}`;
      }
    }
  }

  // ── rest of your existing logic unchanged ──

  let newParentId: string | null = null;
  let insertIndex: number = remaining.length;

  if (zone.startsWith('into-')) {
    newParentId = zone.replace('into-', '');
    const siblings = remaining.filter(b => b.parentId === newParentId);
    if (siblings.length > 0) {
      const last = siblings[siblings.length - 1];
      const idx = remaining.findIndex(b => b.id === last.id);
      insertIndex = idx + 1;
    } else {
      const parentIdx = remaining.findIndex(b => b.id === newParentId);
      insertIndex = parentIdx + 1;
    }
  } else {
    const isAfter = zone.startsWith('after-');
    const targetId = zone.replace(/^(before|after)-/, '');
    const target = blocks.find(b => b.id === targetId);
    newParentId = target?.parentId ?? null;
    let idx = remaining.findIndex(b => b.id === targetId);
    if (idx === -1) idx = remaining.length;
    insertIndex = isAfter ? idx + 1 : idx;
  }

  const moved = { ...dragged, parentId: newParentId };
  return [
    ...remaining.slice(0, insertIndex),
    moved,
    ...remaining.slice(insertIndex),
  ];
}
