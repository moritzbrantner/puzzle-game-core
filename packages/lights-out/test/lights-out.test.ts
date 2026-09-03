import { describe, expect, test } from "bun:test";
import {
  applyLightsOutMove,
  beginnerLightsOut,
  beginnerLightsOutSolution,
  createInitialLightsOutState,
  createLightsOutPuzzle,
  getLightsOutStatus,
  lightsOutGame,
} from "../src/index";

describe("Lights Out rules", () => {
  test("initial state copies the fixture", () => {
    const state = createInitialLightsOutState(beginnerLightsOut);

    expect(state.cells).toEqual(beginnerLightsOut.initialCells);
    expect(state.cells).not.toBe(beginnerLightsOut.initialCells);
    expect(getLightsOutStatus(beginnerLightsOut, state)).toBe("playing");
  });

  test("a center press toggles the cell and its four neighbors", () => {
    const puzzle = createLightsOutPuzzle("blank", 3, 3, Array(9).fill(false));
    const state = createInitialLightsOutState(puzzle);
    const next = applyLightsOutMove(puzzle, state, { type: "toggle", index: 4 });

    expect(next.cells).toEqual([
      false, true, false,
      true, true, true,
      false, true, false,
    ]);
  });

  test("a corner press only toggles three cells", () => {
    const puzzle = createLightsOutPuzzle("blank", 3, 3, Array(9).fill(false));
    const state = createInitialLightsOutState(puzzle);
    const next = applyLightsOutMove(puzzle, state, { type: "toggle", index: 0 });

    expect(next.cells).toEqual([
      true, true, false,
      true, false, false,
      false, false, false,
    ]);
  });

  test("pressing the same cell twice restores the previous board", () => {
    const state = createInitialLightsOutState(beginnerLightsOut);
    const once = lightsOutGame.applyMove(beginnerLightsOut, state, { type: "toggle", index: 12 });
    const twice = lightsOutGame.applyMove(beginnerLightsOut, once, { type: "toggle", index: 12 });

    expect(twice.cells).toEqual(state.cells);
  });

  test("the deterministic beginner fixture has a known solution", () => {
    let state = createInitialLightsOutState(beginnerLightsOut);

    for (const index of beginnerLightsOutSolution) {
      state = applyLightsOutMove(beginnerLightsOut, state, { type: "toggle", index });
    }

    expect(getLightsOutStatus(beginnerLightsOut, state)).toBe("solved");
  });

  test("out-of-range moves do nothing", () => {
    const state = createInitialLightsOutState(beginnerLightsOut);

    expect(applyLightsOutMove(beginnerLightsOut, state, { type: "toggle", index: -1 })).toBe(state);
    expect(applyLightsOutMove(beginnerLightsOut, state, { type: "toggle", index: 25 })).toBe(state);
  });
});
