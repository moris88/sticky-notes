import { promises as fs } from 'node:fs'
import path from 'node:path'
import { type AppSettings, THEMES } from '@shared/types/settings'
import { app } from 'electron'

let cache: AppSettings | null = null
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json')

function defaults(): AppSettings {
  return {
    storageDir: path.join(app.getPath('documents'), 'StickyNotes'),
    theme: 'light',
  }
}

/** Carica le impostazioni all'avvio. Al primo avvio il file non esiste: si usano i default. */
export async function loadSettings(): Promise<AppSettings> {
  let stored: Partial<AppSettings> = {}
  try {
    stored = JSON.parse(await fs.readFile(settingsFile(), 'utf-8')) as Partial<AppSettings>
  } catch {
    // nessun file o JSON corrotto: restano i default
  }
  cache = { ...defaults(), ...stored }
  return cache
}

export function currentSettings(): AppSettings {
  if (!cache) throw new Error('Impostazioni non ancora caricate')
  return cache
}

export function currentStorageDir(): string {
  return currentSettings().storageDir
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const next: AppSettings = { ...currentSettings(), ...patch }
  if (!path.isAbsolute(next.storageDir)) {
    throw new Error('La cartella deve avere un percorso assoluto.')
  }
  if (!THEMES.includes(next.theme)) throw new Error('Tema non valido.')

  await fs.writeFile(settingsFile(), JSON.stringify(next, null, 2), 'utf-8')
  cache = next
  return next
}
