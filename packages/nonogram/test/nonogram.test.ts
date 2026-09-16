import { describe, expect, test } from "bun:test";
import {
  applyNonogramMove,
  beginnerNonogram,
  createInitialNonogramState,
  createNonogramPuzzle,
  getNonogramStatus,
  isValidNonogramState,
  nonogramGame,
  type NonogramState,
} from "../src/index";

describe("Nonogram rules", () => {
  test("derives deterministic row and column clues from the solution", () => {
    expect(beginnerNonogram.rowClues).toEqual([[1], [3], [1, 1, 1], [5], [1, 1]]);
    expect(beginnerNonogram.columnClues).toEqual([[2], [1, 2], [4], [1, 2], [2]]);
  });

  test("initial state contains only unknown cells", () => {
    const state = createInitialNonogramState(beginnerNonogram);

    expect(state.cells).toHaveLength(25);
    expect(state.cells.every((cell) => cell === "unknown")).toBe(true);
    expect(getNonogramStatus(beginnerNonogram, state)).toBe("playing");
  });

  test("accepted marks are immutable and repeated marks are no-ops", () => {
    const state = createInitialNonogramState(beginnerNonogram);
    const filled = applyNonogramMove(beginnerNonogram, state, {
      type: "set-cell",
      index: 2,
      value: "filled",
    });
    const repeated = applyNonogramMove(beginnerNonogram, filled, {
      type: "set-cell",
      index: 2,
      value: "filled",
    });

    expect(filled).not.toBe(state);
    expect(state.cells[2]).toBe("unknown");
    expect(filled.cells[2]).toBe("filled");
    expect(repeated).toBe(filled);
  });

  test("out-of-range moves preserve state identity", () => {
    const state = createInitialNonogramState(beginnerNonogram);

    expect(
      applyNonogramMove(beginnerNonogram, state, {
        type: "set-cell",
        index: -1,
        value: "filled",
      }),
    ).toBe(state);
    expect(
      applyNonogramMove(beginnerNonogram, state, {
        type: "set-cell",
        index: 25,
        value: "crossed",
      }),
    ).toBe(state);
  });

  test("wrong guesses remain playable rather than becoming structurally invalid", () => {
    const state = createInitialNonogramState(beginnerNonogram);
    const wrong = nonogramGame.applyMove(beginnerNonogram, state, {
      type: "set-cell",
      index: 0,
      value: "filled",
    });

    expect(isValidNonogramState(beginnerNonogram, wrong)).toBe(true);
    expect(getNonogramStatus(beginnerNonogram, wrong)).toBe("playing");
  });

  test("filling exactly the solution solves the puzzle without requiring crossed empties", () => {
    let state = createInitialNonogramState(beginnerNonogram);

    for (const [index, solutionCell] of beginnerNonogram.solution.entries()) {
      if (solutionCell) {
        state = applyNonogramMove(beginnerNonogram, state, {
          type: "set-cell",
          index,
          value: "filled",
        });
      }
    }

    expect(getNonogramStatus(beginnerNonogram, state)).toBe("solved");

    const unsolved = applyNonogramMove(beginnerNonogram, state, {
      type: "set-cell",
      index: 2,
      value: "crossed",
    });
    expect(getNonogramStatus(beginnerNonogram, unsolved)).toBe("playing");
  });

  test("malformed external state fails closed", () => {
    const wrongLength: NonogramState = { cells: ["unknown"] };
    const wrongValue = { cells: Array(25).fill("unknown") } as unknown as NonogramState;
    (wrongValue.cells as unknown as string[])[4] = "maybe";

    expect(getNonogramStatus(beginnerNonogram, wrongLength)).toBe("invalid");
    expect(getNonogramStatus(beginnerNonogram, wrongValue)).toBe("invalid");
  });

  test("puzzle construction rejects invalid dimensions and solution shape", () => {
    expect(() => createNonogramPuzzle("bad-width", 0, 5, [])).toThrow();
    expect(() => createNonogramPuzzle("bad-cells", 2, 2, [true, false, true])).toThrow();
  });

  test("empty clue lines are represented by an empty run list", () => {
    const puzzle = createNonogramPuzzle(
      "empty-row",
      3,
      2,
      [false, false, false, true, true, false],
    );

    expect(puzzle.rowClues).toEqual([[], [2]]);
    expect(puzzle.columnClues).toEqual([[1], [1], []]);
  });
});
