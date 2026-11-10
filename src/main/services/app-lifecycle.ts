import { app, BrowserWindow, dialog, Notification } from 'electron';

// Stato dell'uscita: l'uscita reale avviene solo dopo conferma esplicita dell'utente
// (o quando Windows sta spegnendo/chiudendo la sessione, dove non si può chiedere nulla).
let quitConfirmed = false;
let sessionEnding = false;

export const markSessionEnding = (): void => {
  sessionEnding = true;
};

export const isQuitting = (): boolean => quitConfirmed || sessionEnding;

let backgroundNoticeShown = false;

/** Nasconde la dashboard nel tray. La prima volta avvisa l'utente di come riaprirla. */
export function hideToBackground(win: BrowserWindow): void {
  win.hide();
  if (!backgroundNoticeShown && Notification.isSupported()) {
    backgroundNoticeShown = true;
    new Notification({
      title: 'Note adesive è in background',
      body: "Per riaprire la dashboard clicca l'icona nel tray (accanto all'orologio) oppure avvia di nuovo l'app.",
    }).show();
  }
}

/** Alla X della dashboard: chiedere se metterla in background o chiudere l'app. */
export async function askCloseAction(win: BrowserWindow): Promise<void> {
  const { response } = await dialog.showMessageBox(win, {
    type: 'question',
    title: 'Note adesive',
    message: 'Cosa vuoi fare?',
    detail:
      "Metti in background per tenere l'app nel tray: i post-it restano sul desktop. Chiudi per uscire dall'app.",
    buttons: ['Metti in background', 'Chiudi app', 'Annulla'],
    defaultId: 0,
    cancelId: 2,
  });
  if (response === 0) hideToBackground(win);
  if (response === 1) {
    quitConfirmed = true;
    app.quit();
  }
}

/** Mostra il dialog di sistema e, se confermato, chiude l'app (post-it inclusi). */
export async function askToQuit(): Promise<void> {
  const { response } = await dialog.showMessageBox({
    type: 'question',
    title: 'Note adesive',
    message: 'Vuoi chiudere Note adesive?',
    detail: "I post-it aperti sul desktop verranno chiusi e riaperti al prossimo avvio dell'app.",
    buttons: ['Chiudi', 'Annulla'],
    defaultId: 1,
    cancelId: 1,
  });
  if (response === 0) {
    quitConfirmed = true;
    app.quit();
  }
}
