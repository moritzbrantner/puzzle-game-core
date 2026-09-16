import type { GameDefinition, GameStatus } from "@puzzle-game-core/game-core";

export type NonogramCell = "unknown" | "filled" | "crossed";

export type NonogramPuzzle = Readonly<{
  id: string;
  width: number;
  height: number;
  solution: readonly boolean[];
  rowClues: readonly (readonly number[])[];
  columnClues: readonly (readonly number[])[];
}>;

export type NonogramState = Readonly<{
  cells: readonly NonogramCell[];
}>;

export type NonogramMove = Readonly<{
  type: "set-cell";
  index: number;
  value: NonogramCell;
}>;

const CELL_VALUES = new Set<NonogramCell>(["unknown", "filled", "crossed"]);

function hasValidDimensions(width: number, height: number): boolean {
  return Number.isInteger(width) && width > 0 && Number.isInteger(height) && height > 0;
}

function deriveRuns(values: readonly boolean[]): readonly number[] {
  const runs: number[] = [];
  let current = 0;

  for (const value of values) {
    if (value) {
      current += 1;
      continue;
    }

    if (current > 0) {
      runs.push(current);
      current = 0;
    }
  }

  if (current > 0) {
    runs.push(current);
  }

  return Object.freeze(runs);
}

function deriveRowClues(
  width: number,
  height: number,
  solution: readonly boolean[],
): readonly (readonly number[])[] {
  return Object.freeze(
    Array.from({ length: height }, (_, row) =>
      deriveRuns(solution.slice(row * width, (row + 1) * width)),
    ),
  );
}

function deriveColumnClues(
  width: number,
  height: number,
  solution: readonly boolean[],
): readonly (readonly number[])[] {
  return Object.freeze(
    Array.from({ length: width }, (_, column) =>
      deriveRuns(Array.from({ length: height }, (_, row) => solution[row * width + column])),
    ),
  );
}

export function createNonogramPuzzle(
  id: string,
  width: number,
  height: number,
  solution: readonly boolean[],
): NonogramPuzzle {
  if (!hasValidDimensions(width, height)) {
    throw new Error("Nonogram dimensions must be positive integers.");
  }

  if (solution.length !== width * height || solution.some((cell) => typeof cell !== "boolean")) {
    throw new Error("Nonogram solution cells must be booleans matching the puzzle dimensions.");
  }

  const frozenSolution = Object.freeze([...solution]);

  return Object.freeze({
    id,
    width,
    height,
    solution: frozenSolution,
    rowClues: deriveRowClues(width, height, frozenSolution),
    columnClues: deriveColumnClues(width, height, frozenSolution),
  });
}

export function createInitialNonogramState(puzzle: NonogramPuzzle): NonogramState {
  return {
    cells: Array.from({ length: puzzle.width * puzzle.height }, () => "unknown" as const),
  };
}

export function isValidNonogramState(puzzle: NonogramPuzzle, state: NonogramState): boolean {
  return (
    state.cells.length === puzzle.width * puzzle.height &&
    state.cells.every((cell) => CELL_VALUES.has(cell))
  );
}

export function applyNonogramMove(
  puzzle: NonogramPuzzle,
  state: NonogramState,
  move: NonogramMove,
): NonogramState {
  if (
    move.type !== "set-cell" ||
    !isValidNonogramState(puzzle, state) ||
    !Number.isInteger(move.index) ||
    move.index < 0 ||
    move.index >= state.cells.length ||
    !CELL_VALUES.has(move.value) ||
    state.cells[move.index] === move.value
  ) {
    return state;
  }

  const cells = [...state.cells];
  cells[move.index] = move.value;
  return { cells };
}

export function getNonogramStatus(puzzle: NonogramPuzzle, state: NonogramState): GameStatus {
  if (!isValidNonogramState(puzzle, state)) {
    return "invalid";
  }

  const solved = puzzle.solution.every((solutionCell, index) =>
    solutionCell ? state.cells[index] === "filled" : state.cells[index] !== "filled",
  );

  return solved ? "solved" : "playing";
}

export const nonogramGame: GameDefinition<NonogramPuzzle, NonogramState, NonogramMove> = {
  id: "nonogram",
  createInitialState: createInitialNonogramState,
  applyMove: applyNonogramMove,
  getStatus: getNonogramStatus,
};

export const beginnerNonogram = createNonogramPuzzle(
  "rocket-five",
  5,
  5,
  [
    false, false, true, false, false,
    false, true, true, true, false,
    true, false, true, false, true,
    true, true, true, true, true,
    false, true, false, true, false,
  ],
);
