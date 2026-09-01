# Agent guidance

## Scope

This repository is a reusable foundation for small deterministic logic games and the applications that host them.

## Architecture rules

- Keep puzzle rules headless and deterministic. React must not be required to test a game.
- Keep `packages/game-core` deliberately small. Add an abstraction only after more than one game demonstrates the same need.
- Individual game packages own their domain model, legal moves, validation, fixtures, and game-specific algorithms.
- Platform concerns such as browser persistence, navigation, input adaptation, animation, and rendering stay in application/UI layers until there is evidence they should be shared.
- Prefer a simple TypeScript implementation first. Rust/WASM is an optional optimization boundary for expensive generation, solving, or batch work, not a mandatory runtime dependency.
- Preserve offline play. A backend must never be required for the core puzzle loop.
- Keep deterministic fixtures and seeds reproducible so bugs can be replayed.

## A0 constraint

A0 is a playable Sudoku vertical slice. Do not add Expo, Tauri, accounts, a backend, a generalized solver framework, achievements, or cross-platform rendering abstractions yet.
