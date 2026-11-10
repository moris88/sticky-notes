import type { Note } from '@shared/types/note'
import { useEffect } from 'react'
import { formatDueDate } from '../../lib/dates'
import { renderMarkdown } from '../../lib/markdown'
import { NOTE_COLOR_CLASSES, NOTE_CONTENT_CLASSES } from '../../lib/note-colors'
import { HIGHLIGHT_CLASSES, isHighlighted } from '../../lib/note-highlight'
import { displayTitle } from '../../lib/note-title'
import { CloseIcon } from '../ui/icons'

interface NotePreviewProps {
  note: Note
  onClose: () => void
}

/** Anteprima al centro dell'app, in sola lettura: si apre cliccando la card. Per modificare si usa l'editor. */
export function NotePreview({ note, onClose }: NotePreviewProps) {
  // Esc chiude l'anteprima.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Anteprima nota"
      className="fixed inset-0 grid place-items-center bg-black/40 p-4"
    >
      {/* Sfondo cliccabile: chiude l'anteprima. Fuori dal Tab, da tastiera si usano Esc o il pulsante Chiudi. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div
        className={`${NOTE_COLOR_CLASSES[note.color]} ${isHighlighted(note) ? HIGHLIGHT_CLASSES : 'shadow-xl'} relative flex max-h-full w-full max-w-2xl flex-col gap-3 overflow-hidden border border-ink p-6 text-ink`}
      >
        <header className="flex justify-between items-center gap-3">
          <h2 className="min-w-0 flex-1 text-xl font-semibold line-clamp-2">{displayTitle(note)}</h2>
          <div className="flex items-start justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi l'anteprima"
              title="Chiudi l'anteprima"
              className="border border-transparent p-1 hover:border-ink hover:bg-paper"
            >
              <CloseIcon />
            </button>
          </div>
        </header>
        <div
          className={`${NOTE_CONTENT_CLASSES} min-h-0 flex-1 overflow-auto`}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdown escapa tutto l'input prima di generare i tag
          dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) || '<p>Nota vuota.</p>' }}
        />
        {(note.dueDate || note.tags.length > 0) && (
          <footer className="flex shrink-0 flex-wrap items-center gap-1 text-xs">
            {note.dueDate && <span className="font-medium">Scade il {formatDueDate(note.dueDate)}</span>}
            {note.tags.map((tag) => (
              <span key={tag} className="border border-ink bg-paper px-1.5 py-0.5">
                #{tag}
              </span>
            ))}
          </footer>
        )}
      </div>
    </div>
  )
}
