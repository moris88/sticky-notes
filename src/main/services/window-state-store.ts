import { promises as fs } from 'node:fs'
import path from 'node:path'
import { app } from 'electron'

export interface Bounds {
  x?: number
  y?: number
  width: number
  height: number
}

/** Stato di un post-it: se è aperto, dove si trova e se è ridotto al solo titolo. */
export interface StickyState {
  open: boolean
  collapsed: boolean
  /** Dimensioni e posizione della finestra espansa (non di quella ridotta). */
  bounds?: Bounds
}

type StateMap = Record<string, StickyState>

const SAVE_DELAY_MS = 300
let states: StateMap = {}
let saveTimer: NodeJS.Timeout | null = null

const stateFile = () => path.join(app.getPath('userData'), 'sticky-windows.json')

/** Carica lo stato salvato all'avvio. Se il file manca o è corrotto si parte da zero. */
export async function loadWindowStates(): Promise<void> {
  try {
    states = JSON.parse(await fs.readFile(stateFile(), 'utf-8')) as StateMap
  } catch {
    states = {}
  }
}

export function getStickyState(id: string): StickyState {
  return states[id] ?? { open: false, collapsed: false }
}

/** Aggiorna lo stato di un post-it e pianifica il salvataggio su disco. */
export function setStickyState(id: string, patch: Partial<StickyState>): void {
  states[id] = { ...getStickyState(id), ...patch }
  scheduleSave()
}

/** Identificativi dei post-it che erano aperti: da riaprire all'avvio. */
export function openStickyIds(): string[] {
  return Object.entries(states)
    .filter(([, s]) => s.open)
    .map(([id]) => id)
}

function scheduleSave(): void {
  // Spostando o ridimensionando una finestra si generano molti eventi: si scrive una volta sola.
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    void fs.writeFile(stateFile(), JSON.stringify(states, null, 2), 'utf-8')
  }, SAVE_DELAY_MS)
}
