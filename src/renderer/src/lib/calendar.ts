import type { Note } from '@shared/types/note'

const pad = (n: number) => String(n).padStart(2, '0')

/** Data locale in formato 'YYYY-MM-DD' (senza passare da UTC). */
export const toIsoDate = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1)

export const addMonths = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth() + n, 1)

/** Griglia di 6 settimane che inizia di lunedì, come da convenzione italiana. */
export function buildMonthGrid(monthStart: Date): Date[] {
  const offset = (monthStart.getDay() + 6) % 7 // 0 = lunedì, 6 = domenica
  return Array.from(
    { length: 42 },
    (_, i) => new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - offset + i),
  )
}

/** Raggruppa le note per data di scadenza. */
export function groupByDueDate(notes: Note[]): Map<string, Note[]> {
  const map = new Map<string, Note[]>()
  for (const note of notes) {
    if (!note.dueDate) continue
    map.set(note.dueDate, [...(map.get(note.dueDate) ?? []), note])
  }
  return map
}
