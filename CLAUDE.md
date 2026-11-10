# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Windows 11 desktop sticky-notes app: Electron + electron-vite, React 19, TypeScript (strict), Tailwind CSS v4. Package manager: pnpm (Node 24+, pnpm 11+). Lint/format: Biome (`biome.json`).

## Commands

```bash
pnpm dev         # run the app in development (HMR)
pnpm lint        # biome check .
pnpm format      # biome check --write .
pnpm typecheck   # tsc --noEmit
pnpm build       # typecheck + electron-vite build (main, preload, renderer -> out/)
pnpm start       # preview the built app
pnpm package     # build + NSIS installer (release/)
```

There is no test runner yet: CI (`.github/workflows/ci.yml`, windows-latest) runs `pnpm test`, but `package.json` has no `test` script.

## Architecture

Three Electron processes, sharing types via the `@shared` alias (`src/shared`):

- **Main** (`src/main`): `index.ts` enforces a single instance, loads settings and window state, creates the dashboard window, the tray, and restores the sticky windows that were open at the last exit. `services/` holds the logic:
  - `note-repository.ts` + `note-serializer.ts`: each note is a `.md` file with a YAML front matter (id, title, color, dueDate, pinned, tags, timestamps) inside `<storageDir>/notes`. `storageDir` comes from settings (default `Documents\StickyNotes`); loose `.md` files in the root are moved into `notes/` at startup.
  - `settings-store.ts`: `settings.json` in the app data folder (folder + theme).
  - `sticky-manager.ts` + `window-state-store.ts`: one frameless, always-on-top `BrowserWindow` per note shown on the desktop; bounds / open / collapsed state are persisted per note id.
  - `app-lifecycle.ts`: quit confirmation; OS shutdown skips the prompt.
- **Preload** (`src/preload/index.ts`): exposes only the `DesktopApi` as `window.desktop` via `contextBridge`.
- **Renderer** (`src/renderer/src`): a single bundle serves both window kinds; `main.tsx` picks `StickyWindow` when the URL has `?mode=sticky&id=...`, otherwise `App` (dashboard with list / calendar / settings views). Logic lives in `hooks/` and pure helpers in `lib/`.

**IPC contract**: `src/shared/ipc.ts` is the single source of truth for channel names (`IPC`) and the `DesktopApi` interface. Adding a capability means touching `shared/ipc.ts`, `main/ipc/register.ts` and `preload/index.ts` together. After writes, main broadcasts `events:notes-changed` to all windows so dashboard and sticky windows resync.

Path aliases: `@shared/*` (all processes), `@renderer/*` (renderer). In dev the CSP meta tag is stripped from `index.html` (see `electron.vite.config.ts`); it stays in production builds.

## Gotchas

- `/notes` in `.gitignore` is anchored to the root on purpose (local note data); an unanchored `notes` would also hide `src/renderer/src/components/notes/`.
- UI strings and comments are in Italian.
