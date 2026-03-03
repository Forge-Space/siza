import type { Phase, ItemStatus } from './types';

export function calculatePhaseProgress(phase: Phase): number {
  const done = phase.items.filter((i) => i.status === 'done').length;
  return phase.items.length > 0 ? Math.round((done / phase.items.length) * 100) : 0;
}

export function filterItemsByStatus(phase: Phase, status: ItemStatus | 'all') {
  if (status === 'all') return [...phase.items];
  return phase.items.filter((i) => i.status === status);
}

export function filterItemsByScope(items: Phase['items'], scope: 'all' | 'desktop') {
  if (scope === 'all') return items;
  return items.filter((item) => /desktop|electron|tauri/i.test(item.label));
}

export function countByStatus(phases: Phase[], status: ItemStatus | 'all'): number {
  const all = phases.flatMap((p) => p.items);
  if (status === 'all') return all.length;
  return all.filter((i) => i.status === status).length;
}
