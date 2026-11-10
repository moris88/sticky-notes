import type { NoteColor } from '@shared/types/note';

// Le classi sono stringhe complete: Tailwind le rileva solo se compaiono per intero.
export const NOTE_COLOR_CLASSES: Record<NoteColor, string> = {
  sand: 'bg-note-sand',
  mint: 'bg-note-mint',
  sky: 'bg-note-sky',
  rose: 'bg-note-rose',
  lavender: 'bg-note-lavender',
};

export const NOTE_COLOR_LABELS: Record<NoteColor, string> = {
  sand: 'Sabbia',
  mint: 'Menta',
  sky: 'Cielo',
  rose: 'Rosa',
  lavender: 'Lavanda',
};

/** Stile del contenuto Markdown di una nota (usato da card e anteprima). */
// Anteprima formattata: testo proporzionale, titoli in grassetto, codice in monospazio su sfondo.
// Il sorgente nella modifica usa invece il font monospazio della textarea, quindi le due viste differiscono.
export const NOTE_CONTENT_CLASSES =
  'text-left text-sm leading-relaxed text-ink [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:font-semibold [&_p]:my-1 [&_ul]:my-1 [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:my-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs [&_pre]:my-2 [&_pre]:overflow-hidden [&_pre]:whitespace-pre [&_pre]:rounded [&_pre]:bg-black/15 [&_pre]:p-2 [&_pre_code]:bg-transparent [&_pre_code]:p-0';
