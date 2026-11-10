import { useCallback, useMemo, useState } from 'react';
import type { Note } from '@shared/types/note';
import {
  collectTags,
  EMPTY_FILTERS,
  filterNotes,
  sortNotes,
  type NoteFilters,
} from '../lib/note-filters';

/** Stato dei filtri e risultato filtrato e ordinato, calcolati senza effetti collaterali. */
export function useNoteFilters(notes: Note[]) {
  const [filters, setFilters] = useState<NoteFilters>(EMPTY_FILTERS);

  const filtered = useMemo(() => sortNotes(filterNotes(notes, filters)), [notes, filters]);
  const tags = useMemo(() => collectTags(notes), [notes]);
  const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  return { filters, setFilters, filtered, tags, reset };
}
