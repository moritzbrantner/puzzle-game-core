import { describe, expect, test } from "bun:test";
import {
  applySokobanMove,
  beginnerSokoban,
  createInitialSokobanState,
  createSokobanPuzzle,
  getSokobanStatus,
  isValidSokobanState,
  type SokobanDirection,
  type SokobanState,
} from "../src/index";

describe("Sokoban rules", () => {
  test("starts from a valid deterministic fixture", () => {
    const state = createInitialSokobanState(beginnerSokoban);

    expect(isValidSokobanState(beginnerSokoban, state)).toBe(true);
    expect(getSokobanStatus(beginnerSokoban, state)).toBe("playing");
    expect(state.crates).toHaveLength(2);
  });

  test("walking into open floor changes only the player position", () => {
    const state = createInitialSokobanState(beginnerSokoban);
    const next = applySokobanMove(beginnerSokoban, state, { type: "move", direction: "left" });

    expect(next.player).not.toBe(state.player);
    expect(next.crates).toBe(state.crates);
  });

  test("wall collisions preserve state identity", () => {
    let state = createInitialSokobanState(beginnerSokoban);

    state = applySokobanMove(beginnerSokoban, state, { type: "move", direction: "down" });
    const blocked = applySokobanMove(beginnerSokoban, state, { type: "move", direction: "down" });

    expect(blocked).toBe(state);
  });

  test("a crate push moves player and crate atomically", () => {
    let state = createInitialSokobanState(beginnerSokoban);
    state = applySokobanMove(beginnerSokoban, state, { type: "move", direction: "left" });
    state = applySokobanMove(beginnerSokoban, state, { type: "move", direction: "up" });

    const pushed = applySokobanMove(beginnerSokoban, state, { type: "move", direction: "right" });

    expect(pushed.player).toBe(24);
    expect(pushed.crates).toContain(25);
    expect(pushed.crates).not.toContain(24);
  });

  test("the fixture has a short reproducible solution", () => {
    const solution: readonly SokobanDirection[] = ["left", "up", "right", "right", "up", "left"];
    let state = createInitialSokobanState(beginnerSokoban);

    for (const direction of solution) {
      state = applySokobanMove(beginnerSokoban, state, { type: "move", direction });
    }

    expect(getSokobanStatus(beginnerSokoban, state)).toBe("solved");
    expect([...state.crates].sort((a, b) => a - b)).toEqual([...beginnerSokoban.goals].sort((a, b) => a - b));
  });

  test("restored state fails closed when a crate overlaps a wall", () => {
    const malformed: SokobanState = {
      player: beginnerSokoban.initialPlayer,
      crates: [0, beginnerSokoban.initialCrates[1]],
    };

    expect(isValidSokobanState(beginnerSokoban, malformed)).toBe(false);
    expect(getSokobanStatus(beginnerSokoban, malformed)).toBe("invalid");
  });

  test("puzzle creation rejects mismatched crates and goals", () => {
    expect(() =>
      createSokobanPuzzle({
        id: "bad",
        width: 3,
        height: 3,
        walls: [],
        goals: [1],
        initialCrates: [],
        initialPlayer: 4,
      }),
    ).toThrow();
  });
});
