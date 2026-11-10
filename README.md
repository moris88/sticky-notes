# Note adesive (Sticky Notes) per Windows 11

App desktop con Electron, React, TypeScript e Tailwind CSS v4.

## Requisiti

- Node.js 24 o superiore
- pnpm 11 o superiore

## Comandi

```bash
pnpm install     # installa le dipendenze (su Windows, per scaricare il binario di Electron)
pnpm dev         # avvia l'app in modalità sviluppo
pnpm typecheck   # controllo dei tipi TypeScript (strict)
pnpm build       # typecheck + build di main, preload e renderer
pnpm package     # crea l'installer NSIS per Windows (richiede electron-builder)
```

## Dove vengono salvate le note

Ogni nota è un file `.md` con front matter YAML nella cartella scelta in **Impostazioni**
(di default `Documenti\StickyNotes`). Le impostazioni (cartella e tema) sono in `settings.json`
nella cartella dati dell'app.
