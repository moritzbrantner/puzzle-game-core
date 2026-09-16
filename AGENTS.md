# Agent guidance

## Scope

This repository is a reusable foundation for small deterministic logic games and the applications that host them.

## Architecture rules

- Keep puzzle rules headless and deterministic. React must not be required to test a game.
- Keep `packages/game-core` deliberately small. Add an abstraction only after more than one game demonstrates the same need.
- `GameDefinition.applyMove` returns the input state object unchanged for rejected or no-op moves; generic session code may rely on that identity without duplicating legality rules.
- `packages/game-session` owns only the session behavior now proven by multiple games: bounded undo history, accepted-move depth, start, and restart. It must not learn puzzle-specific legality, persistence formats, rendering, input, solving, or generation.
- Individual game packages own their domain model, legal moves, validation, fixtures, and game-specific algorithms.
- External/restored state must be validated by the owning game package before it is adopted by a fresh game session.
- Platform concerns such as browser persistence, navigation, input adaptation, animation, and rendering stay in application/UI layers until there is evidence they should be shared.
- Prefer a simple TypeScript implementation first. Rust/WASM is an optional optimization boundary for expensive generation, solving, or batch work, not a mandatory runtime dependency.
- Preserve offline play. A backend must never be required for the core puzzle loop.
- Keep deterministic fixtures and seeds reproducible so bugs can be replayed.

## Current scope

The web gallery currently proves Sudoku, Lights Out, and Tower of Hanoi against the shared headless contracts. Do not add Expo, Tauri, accounts, a backend, a generalized solver/generator framework, achievements, or cross-platform rendering abstractions without a concrete later slice that needs them.
