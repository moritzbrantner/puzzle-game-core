import { describe, expect, test } from "bun:test";
import {
  applySudokuMove,
  beginnerSudoku,
  beginnerSudokuSolution,
  createInitialSudokuState,
  getConflictingCells,
  getSudokuStatus,
  restoreSudokuState,
  type SudokuState,
} from "../src/index";

describe("sudoku rules", () => {
  test("initial state is a copy of the givens", () => {
    const state = createInitialSudokuState(beginnerSudoku);

    expect(state.cells).toEqual(beginnerSudoku.givens);
    expect(state.cells).not.toBe(beginnerSudoku.givens);
    expect(getSudokuStatus(beginnerSudoku, state)).toBe("playing");
  });

  test("given cells cannot be edited", () => {
    const state = createInitialSudokuState(beginnerSudoku);
    const next = applySudokuMove(beginnerSudoku, state, {
      type: "set-cell",
      index: 0,
      value: 9,
    });

    expect(next).toBe(state);
  });

  test("editable cells accept moves", () => {
    const state = createInitialSudokuState(beginnerSudoku);
    const next = applySudokuMove(beginnerSudoku, state, {
      type: "set-cell",
      index: 2,
      value: 4,
    });

    expect(next.cells[2]).toBe(4);
    expect(state.cells[2]).toBeNull();
  });

  test("duplicates are reported as conflicts and make the state invalid", () => {
    const state = createInitialSudokuState(beginnerSudoku);
    const next = applySudokuMove(beginnerSudoku, state, {
      type: "set-cell",
      index: 2,
      value: 5,
    });

    expect(getSudokuStatus(beginnerSudoku, next)).toBe("invalid");
    expect([...getConflictingCells(next)].sort((a, b) => a - b)).toEqual([0, 2]);
  });

  test("a complete valid grid is solved", () => {
    const solved: SudokuState = { cells: [...beginnerSudokuSolution] };

    expect(getSudokuStatus(beginnerSudoku, solved)).toBe("solved");
  });

  test("persisted states must preserve givens", () => {
    const cells = [...beginnerSudoku.givens];
    cells[0] = 9;

    expect(restoreSudokuState(beginnerSudoku, cells)).toBeNull();
  });

  test("valid partial persisted states can be restored", () => {
    const cells = [...beginnerSudoku.givens];
    cells[2] = 4;

    expect(restoreSudokuState(beginnerSudoku, cells)?.cells).toEqual(cells);
  });
});
