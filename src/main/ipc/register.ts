import { BrowserWindow, dialog, ipcMain, type OpenDialogOptions } from 'electron';
import { IPC } from '@shared/ipc';
import type { Note } from '@shared/types/note';
import type { AppSettings } from '@shared/types/settings';
import { NoteRepository } from '../services/note-repository';
import { currentSettings, updateSettings } from '../services/settings-store';
import { applyThemeToMainWindows } from '../window';
import {
  closeStickyWindow,
  isCollapsed,
  openStickyWindow,
  toggleCollapse,
} from '../services/sticky-manager';

/** Avvisa tutte le finestre aperte che le note sono cambiate, così ricaricano l'elenco. */
function broadcastNotesChanged(): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(IPC.events.notesChanged);
  }
}

/** Collega i canali IPC ai servizi. Il main è l'unico punto di accesso al filesystem. */
export function registerIpcHandlers(repo: NoteRepository): void {
  ipcMain.handle(IPC.notes.list, () => repo.list());

  ipcMain.handle(IPC.notes.save, async (_event, note: Note) => {
    // Il main imposta updatedAt: il renderer non può falsificarlo.
    const saved = await repo.save({ ...note, updatedAt: new Date().toISOString() });
    broadcastNotesChanged();
    return saved;
  });

  ipcMain.handle(IPC.notes.remove, async (_event, id: string) => {
    await repo.remove(id);
    closeStickyWindow(id); // chiude il post-it solo dopo che il file è stato eliminato
    broadcastNotesChanged();
  });

  ipcMain.handle(IPC.settings.get, () => currentSettings());

  ipcMain.handle(IPC.settings.update, async (_event, patch: Partial<AppSettings>) => {
    const settings = await updateSettings(patch);
    // Il tema cambia anche i colori dei controlli di Windows nella dashboard.
    applyThemeToMainWindows(settings.theme === 'dark');
    return settings;
  });

  ipcMain.handle(IPC.settings.pickDirectory, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) ?? undefined;
    const options: OpenDialogOptions = {
      title: 'Scegli la cartella delle note',
      properties: ['openDirectory', 'createDirectory'],
    };
    const result = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options);
    return result.canceled ? null : (result.filePaths[0] ?? null);
  });

  ipcMain.handle(IPC.sticky.open, (_event, id: string) => openStickyWindow(id));

  ipcMain.handle(IPC.sticky.toggleCollapse, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? toggleCollapse(win) : false;
  });

  ipcMain.handle(IPC.sticky.isCollapsed, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? isCollapsed(win) : false;
  });
}
