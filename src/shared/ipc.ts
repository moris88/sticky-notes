import type { Note } from './types/note';
import type { AppSettings } from './types/settings';

/** Nomi dei canali IPC: unica fonte di verità per main, preload e renderer. */
export const IPC = {
  notes: {
    list: 'notes:list',
    save: 'notes:save',
    remove: 'notes:remove',
  },
  settings: {
    get: 'settings:get',
    update: 'settings:update',
    pickDirectory: 'settings:pick-directory',
  },
  sticky: {
    open: 'sticky:open',
    toggleCollapse: 'sticky:toggle-collapse',
    isCollapsed: 'sticky:is-collapsed',
  },
  /** Eventi inviati dal main ai renderer (direzione main -> renderer). */
  events: {
    notesChanged: 'events:notes-changed',
  },
} as const;

/** Contratto dell'API esposta al renderer come `window.desktop`. */
export interface DesktopApi {
  notes: {
    list(): Promise<Note[]>;
    save(note: Note): Promise<Note>;
    remove(id: string): Promise<void>;
  };
  settings: {
    get(): Promise<AppSettings>;
    update(patch: Partial<AppSettings>): Promise<AppSettings>;
    pickDirectory(): Promise<string | null>;
  };
  sticky: {
    /** Apre la nota come post-it sul desktop (o la porta in primo piano se è già aperta). */
    open(id: string): Promise<void>;
    /** Riduce al solo titolo o espande la finestra della nota. Restituisce il nuovo stato. */
    toggleCollapse(): Promise<boolean>;
    /** Indica se la finestra chiamante è ridotta al solo titolo. */
    isCollapsed(): Promise<boolean>;
  };
  /** Si iscrive ai cambiamenti delle note. Restituisce la funzione per annullare l'iscrizione. */
  onNotesChanged(listener: () => void): () => void;
}
