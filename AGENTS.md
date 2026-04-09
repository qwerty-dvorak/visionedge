# Repository Guidelines

## Project Structure & Module Organization
- `App.tsx` is the main application shell and contains the primary UI/state for the prototype.
- `index.ts` registers the Expo root component.
- Reusable code lives under `src/`:
  - `src/components/` shared UI pieces
  - `src/screens/` top-level screens
  - `src/constants/` theme and configuration values
  - `src/data/` mock/demo data
  - `src/types/` shared TypeScript types
- Static assets are in `assets/`; reference screenshots live in `screenshots/`; supporting docs are in `docs/`.

## Build, Test, and Development Commands
- `pnpm start` launches the Expo dev server.
- `pnpm android` opens the app on an Android device/emulator.
- `pnpm ios` opens the app on iOS.
- `pnpm web` runs the web target.
- `pnpm typecheck` runs TypeScript with `--noEmit` for strict type validation.
- `pnpm lint` runs Expo’s linting checks.

## Coding Style & Naming Conventions
- Follow the existing TypeScript/React Native style in the repo: 2-space indentation, double quotes, and semicolons where already used.
- Use `PascalCase` for components and screens, `camelCase` for functions, variables, and hooks, and `kebab-case` only for non-code asset filenames.
- Prefer small, explicit modules under `src/` instead of growing `App.tsx` further when logic can be reused.

## Testing Guidelines
- No automated test runner is configured yet.
- Use `pnpm typecheck` and `pnpm lint` as the baseline checks before opening a change.
- For feature validation, rely on the manual cases in `VisionEdge_TestCases.md` and capture updated screenshots in `screenshots/` when UI changes.

## Commit & Pull Request Guidelines
- Git history uses short, lowercase, imperative commit subjects such as `init`, `ui`, and `docs`.
- Keep commits focused and descriptive; prefer one logical change per commit.
- Pull requests should include a brief summary, the commands run, and screenshots for UI work.
- Note any emulator/device used for verification, especially for changes under `src/screens/` or app navigation.

## Agent-Specific Instructions
- Do not edit generated folders such as `node_modules/`, `.expo/`, `ios/`, or `android/`.
- Preserve existing prototype assets and documentation unless the task explicitly requires updating them.
