import { useState } from 'react';
import type { Note, NoteDraft } from '@shared/types/note';
import { useNotes } from './hooks/useNotes';
import { useSettings } from './hooks/useSettings';
import { useNoteFilters } from './hooks/useNoteFilters';
import { NoteCard } from './components/notes/NoteCard';
import { NoteEditor } from './components/notes/NoteEditor';
import { NotePreview } from './components/notes/NotePreview';
import { FilterBar } from './components/notes/FilterBar';
import { CalendarView } from './components/calendar/CalendarView';
import { SettingsView } from './components/settings/SettingsView';

type View = 'list' | 'calendar' | 'settings';
const VIEWS: { id: View; label: string }[] = [
  { id: 'list', label: 'Lista' },
  { id: 'calendar', label: 'Calendario' },
  { id: 'settings', label: 'Impostazioni' },
];

export default function App() {
  const { settings, update, pickDirectory } = useSettings();
  const { notes, loading, error, saveNote, deleteNote } = useNotes(settings?.storageDir);
  const { filters, setFilters, filtered, tags } = useNoteFilters(notes);

  const [view, setView] = useState<View>('list');
  // null = nessun editor aperto; 'new' = nuova nota; Note = modifica di una nota esistente.
  const [editing, setEditing] = useState<Note | 'new' | null>(null);
  const current = editing === 'new' ? null : editing;
  // Anteprima aperta cliccando una card: si salva l'id, così resta aggiornata alle modifiche della lista.
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewed = notes.find((n) => n.id === previewId) ?? null;
  // Errori di salvataggio/eliminazione: mostrati a schermo e registrati in console.
  const [actionError, setActionError] = useState<string | null>(null);

  const describe = (err: unknown): string => (err instanceof Error ? err.message : String(err));

  const handleSave = async (draft: NoteDraft) => {
    try {
      const now = new Date().toISOString();
      const base: Note = current ?? {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        title: '',
        content: '',
        color: 'sand',
        tags: [],
        dueDate: null,
        pinned: false,
      };
      await saveNote({ ...base, ...draft });
      setActionError(null);
      setEditing(null);
    } catch (err) {
      console.error('[Salvataggio nota] fallito:', err);
      setActionError(`Salvataggio non riuscito: ${describe(err)}`);
    }
  };

  // Usata sia dall'editor sia dal cestino in card: chiede conferma e chiude l'editor se era aperto sulla stessa nota.
  const removeNote = async (note: Note) => {
    if (!window.confirm("Eliminare questa nota? L'operazione non è reversibile.")) return;
    try {
      await deleteNote(note.id);
      setActionError(null);
      if (current?.id === note.id) setEditing(null);
      if (previewId === note.id) setPreviewId(null);
    } catch (err) {
      console.error('[Eliminazione nota] fallita:', err);
      setActionError(`Eliminazione non riuscita: ${describe(err)}`);
    }
  };

  const togglePin = async (note: Note) => {
    try {
      await saveNote({ ...note, pinned: !note.pinned });
      setActionError(null);
    } catch (err) {
      console.error('[Fissaggio nota] fallito:', err);
      setActionError(`Operazione non riuscita: ${describe(err)}`);
    }
  };

  // Due liste separate: prima le note fissate, poi tutte le altre.
  const pinnedNotes = filtered.filter((n) => n.pinned);
  const otherNotes = filtered.filter((n) => !n.pinned);

  const renderCards = (list: Note[]) => (
    // Colonne a larghezza fissa (15rem): tutte le card hanno la stessa dimensione.
    <div className="grid grid-cols-[repeat(auto-fill,15rem)] gap-4">
      {list.map((n) => (
        <NoteCard
          key={n.id}
          note={n}
          onPreview={(note) => setPreviewId(note.id)}
          onEdit={setEditing}
          onDesktop={(note) => void window.desktop.sticky.open(note.id)}
          onTogglePin={(note) => void togglePin(note)}
          onDelete={(note) => void removeNote(note)}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper">
      {/* L'intestazione trascina la finestra; a destra resta spazio per i controlli di Windows. */}
      <header className="flex items-center gap-4 p-4 pr-40 [-webkit-app-region:drag]">
        <h1 className="text-xl font-semibold">Note adesive</h1>
        <nav className="flex gap-1 [-webkit-app-region:no-drag]" aria-label="Viste">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              aria-current={view === v.id ? 'page' : undefined}
              className={`rounded-md px-3 py-1.5 text-sm ${
                view === v.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {v.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="ml-auto border border-ink bg-paper px-4 py-2 text-sm font-bold text-ink shadow-[2px_2px_0_0_#292921] hover:bg-note-sky [-webkit-app-region:no-drag]"
        >
          + Nuova nota
        </button>
      </header>

      <main className="p-4">
        {error && <p role="alert" className="mb-4 text-rose-700">{error}</p>}
        {actionError && <p role="alert" className="mb-4 text-rose-700">{actionError}</p>}
        {loading && notes.length === 0 && <p>Caricamento…</p>}

        {view === 'settings' && settings && (
          <SettingsView
            settings={settings}
            onThemeChange={(theme) => void update({ theme })}
            onPickDirectory={() => void pickDirectory()}
          />
        )}

        {view !== 'settings' && (
          <>
            <FilterBar filters={filters} onChange={setFilters} tags={tags} />
            {view === 'list' ? (
              filtered.length === 0 ? (
                <p className="text-zinc-500">Nessuna nota trovata.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {pinnedNotes.length > 0 && (
                    <section aria-labelledby="notes-pinned">
                      <h2 id="notes-pinned" className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                        Fissate
                      </h2>
                      {renderCards(pinnedNotes)}
                    </section>
                  )}
                  {otherNotes.length > 0 && (
                    <section aria-labelledby="notes-others">
                      <h2 id="notes-others" className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                        Altre note
                      </h2>
                      {renderCards(otherNotes)}
                    </section>
                  )}
                </div>
              )
            ) : (
              <CalendarView notes={filtered} onOpen={setEditing} />
            )}
          </>
        )}
      </main>

      {previewed && <NotePreview note={previewed} onClose={() => setPreviewId(null)} />}

      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Editor nota"
          className="fixed inset-0 grid place-items-center bg-black/40 p-4"
        >
          <div className="max-h-full w-full max-w-4xl overflow-auto rounded-lg bg-white p-6 dark:bg-zinc-800">
            <NoteEditor
              key={current?.id ?? 'new'}
              note={current}
              onSave={handleSave}
              onDelete={current ? () => void removeNote(current) : undefined}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
