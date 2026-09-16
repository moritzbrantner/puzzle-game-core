# puzzle-game-core

Reusable foundations and implementations for small deterministic logic games.

The repository grows vertically: each game keeps its rules in a headless package and gets a playable web slice before shared abstractions are expanded. Common code is added only after multiple games demonstrate the same need.

## Playable games

- `packages/sudoku`: Sudoku puzzle/state/move rules, validation, fixtures, and browser persistence in the web shell
- `packages/lights-out`: deterministic Lights Out rules plus a reproducible 5×5 fixture with a known solution
- `packages/tower-of-hanoi`: legal Tower of Hanoi moves, state validation, and minimum-move calculation
- `packages/sliding-puzzle`: canonical-goal sliding-puzzle rules, permutation validation, parity-based reachability, legal adjacent slides, and a reproducible 4×4 Fifteen Puzzle fixture
- `packages/nonogram`: clue derivation, tri-state player marks, structural validation, and deterministic completion semantics over a reproducible 5×5 picture fixture
- `packages/mastermind`: hidden-code ownership, duplicate-aware exact/color-only feedback, validated guess history, and deterministic solved-state semantics
- `apps/web`: a small gallery hosting all six games with focused browser interactions

## Shared foundations

- `packages/game-core`: the intentionally minimal generic game contract shared by the domain packages
- `packages/game-session`: bounded undo history, accepted-move counting, start, and restart semantics shared after multiple playable games demonstrated the same need

## Architecture

Puzzle rules are deterministic and testable without React. Game packages remain authoritative for legal moves, validation, and status. `game-session` only records accepted state transitions; rejected/no-op moves preserve state identity. Browser persistence validates through the owning game package before restored state enters a fresh session. Rendering, browser input, navigation, persistence transport, and other platform concerns remain in the web app.

The Fifteen Puzzle keeps permutation and parity/reachability checks inside `sliding-puzzle`; the React UI consumes only domain state and the domain-owned movable-tile query. Nonogram keeps clue derivation and completion truth inside `nonogram`; incorrect but structurally valid guesses remain ordinary playable state rather than being mislabeled as invalid data. Mastermind keeps its code out of the public puzzle object, owns duplicate-aware scoring and stored-feedback validation, and exposes only the feedback needed by the web UI. Because the game is fully offline/client-side, that encapsulation is an architectural boundary rather than a security guarantee against a user inspecting the shipped JavaScript.

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
