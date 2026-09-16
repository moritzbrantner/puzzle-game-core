# puzzle-game-core

Reusable foundations and implementations for small deterministic logic games.

The repository grows vertically: each game keeps its rules in a headless package and gets a playable web slice before shared abstractions are expanded. Common code is added only after multiple games demonstrate the same need.

## Playable games

- `packages/sudoku`: Sudoku puzzle/state/move rules, validation, fixtures, and browser persistence in the web shell
- `packages/lights-out`: deterministic Lights Out rules plus a reproducible 5×5 fixture with a known solution
- `packages/tower-of-hanoi`: legal Tower of Hanoi moves, state validation, and minimum-move calculation
- `apps/web`: a small gallery hosting all three games with focused browser interactions

## Shared foundations

- `packages/game-core`: the intentionally minimal generic game contract shared by the domain packages
- `packages/game-session`: bounded undo history, accepted-move counting, start, and restart semantics shared after all three playable games demonstrated the same need

## Architecture

Puzzle rules are deterministic and testable without React. Game packages remain authoritative for legal moves and status. `game-session` only records accepted state transitions; rejected/no-op moves preserve state identity. Browser persistence validates through the owning game package before restored state enters a fresh session. Rendering, browser input, navigation, persistence transport, and other platform concerns remain in the web app.

There is still no backend, Rust/WASM layer, Expo app, Tauri shell, generalized solver/generator framework, account system, or achievement layer.

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
