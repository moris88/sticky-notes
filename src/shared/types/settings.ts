export const THEMES = ['light', 'dark'] as const
export type ThemeMode = (typeof THEMES)[number]

export interface AppSettings {
  storageDir: string // percorso assoluto della cartella con i file .md
  theme: ThemeMode
}
