import { type AppSettings, THEMES, type ThemeMode } from '@shared/types/settings'

const THEME_LABELS: Record<ThemeMode, string> = { light: 'Chiaro', dark: 'Scuro' }

const REPO_URL = 'https://github.com/moris88/sticky-notes'

// Aperti nel browser predefinito tramite setWindowOpenHandler (target="_blank")
const LINKS = [
  { label: 'Segnala un problema', href: `${REPO_URL}/issues` },
  { label: "Scarica l'app", href: `${REPO_URL}/releases` },
  { label: 'Repository GitHub', href: REPO_URL },
  { label: "Sito dell'autore", href: 'https://mauriziotolomeo.it' },
]

interface SettingsViewProps {
  settings: AppSettings
  onThemeChange: (theme: ThemeMode) => void
  onPickDirectory: () => void
}

export function SettingsView({ settings, onThemeChange, onPickDirectory }: SettingsViewProps) {
  return (
    <section className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Cartella di archiviazione</h2>
        <p className="break-all font-mono text-sm text-zinc-600 dark:text-zinc-300">{settings.storageDir}</p>
        <button
          type="button"
          onClick={onPickDirectory}
          className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Cambia cartella…
        </button>
        <p className="text-xs text-zinc-500">Le note già esistenti non vengono spostate automaticamente.</p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Tema</h2>
        <div role="radiogroup" className="flex gap-2">
          {THEMES.map((t) => (
            <label
              key={t}
              className={`cursor-pointer rounded-md border px-4 py-2 focus-within:ring-2 focus-within:ring-sky-600 ${
                settings.theme === t ? 'border-sky-600 bg-sky-600/10' : 'border-zinc-300 dark:border-zinc-600'
              }`}
            >
              <input
                className="sr-only"
                type="radio"
                name="theme"
                value={t}
                checked={settings.theme === t}
                onChange={() => onThemeChange(t)}
              />
              {THEME_LABELS[t]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Progetto</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Autore: Maurizio Tolomeo (maurizio.tolomeo@outlook.it)
        </p>
        <div className="flex flex-wrap gap-2">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-zinc-300 px-4 py-2 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
