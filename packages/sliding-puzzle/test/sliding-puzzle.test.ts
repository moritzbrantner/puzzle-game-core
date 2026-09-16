import { describe, expect, test } from "bun:test";
import {
  applySlidingPuzzleMove,
  beginnerFifteenPuzzle,
  beginnerFifteenPuzzleSolution,
  createInitialSlidingPuzzleState,
  createSlidingPuzzle,
  getMovableSlidingPuzzleTiles,
  getSlidingPuzzleStatus,
  isSolvableSlidingPuzzleLayout,
  isValidSlidingPuzzleState,
  slidingPuzzleGame,
  type SlidingPuzzleState,
} from "../src/index";

describe("sliding-puzzle rules", () => {
  test("initial state copies the deterministic fixture", () => {
    const state = createInitialSlidingPuzzleState(beginnerFifteenPuzzle);

    expect(state.tiles).toEqual(beginnerFifteenPuzzle.initialTiles);
    expect(state.tiles).not.toBe(beginnerFifteenPuzzle.initialTiles);
    expect(getSlidingPuzzleStatus(beginnerFifteenPuzzle, state)).toBe("playing");
  });

  test("only orthogonally adjacent numbered tiles are movable", () => {
    const state = createInitialSlidingPuzzleState(beginnerFifteenPuzzle);

    expect(getMovableSlidingPuzzleTiles(beginnerFifteenPuzzle, state)).toEqual([3, 4, 11]);
  });

  test("an adjacent tile slides into the blank without mutating the previous state", () => {
    const state = createInitialSlidingPuzzleState(beginnerFifteenPuzzle);
    const next = applySlidingPuzzleMove(beginnerFifteenPuzzle, state, { type: "slide", tile: 4 });

    expect(next.tiles).toEqual([
      1, 6, 2, 3,
      5, 15, null, 4,
      9, 10, 12, 11,
      13, 14, 8, 7,
    ]);
    expect(state.tiles).toEqual(beginnerFifteenPuzzle.initialTiles);
  });

  test("non-adjacent or unknown tiles preserve state identity", () => {
    const state = createInitialSlidingPuzzleState(beginnerFifteenPuzzle);

    expect(applySlidingPuzzleMove(beginnerFifteenPuzzle, state, { type: "slide", tile: 1 })).toBe(state);
    expect(applySlidingPuzzleMove(beginnerFifteenPuzzle, state, { type: "slide", tile: 16 })).toBe(state);
  });

  test("the deterministic fixture is solved by its recorded reverse scramble", () => {
    let state = createInitialSlidingPuzzleState(beginnerFifteenPuzzle);

    for (const tile of beginnerFifteenPuzzleSolution) {
      state = slidingPuzzleGame.applyMove(beginnerFifteenPuzzle, state, { type: "slide", tile });
    }

    expect(state.tiles).toEqual(beginnerFifteenPuzzle.goalTiles);
    expect(getSlidingPuzzleStatus(beginnerFifteenPuzzle, state)).toBe("solved");
  });

  test("parity rejects structurally complete but unreachable layouts", () => {
    const unsolvable = [
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 15, 14, null,
    ];

    expect(isSolvableSlidingPuzzleLayout(4, 4, unsolvable)).toBe(false);
    expect(() => createSlidingPuzzle("unsolvable", 4, 4, unsolvable)).toThrow("must be solvable");

    const state: SlidingPuzzleState = { tiles: unsolvable };
    expect(isValidSlidingPuzzleState(beginnerFifteenPuzzle, state)).toBe(false);
    expect(getSlidingPuzzleStatus(beginnerFifteenPuzzle, state)).toBe("invalid");
  });

  test("odd-width parity accepts the canonical goal and rejects a single swap", () => {
    const solved = [1, 2, 3, 4, 5, 6, 7, 8, null];
    const swapped = [1, 2, 3, 4, 5, 6, 8, 7, null];

    expect(isSolvableSlidingPuzzleLayout(3, 3, solved)).toBe(true);
    expect(isSolvableSlidingPuzzleLayout(3, 3, swapped)).toBe(false);
  });

  test("duplicate, missing, or extra blanks fail closed", () => {
    expect(isSolvableSlidingPuzzleLayout(2, 2, [1, 1, 2, null])).toBe(false);
    expect(isSolvableSlidingPuzzleLayout(2, 2, [1, 2, 3, 4])).toBe(false);
    expect(isSolvableSlidingPuzzleLayout(2, 2, [1, 2, null, null])).toBe(false);
  });
});
