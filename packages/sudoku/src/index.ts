import type { GameDefinition, GameStatus } from "@puzzle-game-core/game-core";

export type SudokuDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SudokuCell = SudokuDigit | null;
export type SudokuGrid = readonly SudokuCell[];

export type SudokuPuzzle = Readonly<{
  id: string;
  givens: SudokuGrid;
}>;

export type SudokuState = Readonly<{
  cells: SudokuGrid;
}>;

export type SudokuMove = Readonly<{
  type: "set-cell";
  index: number;
  value: SudokuCell;
}>;

const SIDE = 9;
const CELL_COUNT = SIDE * SIDE;
const BOX_SIDE = 3;

export function isSudokuDigit(value: unknown): value is SudokuDigit {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 9;
}

function assertGridShape(cells: readonly unknown[]): void {
  if (cells.length !== CELL_COUNT) {
    throw new Error(`Sudoku grids must contain ${CELL_COUNT} cells.`);
  }

  for (const cell of cells) {
    if (cell !== null && !isSudokuDigit(cell)) {
      throw new Error("Sudoku cells must be null or digits from 1 through 9.");
    }
  }
}

function unitHasDuplicates(cells: SudokuGrid, indices: readonly number[]): boolean {
  const seen = new Set<SudokuDigit>();

  for (const index of indices) {
    const value = cells[index];
    if (value === null) {
      continue;
    }
    if (seen.has(value)) {
      return true;
    }
    seen.add(value);
  }

  return false;
}

function rowIndices(row: number): number[] {
  return Array.from({ length: SIDE }, (_, column) => row * SIDE + column);
}

function columnIndices(column: number): number[] {
  return Array.from({ length: SIDE }, (_, row) => row * SIDE + column);
}

function boxIndices(boxRow: number, boxColumn: number): number[] {
  const result: number[] = [];

  for (let rowOffset = 0; rowOffset < BOX_SIDE; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < BOX_SIDE; columnOffset += 1) {
      const row = boxRow * BOX_SIDE + rowOffset;
      const column = boxColumn * BOX_SIDE + columnOffset;
      result.push(row * SIDE + column);
    }
  }

  return result;
}

function allUnits(): number[][] {
  const units: number[][] = [];

  for (let index = 0; index < SIDE; index += 1) {
    units.push(rowIndices(index));
    units.push(columnIndices(index));
  }

  for (let boxRow = 0; boxRow < BOX_SIDE; boxRow += 1) {
    for (let boxColumn = 0; boxColumn < BOX_SIDE; boxColumn += 1) {
      units.push(boxIndices(boxRow, boxColumn));
    }
  }

  return units;
}

const UNITS = allUnits();

export function isValidSudokuGrid(cells: SudokuGrid): boolean {
  if (cells.length !== CELL_COUNT) {
    return false;
  }

  if (cells.some((cell) => cell !== null && !isSudokuDigit(cell))) {
    return false;
  }

  return UNITS.every((indices) => !unitHasDuplicates(cells, indices));
}

export function createSudokuPuzzle(id: string, givens: SudokuGrid): SudokuPuzzle {
  assertGridShape(givens);
  if (!isValidSudokuGrid(givens)) {
    throw new Error("Sudoku givens must not contain row, column, or box conflicts.");
  }

  return Object.freeze({
    id,
    givens: Object.freeze([...givens]),
  });
}

export function isGivenCell(puzzle: SudokuPuzzle, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < CELL_COUNT && puzzle.givens[index] !== null;
}

export function createInitialSudokuState(puzzle: SudokuPuzzle): SudokuState {
  return { cells: [...puzzle.givens] };
}

export function applySudokuMove(
  puzzle: SudokuPuzzle,
  state: SudokuState,
  move: SudokuMove,
): SudokuState {
  if (move.type !== "set-cell") {
    return state;
  }

  if (!Number.isInteger(move.index) || move.index < 0 || move.index >= CELL_COUNT) {
    return state;
  }

  if (move.value !== null && !isSudokuDigit(move.value)) {
    return state;
  }

  if (isGivenCell(puzzle, move.index) || state.cells[move.index] === move.value) {
    return state;
  }

  const cells = [...state.cells];
  cells[move.index] = move.value;
  return { cells };
}

function givensArePreserved(puzzle: SudokuPuzzle, state: SudokuState): boolean {
  if (state.cells.length !== CELL_COUNT) {
    return false;
  }

  return puzzle.givens.every((given, index) => given === null || state.cells[index] === given);
}

export function getSudokuStatus(puzzle: SudokuPuzzle, state: SudokuState): GameStatus {
  if (!givensArePreserved(puzzle, state) || !isValidSudokuGrid(state.cells)) {
    return "invalid";
  }

  return state.cells.every((cell) => cell !== null) ? "solved" : "playing";
}

export function getConflictingCells(state: SudokuState): ReadonlySet<number> {
  const conflicts = new Set<number>();

  for (const unit of UNITS) {
    const indicesByDigit = new Map<SudokuDigit, number[]>();

    for (const index of unit) {
      const value = state.cells[index];
      if (value === null || !isSudokuDigit(value)) {
        continue;
      }
      const indices = indicesByDigit.get(value) ?? [];
      indices.push(index);
      indicesByDigit.set(value, indices);
    }

    for (const indices of indicesByDigit.values()) {
      if (indices.length > 1) {
        indices.forEach((index) => conflicts.add(index));
      }
    }
  }

  return conflicts;
}

export function restoreSudokuState(
  puzzle: SudokuPuzzle,
  persistedCells: unknown,
): SudokuState | null {
  if (!Array.isArray(persistedCells) || persistedCells.length !== CELL_COUNT) {
    return null;
  }

  if (persistedCells.some((cell) => cell !== null && !isSudokuDigit(cell))) {
    return null;
  }

  const cells = [...persistedCells] as SudokuCell[];
  if (!puzzle.givens.every((given, index) => given === null || cells[index] === given)) {
    return null;
  }

  return { cells };
}

export const sudokuGame: GameDefinition<SudokuPuzzle, SudokuState, SudokuMove> = {
  id: "sudoku",
  createInitialState: createInitialSudokuState,
  applyMove: applySudokuMove,
  getStatus: getSudokuStatus,
};

const fixtureGivens: SudokuGrid = [
  5, 3, null, null, 7, null, null, null, null,
  6, null, null, 1, 9, 5, null, null, null,
  null, 9, 8, null, null, null, null, 6, null,
  8, null, null, null, 6, null, null, null, 3,
  4, null, null, 8, null, 3, null, null, 1,
  7, null, null, null, 2, null, null, null, 6,
  null, 6, null, null, null, null, 2, 8, null,
  null, null, null, 4, 1, 9, null, null, 5,
  null, null, null, null, 8, null, null, 7, 9,
];

export const beginnerSudoku = createSudokuPuzzle("classic-easy-1", fixtureGivens);

export const beginnerSudokuSolution: SudokuGrid = [
  5, 3, 4, 6, 7, 8, 9, 1, 2,
  6, 7, 2, 1, 9, 5, 3, 4, 8,
  1, 9, 8, 3, 4, 2, 5, 6, 7,
  8, 5, 9, 7, 6, 1, 4, 2, 3,
  4, 2, 6, 8, 5, 3, 7, 9, 1,
  7, 1, 3, 9, 2, 4, 8, 5, 6,
  9, 6, 1, 5, 3, 7, 2, 8, 4,
  2, 8, 7, 4, 1, 9, 6, 3, 5,
  3, 4, 5, 2, 8, 6, 1, 7, 9,
];
