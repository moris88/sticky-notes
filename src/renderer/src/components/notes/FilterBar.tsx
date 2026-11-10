import type { NoteFilters } from '../../lib/note-filters'

interface FilterBarProps {
  filters: NoteFilters
  onChange: (next: NoteFilters) => void
  tags: string[]
}

const INPUT =
  'rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800'

export function FilterBar({ filters, onChange, tags }: FilterBarProps) {
  const set = (patch: Partial<NoteFilters>) => onChange({ ...filters, ...patch })

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <input
        type="search"
        placeholder="Cerca nel testo o nei tag…"
        value={filters.query}
        onChange={(e) => set({ query: e.target.value })}
        className={`${INPUT} min-w-60 flex-1`}
      />
      <select
        aria-label="Filtra per tag"
        value={filters.tag ?? ''}
        onChange={(e) => set({ tag: e.target.value || null })}
        className={INPUT}
      >
        <option value="">Tutti i tag</option>
        {tags.map((t) => (
          <option key={t} value={t}>
            #{t}
          </option>
        ))}
      </select>
      <input
        type="date"
        aria-label="Scadenza da"
        value={filters.dueFrom}
        onChange={(e) => set({ dueFrom: e.target.value })}
        className={INPUT}
      />
      <input
        type="date"
        aria-label="Scadenza a"
        value={filters.dueTo}
        onChange={(e) => set({ dueTo: e.target.value })}
        className={INPUT}
      />
    </div>
  )
}
