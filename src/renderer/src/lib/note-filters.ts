import type { Note } from '@shared/types/note';

export interface NoteFilters {
  query: string;
  tag: string | null;
  dueFrom: string; // 'YYYY-MM-DD' oppure '' se inattivo
  dueTo: string;
}

export const EMPTY_FILTERS: NoteFilters = { query: '', tag: null, dueFrom: '', dueTo: '' };

/** Filtro puro: nessuna dipendenza da React, quindi testabile in isolamento. */
export function filterNotes(notes: Note[], f: NoteFilters): Note[] {
  const q = f.query.trim().toLocaleLowerCase('it-IT');

  return notes.filter((n) => {
    if (q) {
      const haystack = `${n.title}\n${n.content}\n${n.tags.join(' ')}`.toLocaleLowerCase('it-IT');
      if (!haystack.includes(q)) return false;
    }
    if (f.tag && !n.tags.includes(f.tag)) return false;
    // Le date ISO 'YYYY-MM-DD' si confrontano correttamente come stringhe.
    if (f.dueFrom && (!n.dueDate || n.dueDate < f.dueFrom)) return false;
    if (f.dueTo && (!n.dueDate || n.dueDate > f.dueTo)) return false;
    return true;
  });
}

/** Le note fissate vanno in cima; dentro ogni gruppo resta l'ordine di ricevimento (già per data di modifica). */
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));
}

export function collectTags(notes: Note[]): string[] {
  return [...new Set(notes.flatMap((n) => n.tags))].sort((a, b) => a.localeCompare(b, 'it-IT'));
}
