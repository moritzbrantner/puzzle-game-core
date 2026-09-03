import { describe, expect, test } from "bun:test";
import {
  applyHanoiMove,
  beginnerHanoi,
  createInitialHanoiState,
  getHanoiStatus,
  getMinimumHanoiMoveCount,
  isValidHanoiState,
  towerOfHanoiGame,
  type HanoiState,
} from "../src/index";

describe("Tower of Hanoi rules", () => {
  test("initial state puts every disk on the first peg", () => {
    const state = createInitialHanoiState(beginnerHanoi);

    expect(state.pegs).toEqual([[3, 2, 1], [], []]);
    expect(getHanoiStatus(beginnerHanoi, state)).toBe("playing");
  });

  test("a top disk can move to an empty peg", () => {
    const state = createInitialHanoiState(beginnerHanoi);
    const next = applyHanoiMove(beginnerHanoi, state, { type: "move", from: 0, to: 2 });

    expect(next.pegs).toEqual([[3, 2], [], [1]]);
    expect(state.pegs).toEqual([[3, 2, 1], [], []]);
  });

  test("a larger disk cannot be placed on a smaller disk", () => {
    const state = createInitialHanoiState(beginnerHanoi);
    const first = applyHanoiMove(beginnerHanoi, state, { type: "move", from: 0, to: 2 });
    const illegal = applyHanoiMove(beginnerHanoi, first, { type: "move", from: 0, to: 2 });

    expect(illegal).toBe(first);
  });

  test("the classic seven-move solution solves three disks", () => {
    let state = createInitialHanoiState(beginnerHanoi);
    const solution = [
      [0, 2],
      [0, 1],
      [2, 1],
      [0, 2],
      [1, 0],
      [1, 2],
      [0, 2],
    ] as const;

    for (const [from, to] of solution) {
      state = towerOfHanoiGame.applyMove(beginnerHanoi, state, { type: "move", from, to });
    }

    expect(getHanoiStatus(beginnerHanoi, state)).toBe("solved");
    expect(getMinimumHanoiMoveCount(beginnerHanoi)).toBe(solution.length);
  });

  test("duplicate or misordered disks make a state invalid", () => {
    const duplicate: HanoiState = { pegs: [[3, 2], [1], [1]] };
    const misordered: HanoiState = { pegs: [[2, 3, 1], [], []] };

    expect(isValidHanoiState(beginnerHanoi, duplicate)).toBe(false);
    expect(isValidHanoiState(beginnerHanoi, misordered)).toBe(false);
    expect(getHanoiStatus(beginnerHanoi, duplicate)).toBe("invalid");
  });
});
