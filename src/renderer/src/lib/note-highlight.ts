import type { Note } from '@shared/types/note';

/** Una nota con data di scadenza o con almeno un tag è evidenziata, in dashboard e sul desktop. */
export function isHighlighted(note: Note): boolean {
  return Boolean(note.dueDate) || note.tags.length > 0;
}

// Classe completa per Tailwind: ombra piena nera spostata, come nello stile Jotilla.
// Sostituisce l'ombra normale della nota, così non c'è nessun bordo colorato da confondere con la selezione.
export const HIGHLIGHT_CLASSES = 'shadow-[4px_4px_0_0_#292921]';
