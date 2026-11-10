import { THEMES, type AppSettings, type ThemeMode } from '@shared/types/settings';

const THEME_LABELS: Record<ThemeMode, string> = { light: 'Chiaro', dark: 'Scuro' };

interface SettingsViewProps {
  settings: AppSettings;
  onThemeChange: (theme: ThemeMode) => void;
  onPickDirectory: () => void;
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
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={settings.theme === t}
              onClick={() => onThemeChange(t)}
              className={`rounded-md border px-4 py-2 ${
                settings.theme === t ? 'border-sky-600 bg-sky-600/10' : 'border-zinc-300 dark:border-zinc-600'
              }`}
            >
              {THEME_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
