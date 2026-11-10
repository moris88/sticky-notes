import type { Note } from '@shared/types/note';

/**
 * Titolo da mostrare: quello scritto dall'utente, altrimenti la prima riga di testo
 * (utile per le note create prima dell'introduzione del campo titolo).
 */
export function displayTitle(note: Pick<Note, 'title' | 'content'>): string {
  const explicit = note.title.trim();
  if (explicit) return explicit;

  const firstLine = note.content
    .split('\n')
    .find((line) => line.trim())
    ?.replace(/^#+\s*/, '')
    .trim();
  return firstLine || 'Nota senza titolo';
}
