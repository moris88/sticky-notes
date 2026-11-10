import { useCallback, useEffect, useState } from 'react';
import type { Note } from '@shared/types/note';

/** Gestisce l'elenco delle note e le operazioni CRUD. Si ricarica quando cambia la cartella. */
export function useNotes(storageDir: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setNotes(await window.desktop.notes.list());
      setError(null);
    } catch {
      setError('Impossibile leggere la cartella delle note.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Parte solo quando le impostazioni (e quindi la cartella) sono disponibili.
  useEffect(() => {
    if (storageDir) void refresh();
  }, [storageDir, refresh]);

  // Le modifiche fatte nei post-it arrivano qui: si ricarica l'elenco.
  useEffect(() => window.desktop.onNotesChanged(() => void refresh()), [refresh]);

  const saveNote = useCallback(async (note: Note): Promise<Note> => {
    const saved = await window.desktop.notes.save(note);
    setNotes((prev) =>
      prev.some((n) => n.id === saved.id)
        ? prev.map((n) => (n.id === saved.id ? saved : n))
        : [saved, ...prev],
    );
    return saved;
  }, []);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    await window.desktop.notes.remove(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, loading, error, refresh, saveNote, deleteNote };
}
