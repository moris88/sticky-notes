import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Note } from '@shared/types/note';
import { parseNote, serializeNote } from './note-serializer';

// Solo caratteri sicuri nel nome file: blocca il path traversal (es. "../").
export const ID_PATTERN = /^[a-zA-Z0-9-]{1,64}$/;

/** Accesso al filesystem: una nota equivale a un file .md nella cartella configurata. */
export class NoteRepository {
  constructor(private readonly getDir: () => string) {}

  private pathFor(id: string): string {
    if (!ID_PATTERN.test(id)) throw new Error(`ID nota non valido: ${id}`);
    return path.join(this.getDir(), `${id}.md`);
  }

  async list(): Promise<Note[]> {
    const dir = this.getDir();
    await fs.mkdir(dir, { recursive: true });
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'));
    const notes = await Promise.all(
      files.map(async (f) => parseNote(await fs.readFile(path.join(dir, f), 'utf-8'))),
    );
    return notes
      .filter((n): n is Note => n !== null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async save(note: Note): Promise<Note> {
    const target = this.pathFor(note.id);
    await fs.mkdir(path.dirname(target), { recursive: true });
    // Scrittura su file temporaneo + rename: evita file troncati se l'app si chiude a metà.
    const tmp = `${target}.tmp`;
    await fs.writeFile(tmp, serializeNote(note), 'utf-8');
    await fs.rename(tmp, target);
    return note;
  }

  async remove(id: string): Promise<void> {
    await fs.rm(this.pathFor(id), { force: true });
  }
}

/** Cartella delle note dentro la cartella di archiviazione scelta dall'utente. */
export const notesFolderOf = (storageDir: string): string => path.join(storageDir, 'notes');

/**
 * Sposta nella sottocartella `notes` tutti i file .md che si trovano nella cartella di archiviazione.
 * Restituisce quanti file sono stati spostati.
 */
export async function moveLooseNotesIntoFolder(storageDir: string): Promise<number> {
  const notesDir = notesFolderOf(storageDir);
  await fs.mkdir(notesDir, { recursive: true });

  const candidates = (await fs.readdir(storageDir, { withFileTypes: true })).filter(
    (e) => e.isFile() && e.name.endsWith('.md'),
  );

  // Si spostano solo i file che sono davvero note (front matter valido, nome = id.md).
  // Gli altri .md della cartella (es. README.md) restano dove sono.
  let moved = 0;
  for (const entry of candidates) {
    const from = path.join(storageDir, entry.name);
    const note = parseNote(await fs.readFile(from, 'utf-8'));
    if (!note || !ID_PATTERN.test(note.id) || entry.name !== `${note.id}.md`) continue;

    await fs.rename(from, path.join(notesDir, entry.name));
    moved += 1;
  }
  return moved;
}
