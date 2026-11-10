import { app, BrowserWindow, powerMonitor } from 'electron';
import { createMainWindow } from './window';
import { createTray } from './tray';
import { registerIpcHandlers } from './ipc/register';
import {
  moveLooseNotesIntoFolder,
  NoteRepository,
  notesFolderOf,
} from './services/note-repository';
import { markAppQuitting, restoreStickyWindows } from './services/sticky-manager';
import { loadWindowStates } from './services/window-state-store';
import { currentStorageDir, loadSettings } from './services/settings-store';
import { askToQuit, isQuitting, markSessionEnding } from './services/app-lifecycle';

// Una sola istanza: due processi non devono scrivere gli stessi file.
const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  let mainWindow: BrowserWindow | null = null;

  /** Mostra la dashboard: la ricrea se non esiste più, altrimenti la riporta in primo piano. */
  function showMainWindow(): void {
    if (!mainWindow || mainWindow.isDestroyed()) mainWindow = createMainWindow();
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }

  // Un secondo avvio riapre la dashboard invece di aprire un altro processo.
  app.on('second-instance', showMainWindow);

  app.on('before-quit', (event) => {
    if (isQuitting()) {
      // Uscita confermata: i post-it chiusi ora non devono risultare chiusi dall'utente.
      markAppQuitting();
      return;
    }
    // Ctrl+Q o altre uscite senza conferma: si ferma e si chiede con il dialog di sistema.
    event.preventDefault();
    void askToQuit();
  });

  app.whenReady().then(async () => {
    // Spegnimento o riavvio di Windows: lì non si può chiedere conferma, quindi si esce direttamente.
    powerMonitor.on('shutdown', markSessionEnding);

    await loadSettings();
    await loadWindowStates();

    // Le note vivono in <cartella>/notes: si spostano lì anche i .md rimasti nella cartella principale.
    await moveLooseNotesIntoFolder(currentStorageDir());
    const repo = new NoteRepository(() => notesFolderOf(currentStorageDir()));
    registerIpcHandlers(repo);
    mainWindow = createMainWindow();
    createTray(showMainWindow, () => void askToQuit());

    // I post-it aperti all'uscita precedente tornano sul desktop.
    const notes = await repo.list();
    restoreStickyWindows(notes.map((n) => n.id));

    app.on('activate', showMainWindow);
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
