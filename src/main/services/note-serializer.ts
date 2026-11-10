import { NOTE_COLORS, type Note, type NoteColor } from '@shared/types/note';

const FENCE = '---';
// Front matter tra due linee "---", seguito dal corpo Markdown.
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/** Converte una nota nel formato file: front matter YAML + corpo Markdown. */
export function serializeNote(note: Note): string {
  const meta = [
    FENCE,
    `id: ${note.id}`,
    `title: ${JSON.stringify(note.title)}`, // JSON gestisce virgolette e due punti nel titolo
    `color: ${note.color}`,
    `dueDate: ${note.dueDate ?? ''}`,
    `pinned: ${note.pinned ? 'true' : 'false'}`,
    `tags: ${JSON.stringify(note.tags)}`, // JSON è un flow sequence YAML valido
    `createdAt: ${note.createdAt}`,
    `updatedAt: ${note.updatedAt}`,
    FENCE,
  ];
  return `${meta.join('\n')}\n\n${note.content}\n`;
}

/** Ricostruisce una nota dal file. Restituisce null se il formato non è valido. */
export function parseNote(raw: string): Note | null {
  const match = FRONT_MATTER.exec(raw);
  if (!match) return null;

  const meta = readMeta(match[1] ?? '');
  const id = meta.get('id');
  if (!id) return null;

  const color = meta.get('color');
  return {
    id,
    title: parseTitle(meta.get('title')),
    content: (match[2] ?? '').replace(/^\r?\n/, '').replace(/\r?\n$/, ''),
    color: isNoteColor(color) ? color : 'sand',
    tags: parseTags(meta.get('tags')),
    dueDate: meta.get('dueDate') || null,
    pinned: meta.get('pinned') === 'true', // assente nelle note vecchie: non fissata
    createdAt: meta.get('createdAt') ?? new Date(0).toISOString(),
    updatedAt: meta.get('updatedAt') ?? new Date(0).toISOString(),
  };
}

function readMeta(block: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of block.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx > 0) map.set(line.slice(0, idx).trim(), line.slice(idx + 1).trim());
  }
  return map;
}

function parseTags(value: string | undefined): string[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((t): t is string => typeof t === 'string')
      : [];
  } catch {
    return [];
  }
}

// Le note create prima dell'introduzione del titolo non hanno la riga: restano senza titolo.
function parseTitle(value: string | undefined): string {
  try {
    const parsed: unknown = JSON.parse(value ?? '""');
    return typeof parsed === 'string' ? parsed : '';
  } catch {
    return '';
  }
}

function isNoteColor(value: string | undefined): value is NoteColor {
  return NOTE_COLORS.includes(value as NoteColor);
}
