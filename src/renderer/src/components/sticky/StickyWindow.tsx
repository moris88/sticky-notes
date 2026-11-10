import { useEffect, useState } from 'react';
import { useStickyNote } from '../../hooks/useStickyNote';
import { renderMarkdown } from '../../lib/markdown';
import { NOTE_COLOR_CLASSES, NOTE_CONTENT_CLASSES } from '../../lib/note-colors';
import { HIGHLIGHT_CLASSES, isHighlighted } from '../../lib/note-highlight';
import { displayTitle } from '../../lib/note-title';
import { IconButton } from '../ui/IconButton';
import { CloseIcon, CollapseIcon, EditIcon, ExpandIcon, TrashIcon } from '../ui/icons';

interface StickyWindowProps {
  noteId: string;
}

/**
 * Post-it sul desktop: finestra senza bordi, sempre in primo piano, con barra del titolo
 * trascinabile e pulsanti per modificare, eliminare, ridurre/espandere e chiudere.
 */
export function StickyWindow({ noteId }: StickyWindowProps) {
  const { note, loaded, collapsed, save, toggleCollapse } = useStickyNote(noteId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Finché non si scrive, la bozza segue sempre il contenuto della nota.
  useEffect(() => {
    if (!editing && note) setDraft(note.content);
  }, [note, editing]);

  if (!loaded) return <div className="h-screen bg-note-sand" />;

  if (!note) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-note-sand p-3 text-center text-sm text-ink">
        <p>Nota non trovata.</p>
        <button type="button" onClick={() => window.close()} className="underline">
          Chiudi
        </button>
      </div>
    );
  }

  const reportError = (action: string, err: unknown) => {
    console.error(`[Post-it] ${action} fallito:`, err);
    setError(`${action} non riuscito: ${err instanceof Error ? err.message : String(err)}`);
  };

  const finishEditing = async () => {
    setEditing(false);
    if (draft === note.content) return;
    try {
      await save({ ...note, content: draft });
      setError(null);
    } catch (err) {
      reportError('Salvataggio', err);
    }
  };

  const startEditing = () => {
    if (collapsed) void toggleCollapse(); // per modificare bisogna prima espandere
    setEditing(true);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Eliminare la nota "${displayTitle(note)}"? L'operazione non è reversibile.`)) {
      return;
    }
    try {
      // Il main chiude questo post-it dopo aver eliminato il file.
      await window.desktop.notes.remove(note.id);
    } catch (err) {
      reportError('Eliminazione', err);
    }
  };

  return (
    <div
      className={`${NOTE_COLOR_CLASSES[note.color]} ${isHighlighted(note) ? HIGHLIGHT_CLASSES : 'shadow-lg'} flex h-screen flex-col overflow-hidden border border-ink text-ink`}
    >
      {/* La barra è trascinabile; i pulsanti interni restano cliccabili. */}
      <header className="flex h-11 shrink-0 items-center gap-1 border-b border-ink px-2 [-webkit-app-region:drag]">
        {/* min-w-0 permette al titolo di restringersi: oltre lo spazio disponibile compaiono i puntini. */}
        <h1 className="min-w-0 flex-1 truncate text-sm font-bold">{displayTitle(note)}</h1>
        <div className="flex shrink-0 gap-0.5 [-webkit-app-region:no-drag]">
          <IconButton label="Modifica la nota" onClick={startEditing}>
            <EditIcon />
          </IconButton>
          <IconButton label="Elimina la nota" onClick={() => void handleDelete()}>
            <TrashIcon />
          </IconButton>
          <IconButton
            label={collapsed ? 'Espandi la nota' : 'Riduci al solo titolo'}
            onClick={() => void toggleCollapse()}
          >
            {collapsed ? <ExpandIcon /> : <CollapseIcon />}
          </IconButton>
          <IconButton label="Chiudi il post-it" onClick={() => window.close()}>
            <CloseIcon />
          </IconButton>
        </div>
      </header>

      {!collapsed && (
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
          {error && (
            <p role="alert" className="mb-1 text-xs text-rose-800">
              {error}
            </p>
          )}
          {editing ? (
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => void finishEditing()}
              aria-label="Testo della nota"
              className="min-h-0 flex-1 resize-none bg-transparent font-mono text-sm outline-none"
            />
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={startEditing}
              onKeyDown={(e) => {
                if (e.key === 'Enter') startEditing();
              }}
              className={`${NOTE_CONTENT_CLASSES} min-h-0 flex-1 cursor-text overflow-auto`}
              // Sicuro: renderMarkdown escapa tutto l'input prima di generare i tag.
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(note.content) || '<p>Clicca per scrivere…</p>',
              }}
            />
          )}
          {note.tags.length > 0 && (
            <footer className="mt-2 flex shrink-0 flex-wrap gap-1 text-xs text-ink">
              {note.tags.map((tag) => (
                <span key={tag} className="border border-ink bg-paper px-1.5 py-0.5">
                  #{tag}
                </span>
              ))}
            </footer>
          )}
        </div>
      )}
    </div>
  );
}
