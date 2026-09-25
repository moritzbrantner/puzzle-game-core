# Agent guidance

## Scope

This repository is a reusable foundation for small deterministic logic games and the applications that host them.

## Architecture rules

- Keep puzzle rules headless and deterministic. React must not be required to test a game.
- Keep `packages/game-core` deliberately small. Add an abstraction only after more than one game demonstrates the same need.
- `GameDefinition.applyMove` returns the input state object unchanged for rejected or no-op moves; generic session code may rely on that identity without duplicating legality rules.
- `packages/game-session` owns only the session behavior now proven by multiple games: bounded undo history, accepted-move depth, start, and restart. It must not learn puzzle-specific legality, persistence formats, rendering, input, solving, or generation.
- Individual game packages own their domain model, legal moves, validation, fixtures, and game-specific algorithms.
- Sliding-puzzle permutation integrity, solvability parity, adjacency, and movable-tile queries belong in `packages/sliding-puzzle`, not in React.
- Nonogram clue derivation, mark validation, and completion truth belong in `packages/nonogram`; incorrect guesses are valid player state and must not be treated as malformed state.
- Mastermind secret ownership, duplicate-aware feedback, guess-history validation, and solved-state truth belong in `packages/mastermind`; React may render domain feedback but must not read or reproduce the secret/scoring rules. Client-side concealment is not a security boundary.
- External/restored state must be validated by the owning game package before it is adopted by a fresh game session.
- Platform concerns such as browser persistence, navigation, input adaptation, animation, and rendering stay in application/UI layers until there is evidence they should be shared.
- React integration for generic session actions belongs in the web application (currently `apps/web/hooks/useGameSession.ts`), never in `packages/game-session`. A component may call the pure session functions directly when it needs transition identity to coordinate UI state.
- Keep the dependency direction one-way: `game-core` is the minimal base, domain game packages and `game-session` depend on it, domain games do not depend on `game-session`, and platform apps consume those headless packages.
- Prefer a simple TypeScript implementation first. Rust/WASM is an optional optimization boundary for expensive generation, solving, or batch work, not a mandatory runtime dependency.
- Preserve offline play. A backend must never be required for the core puzzle loop.
- Keep deterministic fixtures and seeds reproducible so bugs can be replayed.

## Current scope

The web gallery currently proves Sudoku, Lights Out, Tower of Hanoi, the Fifteen Puzzle, Nonogram, and Mastermind against the shared headless contracts. Do not add Expo, Tauri, accounts, a backend, a generalized solver/generator framework, achievements, or cross-platform rendering abstractions without a concrete later slice that needs them.
