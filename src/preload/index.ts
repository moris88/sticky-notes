import { type DesktopApi, IPC } from '@shared/ipc'
import { contextBridge, ipcRenderer } from 'electron'

// Espone solo le funzioni previste. Il renderer non ottiene ipcRenderer né Node.
const api: DesktopApi = {
  notes: {
    list: () => ipcRenderer.invoke(IPC.notes.list),
    save: (note) => ipcRenderer.invoke(IPC.notes.save, note),
    remove: (id) => ipcRenderer.invoke(IPC.notes.remove, id),
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC.settings.get),
    update: (patch) => ipcRenderer.invoke(IPC.settings.update, patch),
    pickDirectory: () => ipcRenderer.invoke(IPC.settings.pickDirectory),
  },
  sticky: {
    open: (id) => ipcRenderer.invoke(IPC.sticky.open, id),
    toggleCollapse: () => ipcRenderer.invoke(IPC.sticky.toggleCollapse),
    isCollapsed: () => ipcRenderer.invoke(IPC.sticky.isCollapsed),
  },
  onNotesChanged: (listener) => {
    const handler = () => listener()
    ipcRenderer.on(IPC.events.notesChanged, handler)
    return () => {
      ipcRenderer.removeListener(IPC.events.notesChanged, handler)
    }
  },
}

contextBridge.exposeInMainWorld('desktop', api)
