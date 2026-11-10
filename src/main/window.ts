import { app, BrowserWindow, shell, type WebPreferences } from 'electron';
import { join } from 'node:path';
import { askCloseAction, isQuitting } from './services/app-lifecycle';
import { currentSettings } from './services/settings-store';

// Palette "carta e inchiostro" (come Jotilla): stessi valori del tema del renderer.
const PAPER = '#f8f7ef';
const INK = '#292921';
const TITLE_BAR_HEIGHT = 40;

/** Colori dei controlli di Windows nella barra del titolo: seguono il tema dell'app. */
function titleBarColors(dark: boolean): { color: string; symbolColor: string; backgroundColor: string } {
  return dark
    ? { color: INK, symbolColor: PAPER, backgroundColor: INK }
    : { color: PAPER, symbolColor: INK, backgroundColor: PAPER };
}

/** Finestre principali aperte (la dashboard): le sole che hanno la barra del titolo nascosta. */
const mainWindows = new Set<BrowserWindow>();

/** Applica il tema alla finestra principale: colori dei controlli e sfondo. */
function applyWindowTheme(win: BrowserWindow, dark: boolean): void {
  const { color, symbolColor, backgroundColor } = titleBarColors(dark);
  win.setTitleBarOverlay({ color, symbolColor, height: TITLE_BAR_HEIGHT });
  win.setBackgroundColor(backgroundColor);
}

/** Chiamata quando cambia il tema nelle impostazioni: aggiorna tutte le finestre principali. */
export function applyThemeToMainWindows(dark: boolean): void {
  for (const win of mainWindows) {
    if (!win.isDestroyed()) applyWindowTheme(win, dark);
  }
}

/** Icona dell'app: la stessa per finestra principale, post-it e installer. */
export const APP_ICON_PATH = join(app.getAppPath(), 'build', 'icon.ico');

/** Preferenze di sicurezza comuni a tutte le finestre (principale e post-it). */
export const SECURE_WEB_PREFERENCES: WebPreferences = {
  preload: join(__dirname, '../preload/index.js'),
  contextIsolation: true,
  sandbox: true,
  nodeIntegration: false,
};

/**
 * Carica il renderer nella finestra. I parametri (es. mode=sticky&id=...) finiscono nell'URL
 * e permettono al renderer di capire quale vista mostrare.
 */
export function loadRenderer(win: BrowserWindow, query: Record<string, string> = {}): void {
  const devUrl = process.env['ELECTRON_RENDERER_URL'];
  if (devUrl) {
    const url = new URL(devUrl);
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    void win.loadURL(url.toString());
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'), { query });
  }
}

/** Crea la finestra principale con le impostazioni di sicurezza consigliate. */
export function createMainWindow(): BrowserWindow {
  const dark = currentSettings().theme === 'dark';
  const { color, symbolColor, backgroundColor } = titleBarColors(dark);
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false, // mostra la finestra solo a rendering pronto
    icon: APP_ICON_PATH,
    // Barra del titolo nascosta: restano i controlli di Windows, colorati come l'app.
    titleBarStyle: 'hidden',
    titleBarOverlay: { color, symbolColor, height: TITLE_BAR_HEIGHT },
    backgroundColor,
    roundedCorners: false, // angoli netti, come nel resto dello stile
    autoHideMenuBar: true, // niente barra dei menu: si mostra solo con Alt
    webPreferences: SECURE_WEB_PREFERENCES,
  });

  mainWindows.add(win);
  win.on('closed', () => mainWindows.delete(win));

  win.once('ready-to-show', () => win.show());

  // Alla X si chiede: metti in background (tray) oppure chiudi l'app.
  win.on('close', (event) => {
    if (isQuitting()) return;
    event.preventDefault();
    void askCloseAction(win);
  });

  // I link esterni si aprono nel browser predefinito, non in una finestra Electron.
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  loadRenderer(win);

  // DevTools solo se avvii con ENVIRONMENT=development (es. $env:ENVIRONMENT="development"; pnpm dev).
  // Il log compare nel terminale di pnpm dev e mostra il valore letto dal processo.
  console.log(`[Note adesive] ENVIRONMENT = ${process.env['ENVIRONMENT'] ?? '(non impostata)'}`);
  if (process.env['ENVIRONMENT'] === 'development') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  return win;
}
