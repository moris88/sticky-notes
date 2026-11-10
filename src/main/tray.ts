import { Menu, nativeImage, Tray } from 'electron';
import { APP_ICON_PATH } from './window';

// Il riferimento va tenuto in un modulo: se il Tray viene raccolto dal garbage collector, l'icona sparisce.
let tray: Tray | null = null;

/** Icona nell'area di notifica: riapre la dashboard e permette di uscire. */
export function createTray(onOpen: () => void, onQuit: () => void): void {
  tray = new Tray(nativeImage.createFromPath(APP_ICON_PATH));
  tray.setToolTip('Note adesive');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Apri dashboard', click: onOpen },
      { type: 'separator' },
      { label: 'Esci', click: onQuit },
    ]),
  );
  tray.on('click', onOpen);
}
