import { describe, expect, test } from "bun:test";
import {
  applyMastermindMove,
  beginnerMastermind,
  createInitialMastermindState,
  createMastermindPuzzle,
  getMastermindStatus,
  isValidMastermindState,
  scoreMastermindGuess,
  type MastermindState,
} from "../src/index";

describe("Mastermind rules", () => {
  test("initial state contains no guesses and is playing", () => {
    const state = createInitialMastermindState(beginnerMastermind);

    expect(state.guesses).toEqual([]);
    expect(getMastermindStatus(beginnerMastermind, state)).toBe("playing");
  });

  test("scores exact and displaced colors without double-counting duplicates", () => {
    const puzzle = createMastermindPuzzle("duplicates", ["red", "red", "blue", "green"]);

    expect(scoreMastermindGuess(puzzle, ["red", "blue", "red", "red"])).toEqual({
      exact: 1,
      colorOnly: 2,
    });
  });

  test("the deterministic fixture produces authoritative feedback", () => {
    expect(scoreMastermindGuess(beginnerMastermind, ["red", "blue", "green", "yellow"])).toEqual({
      exact: 1,
      colorOnly: 3,
    });
  });

  test("accepted guesses append immutable domain feedback", () => {
    const state = createInitialMastermindState(beginnerMastermind);
    const next = applyMastermindMove(beginnerMastermind, state, {
      type: "submit-guess",
      code: ["red", "blue", "green", "yellow"],
    });

    expect(next).not.toBe(state);
    expect(state.guesses).toEqual([]);
    expect(next.guesses).toEqual([
      {
        code: ["red", "blue", "green", "yellow"],
        feedback: { exact: 1, colorOnly: 3 },
      },
    ]);
    expect(getMastermindStatus(beginnerMastermind, next)).toBe("playing");
  });

  test("invalid guesses preserve state identity", () => {
    const state = createInitialMastermindState(beginnerMastermind);

    expect(
      applyMastermindMove(beginnerMastermind, state, {
        type: "submit-guess",
        code: ["red", "blue"],
      }),
    ).toBe(state);

    expect(
      applyMastermindMove(beginnerMastermind, state, {
        type: "submit-guess",
        code: ["red", "blue", "green", "pink"] as never,
      }),
    ).toBe(state);
  });

  test("a correct guess solves the puzzle and makes the terminal state stable", () => {
    const state = createInitialMastermindState(beginnerMastermind);
    const solved = applyMastermindMove(beginnerMastermind, state, {
      type: "submit-guess",
      code: ["red", "yellow", "blue", "green"],
    });

    expect(solved.guesses.at(-1)?.feedback).toEqual({ exact: 4, colorOnly: 0 });
    expect(getMastermindStatus(beginnerMastermind, solved)).toBe("solved");
    expect(
      applyMastermindMove(beginnerMastermind, solved, {
        type: "submit-guess",
        code: ["blue", "blue", "blue", "blue"],
      }),
    ).toBe(solved);
  });

  test("tampered stored feedback fails closed as invalid state", () => {
    const tampered: MastermindState = {
      guesses: [
        {
          code: ["red", "blue", "green", "yellow"],
          feedback: { exact: 4, colorOnly: 0 },
        },
      ],
    };

    expect(isValidMastermindState(beginnerMastermind, tampered)).toBe(false);
    expect(getMastermindStatus(beginnerMastermind, tampered)).toBe("invalid");
  });

  test("stored history cannot continue after the solved guess", () => {
    const impossible: MastermindState = {
      guesses: [
        {
          code: ["red", "yellow", "blue", "green"],
          feedback: { exact: 4, colorOnly: 0 },
        },
        {
          code: ["blue", "blue", "blue", "blue"],
          feedback: { exact: 1, colorOnly: 0 },
        },
      ],
    };

    expect(isValidMastermindState(beginnerMastermind, impossible)).toBe(false);
    expect(getMastermindStatus(beginnerMastermind, impossible)).toBe("invalid");
  });

  test("the public puzzle contract does not expose the secret code", () => {
    expect("secret" in beginnerMastermind).toBe(false);
    expect(beginnerMastermind).toEqual({
      id: "classic-four",
      slots: 4,
      palette: ["red", "blue", "green", "yellow", "purple", "orange"],
    });
  });

  test("puzzle creation rejects unsupported secrets and duplicate palettes", () => {
    expect(() => createMastermindPuzzle("short", ["red"])).toThrow();
    expect(() => createMastermindPuzzle("palette", ["red", "blue"], ["red", "red"])).toThrow();
  });
});
