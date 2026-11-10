import type { Note } from '@shared/types/note'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { formatDueDate } from '../../lib/dates'
import { renderMarkdown } from '../../lib/markdown'
import { NOTE_COLOR_CLASSES, NOTE_CONTENT_CLASSES } from '../../lib/note-colors'
import { HIGHLIGHT_CLASSES, isHighlighted } from '../../lib/note-highlight'
import { displayTitle } from '../../lib/note-title'
import { DesktopIcon, EditIcon, PinIcon, TrashIcon } from '../ui/icons'

/** Dimensioni fisse delle card in dashboard: la griglia usa la stessa larghezza. */
export const CARD_WIDTH = '15rem'
export const CARD_HEIGHT = '13rem'

interface NoteCardProps {
  note: Note
  /** Click sulla card: mostra l'anteprima al centro, in sola lettura. */
  onPreview: (note: Note) => void
  /** Solo dal pulsante dedicato: apre l'editor. */
  onEdit: (note: Note) => void
  onDesktop: (note: Note) => void
  onTogglePin: (note: Note) => void
  onDelete: (note: Note) => void
}

/** Card di una nota a dimensione fissa: presentazionale, le azioni arrivano dall'esterno. */
export function NoteCard({ note, onPreview, onEdit, onDesktop, onTogglePin, onDelete }: NoteCardProps) {
  const preview = () => onPreview(note)
  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      preview()
    }
  }

  return (
    <article
      onClick={preview}
      onKeyDown={onKey}
      // Dimensione fissa e identica per tutte le card: lo stile inline non dipende dalle classi generate.
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT, minHeight: CARD_HEIGHT, maxHeight: CARD_HEIGHT }}
      className={`${NOTE_COLOR_CLASSES[note.color]} ${isHighlighted(note) ? HIGHLIGHT_CLASSES : 'shadow-md'} relative flex h-52 w-full cursor-pointer flex-col gap-2 overflow-hidden border border-transparent p-4 transition hover:border-ink hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600`}
    >
      <div className="flex shrink-0 items-start gap-2">
        <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-ink">{displayTitle(note)}</h3>
        {/* Le azioni non aprono l'anteprima: ogni ActionButton ferma la propagazione di click e tasti. */}
        <div className="flex shrink-0 items-center gap-0.5">
          <ActionButton label="Modifica" onClick={() => onEdit(note)}>
            <EditIcon />
          </ActionButton>
          <ActionButton label="Apri sul desktop" onClick={() => onDesktop(note)}>
            <DesktopIcon />
          </ActionButton>
          <ActionButton
            label={note.pinned ? 'Rimuovi da in alto' : 'Fissa in alto'}
            active={note.pinned}
            onClick={() => onTogglePin(note)}
          >
            <PinIcon filled={note.pinned} />
          </ActionButton>
          <ActionButton label="Elimina" danger onClick={() => onDelete(note)}>
            <TrashIcon />
          </ActionButton>
        </div>
      </div>
      <div
        className={`${NOTE_CONTENT_CLASSES} min-h-0 flex-1 overflow-hidden`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdown escapa tutto l'input prima di generare i tag
        dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
      />
      <footer className="mt-auto flex shrink-0 flex-wrap items-center gap-1 text-xs text-ink">
        {note.dueDate && <span className="font-medium">Scade il {formatDueDate(note.dueDate)}</span>}
        {note.tags.map((tag) => (
          <span key={tag} className="border border-ink bg-paper px-1.5 py-0.5">
            #{tag}
          </span>
        ))}
      </footer>
    </article>
  )
}

const stop = (e: MouseEvent | KeyboardEvent) => e.stopPropagation()

interface ActionButtonProps {
  label: string
  onClick: () => void
  active?: boolean
  danger?: boolean
  children: ReactNode
}

/** Pulsante icona della barra azioni. `aria-pressed` segnala lo stato attivo (es. fissata). */
function ActionButton({ label, onClick, active = false, danger = false, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={(e) => {
        stop(e)
        onClick()
      }}
      onKeyDown={stop}
      className={`border border-transparent p-1 text-ink hover:border-ink hover:bg-paper ${
        danger ? 'hover:text-rose-700' : ''
      } ${active ? 'bg-black/10 opacity-100' : 'opacity-60 hover:opacity-100'}`}
    >
      {children}
    </button>
  )
}
