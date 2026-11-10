import { BrowserWindow } from 'electron';
import { APP_ICON_PATH, loadRenderer, SECURE_WEB_PREFERENCES } from '../window';
import { ID_PATTERN } from './note-repository';
import {
  getStickyState,
  openStickyIds,
  setStickyState,
  type Bounds,
} from './window-state-store';

/** Altezza della barra del titolo quando la nota è ridotta (uguale all'header dell'UI, h-11). */
const COLLAPSED_HEIGHT = 44;
// Un post-it ridotto ha sempre la stessa dimensione: il titolo oltre lo spazio finisce con i puntini.
const COLLAPSED_WIDTH = 260;
const MIN_WIDTH = 240; // abbastanza larga per titolo e quattro pulsanti
const MIN_EXPANDED_HEIGHT = 120;
const DEFAULT_BOUNDS: Bounds = { width: 300, height: 300 };
const NOTE_BACKGROUND = '#FFF09B'; // Gialla, colore di default (come Jotilla)

/** Finestre dei post-it aperti, indicizzate per id della nota. */
const windows = new Map<string, BrowserWindow>();
let quitting = false;

/** Va chiamata all'uscita dell'app: così i post-it restano "aperti" e si riaprono al prossimo avvio. */
export function markAppQuitting(): void {
  quitting = true;
}

/** Apre la nota come post-it sul desktop, o la porta in primo piano se è già aperta. */
export function openStickyWindow(noteId: string): void {
  if (!ID_PATTERN.test(noteId)) throw new Error(`ID nota non valido: ${noteId}`);

  const existing = windows.get(noteId);
  if (existing && !existing.isDestroyed()) {
    existing.show();
    existing.focus();
    return;
  }

  const state = getStickyState(noteId);
  const bounds = state.bounds ?? DEFAULT_BOUNDS;

  const win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: state.collapsed ? COLLAPSED_WIDTH : bounds.width,
    height: state.collapsed ? COLLAPSED_HEIGHT : bounds.height,
    minWidth: state.collapsed ? COLLAPSED_WIDTH : MIN_WIDTH,
    minHeight: state.collapsed ? COLLAPSED_HEIGHT : MIN_EXPANDED_HEIGHT,
    resizable: !state.collapsed,
    frame: false, // niente barra di Windows: la barra del titolo è disegnata dall'app
    skipTaskbar: true,
    alwaysOnTop: true, // il post-it resta sopra tutte le altre finestre
    backgroundColor: NOTE_BACKGROUND,
    icon: APP_ICON_PATH,
    show: false,
    webPreferences: SECURE_WEB_PREFERENCES,
  });

  windows.set(noteId, win);
  setStickyState(noteId, { open: true });

  // Posizione e dimensioni si salvano solo quando la nota è espansa.
  const persistBounds = () => {
    if (win.isDestroyed() || getStickyState(noteId).collapsed) return;
    setStickyState(noteId, { bounds: win.getBounds() });
  };
  win.on('move', persistBounds);
  win.on('resize', persistBounds);

  win.once('ready-to-show', () => win.show());

  win.on('closed', () => {
    windows.delete(noteId);
    // Chiudere con la X nasconde il post-it; l'uscita dell'app non cambia lo stato.
    if (!quitting) setStickyState(noteId, { open: false });
  });

  loadRenderer(win, { mode: 'sticky', id: noteId });
}

/** Chiude il post-it di una nota (usato quando la nota viene eliminata). */
export function closeStickyWindow(noteId: string): void {
  const win = windows.get(noteId);
  if (win && !win.isDestroyed()) win.close();
}

/** Riduce al solo titolo o espande la finestra. Restituisce il nuovo stato "ridotto". */
export function toggleCollapse(win: BrowserWindow): boolean {
  const noteId = idOf(win);
  if (!noteId) return false;

  const collapsed = !getStickyState(noteId).collapsed;

  if (collapsed) {
    // Si ricordano le dimensioni espanse prima di ridurre la finestra.
    setStickyState(noteId, { collapsed: true, bounds: win.getBounds() });
    win.setMinimumSize(COLLAPSED_WIDTH, COLLAPSED_HEIGHT);
    win.setResizable(false);
    const { x, y } = win.getBounds();
    win.setBounds({ x, y, width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT });
  } else {
    const restore = getStickyState(noteId).bounds ?? {
      ...win.getBounds(),
      height: DEFAULT_BOUNDS.height,
    };
    setStickyState(noteId, { collapsed: false });
    win.setMinimumSize(MIN_WIDTH, MIN_EXPANDED_HEIGHT);
    win.setResizable(true);
    win.setBounds(restore);
  }

  return collapsed;
}

export function isCollapsed(win: BrowserWindow): boolean {
  const noteId = idOf(win);
  return noteId ? getStickyState(noteId).collapsed : false;
}

/**
 * Riapre i post-it che erano aperti all'uscita precedente.
 * Quelli di note nel frattempo eliminate vengono dimenticati.
 */
export function restoreStickyWindows(existingNoteIds: string[]): void {
  const existing = new Set(existingNoteIds);
  for (const id of openStickyIds()) {
    if (existing.has(id)) openStickyWindow(id);
    else setStickyState(id, { open: false });
  }
}

function idOf(win: BrowserWindow): string | undefined {
  for (const [id, w] of windows) {
    if (w === win) return id;
  }
  return undefined;
}
