import { NOTE_COLORS, type Note, type NoteColor, type NoteDraft } from '@shared/types/note'
import { type FormEvent, useState } from 'react'
import { renderMarkdown } from '../../lib/markdown'
import { NOTE_COLOR_CLASSES, NOTE_COLOR_LABELS, NOTE_CONTENT_CLASSES } from '../../lib/note-colors'
import { parseTags } from '../../lib/tags'

interface NoteEditorProps {
  note: Note | null // null = nuova nota
  onSave: (draft: NoteDraft) => void
  onDelete?: () => void
  onCancel: () => void
}

/**
 * Editor con anteprima live. Lo stato è locale: il componente va montato con una `key`
 * diversa per ogni nota, così ogni apertura parte da valori puliti.
 */
export function NoteEditor({ note, onSave, onDelete, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [color, setColor] = useState<NoteColor>(note?.color ?? 'sand')
  const [dueDate, setDueDate] = useState(note?.dueDate ?? '')
  const [tagInput, setTagInput] = useState(note?.tags.join(', ') ?? '')

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSave({
      title: title.trim(),
      content,
      color,
      dueDate: dueDate || null,
      tags: parseTags(tagInput),
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="w-full flex justify-end items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
        >
          Annulla
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Titolo
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Es. Chiamare il fornitore"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base font-semibold dark:border-zinc-600 dark:bg-zinc-900"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Scrivi in Markdown…"
          aria-label="Testo della nota"
          rows={20}
          className="min-h-72 resize-y rounded-md border border-zinc-300 p-3 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
        />
        <section
          className={`${NOTE_COLOR_CLASSES[color]} ${NOTE_CONTENT_CLASSES} min-h-72 overflow-auto rounded-md p-4`}
          aria-label="Anteprima"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdown escapa tutto l'input prima di generare i tag
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Scadenza
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Tag (separati da virgola)
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="fatture, urgente"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>
      </div>

      <fieldset className="flex items-center gap-2">
        <legend className="mb-1 text-sm">Colore</legend>
        {NOTE_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={NOTE_COLOR_LABELS[c]}
            aria-pressed={color === c}
            onClick={() => setColor(c)}
            className={`${NOTE_COLOR_CLASSES[c]} size-7 rounded-full ${color === c ? 'ring-2 ring-zinc-900 ring-offset-2 dark:ring-zinc-100' : ''}`}
          />
        ))}
      </fieldset>

      <footer className="flex items-center justify-between">
        {onDelete ? (
          <button type="button" onClick={onDelete} className="text-sm text-rose-700 hover:underline">
            Elimina
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Salva
          </button>
        </div>
      </footer>
    </form>
  )
}
