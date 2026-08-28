export type GameStatus = "playing" | "solved" | "invalid";

/**
 * The intentionally small common seam shared by puzzle implementations.
 *
 * Persistence, undo history, rendering, solving, generation and hints are not
 * part of this contract until multiple games prove that they need the same
 * abstraction.
 */
export type GameDefinition<Puzzle, State, Move> = Readonly<{
  id: string;
  createInitialState: (puzzle: Puzzle) => State;
  applyMove: (puzzle: Puzzle, state: State, move: Move) => State;
  getStatus: (puzzle: Puzzle, state: State) => GameStatus;
}>;
