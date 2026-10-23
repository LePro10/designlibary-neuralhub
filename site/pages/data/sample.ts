/** Deterministic sample data, so screenshots and demos stay stable. */
export function rng(seed = 7) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}
export const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export function yearDays(seed = 3) {
  const r = rng(seed);
  const end = new Date('2026-10-23T12:00:00');
  return Array.from({ length: 364 }, (_, i) => {
    const d = new Date(end); d.setDate(end.getDate() - 363 + i);
    const weekday = (d.getDay() + 6) % 7;
    const v = r() < (weekday > 4 ? 0.35 : 0.72) ? Math.round(r() * 90 + 10) : 0;
    return { date: d.toISOString().slice(0, 10), value: v, detail: `${v} min focused` };
  });
}

/** Places the data demos can sit in — charts take the place's signal colour. */
export const DATA_PLACES = ['screen', 'progress', 'plan', 'luna', 'files'] as const;
