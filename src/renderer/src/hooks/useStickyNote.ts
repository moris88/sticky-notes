import { useCallback, useEffect, useState } from 'react';
import type { Note } from '@shared/types/note';

/** Stato di un singolo post-it: la nota, se è ridotta al solo titolo e come salvarla. */
export function useStickyNote(noteId: string) {
  const [note, setNote] = useState<Note | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const all = await window.desktop.notes.list();
    setNote(all.find((n) => n.id === noteId) ?? null);
    setLoaded(true);
  }, [noteId]);

  useEffect(() => {
    void load();
    void window.desktop.sticky.isCollapsed().then(setCollapsed);
    // Se la nota cambia altrove (finestra principale o altro post-it), si ricarica.
    return window.desktop.onNotesChanged(() => void load());
  }, [load]);

  const save = useCallback(async (updated: Note): Promise<Note> => {
    const saved = await window.desktop.notes.save(updated);
    setNote(saved);
    return saved;
  }, []);

  const toggleCollapse = useCallback(async () => {
    setCollapsed(await window.desktop.sticky.toggleCollapse());
  }, []);

  return { note, loaded, collapsed, save, toggleCollapse };
}
