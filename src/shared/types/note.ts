export const NOTE_COLORS = ['sand', 'mint', 'sky', 'rose', 'lavender'] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

export interface Note {
  id: string; // UUID, usato anche come nome del file
  title: string; // titolo scritto dall'utente; può essere vuoto
  content: string; // corpo in Markdown
  color: NoteColor;
  tags: string[];
  dueDate: string | null; // 'YYYY-MM-DD' (data locale, senza fuso orario)
  pinned: boolean; // fissata in alto nella lista (non è un campo dell'editor)
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601, impostato dal main process
}

/** Campi che l'editor può modificare. */
export type NoteDraft = Pick<Note, 'title' | 'content' | 'color' | 'tags' | 'dueDate'>;
