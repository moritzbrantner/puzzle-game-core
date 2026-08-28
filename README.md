# puzzle-game-core

Reusable foundations and implementations for small deterministic logic games.

The repository starts vertically: a tiny headless game contract, one Sudoku domain package, and a playable Next.js web application. More abstractions should only be added after another game proves they are shared.

## A0

- `packages/game-core`: minimal generic game contract
- `packages/sudoku`: Sudoku puzzle/state/move rules and fixtures
- `apps/web`: playable Sudoku UI with keyboard/touch input, undo, restart, conflict highlighting, completion detection, and local persistence

## Development

Requires Bun 1.4+.

```bash
bun install
bun run dev
```

Checks:

```bash
bun test
bun run typecheck
bun run build
```

A0 intentionally has no backend, Rust/WASM layer, Expo app, Tauri shell, or generalized solver framework. Those boundaries should be introduced only when a later vertical slice needs them.
