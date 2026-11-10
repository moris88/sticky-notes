import { useCallback, useEffect, useState } from 'react';
import type { AppSettings } from '@shared/types/settings';

/** Carica le impostazioni e applica il tema (classe `dark` su <html>). */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const theme = settings?.theme;

  useEffect(() => {
    void window.desktop.settings.get().then(setSettings);
  }, []);

  useEffect(() => {
    if (theme) document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const update = useCallback(async (patch: Partial<AppSettings>) => {
    setSettings(await window.desktop.settings.update(patch));
  }, []);

  const pickDirectory = useCallback(async () => {
    const dir = await window.desktop.settings.pickDirectory();
    if (dir) await update({ storageDir: dir });
  }, [update]);

  return { settings, update, pickDirectory };
}
