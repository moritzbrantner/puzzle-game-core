import type { GameDefinition, GameStatus } from "@puzzle-game-core/game-core";

export type LightsOutPuzzle = Readonly<{
  id: string;
  width: number;
  height: number;
  initialCells: readonly boolean[];
}>;

export type LightsOutState = Readonly<{
  cells: readonly boolean[];
}>;

export type LightsOutMove = Readonly<{
  type: "toggle";
  index: number;
}>;

function assertDimensions(width: number, height: number): void {
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new Error("Lights Out dimensions must be positive integers.");
  }
}

function affectedIndices(width: number, height: number, index: number): number[] {
  const cellCount = width * height;
  if (!Number.isInteger(index) || index < 0 || index >= cellCount) {
    return [];
  }

  const row = Math.floor(index / width);
  const column = index % width;
  const indices = [index];

  if (row > 0) indices.push(index - width);
  if (row + 1 < height) indices.push(index + width);
  if (column > 0) indices.push(index - 1);
  if (column + 1 < width) indices.push(index + 1);

  return indices;
}

function toggleCells(cells: readonly boolean[], indices: readonly number[]): boolean[] {
  const next = [...cells];
  for (const index of indices) {
    next[index] = !next[index];
  }
  return next;
}

export function createLightsOutPuzzle(
  id: string,
  width: number,
  height: number,
  initialCells: readonly boolean[],
): LightsOutPuzzle {
  assertDimensions(width, height);
  if (initialCells.length !== width * height || initialCells.some((cell) => typeof cell !== "boolean")) {
    throw new Error("Lights Out cells must be booleans matching the puzzle dimensions.");
  }

  return Object.freeze({
    id,
    width,
    height,
    initialCells: Object.freeze([...initialCells]),
  });
}

export function createInitialLightsOutState(puzzle: LightsOutPuzzle): LightsOutState {
  return { cells: [...puzzle.initialCells] };
}

export function applyLightsOutMove(
  puzzle: LightsOutPuzzle,
  state: LightsOutState,
  move: LightsOutMove,
): LightsOutState {
  if (move.type !== "toggle" || state.cells.length !== puzzle.width * puzzle.height) {
    return state;
  }

  const indices = affectedIndices(puzzle.width, puzzle.height, move.index);
  if (indices.length === 0) {
    return state;
  }

  return { cells: toggleCells(state.cells, indices) };
}

export function getLightsOutStatus(puzzle: LightsOutPuzzle, state: LightsOutState): GameStatus {
  if (
    state.cells.length !== puzzle.width * puzzle.height ||
    state.cells.some((cell) => typeof cell !== "boolean")
  ) {
    return "invalid";
  }

  return state.cells.every((cell) => !cell) ? "solved" : "playing";
}

export const lightsOutGame: GameDefinition<LightsOutPuzzle, LightsOutState, LightsOutMove> = {
  id: "lights-out",
  createInitialState: createInitialLightsOutState,
  applyMove: applyLightsOutMove,
  getStatus: getLightsOutStatus,
};

const BEGINNER_SOLUTION = [0, 6, 12, 18, 24] as const;

function fixtureFromPresses(width: number, height: number, presses: readonly number[]): boolean[] {
  let cells = Array.from({ length: width * height }, () => false);
  for (const index of presses) {
    cells = toggleCells(cells, affectedIndices(width, height, index));
  }
  return cells;
}

export const beginnerLightsOut = createLightsOutPuzzle(
  "diagonal-five",
  5,
  5,
  fixtureFromPresses(5, 5, BEGINNER_SOLUTION),
);

export const beginnerLightsOutSolution: readonly number[] = BEGINNER_SOLUTION;
