import { describe, expect, test } from "bun:test";
import {
  advancedLightsOut,
  applyLightsOutMove,
  createInitialLightsOutState,
  getLightsOutStatus,
  intermediateLightsOut,
  lightsOutGame,
  lightsOutLevels,
} from "../packages/lights-out/src/index";
import {
  advancedMastermind,
  applyMastermindMove,
  createInitialMastermindState,
  getMastermindStatus,
  intermediateMastermind,
  mastermindGame,
  mastermindLevels,
} from "../packages/mastermind/src/index";
import {
  nonogramGame,
  nonogramLevels,
} from "../packages/nonogram/src/index";
import {
  applyPegSolitaireMove,
  createInitialPegSolitaireState,
  getPegSolitaireStatus,
  intermediatePegSolitaire,
  pegSolitaireGame,
  pegSolitaireLevels,
  trainingPegSolitaire,
} from "../packages/peg-solitaire/src/index";
import {
  applySlidingPuzzleMove,
  createInitialSlidingPuzzleState,
  easyFifteenPuzzle,
  easyFifteenPuzzleSolution,
  fifteenPuzzleLevels,
  getSlidingPuzzleStatus,
  intermediateFifteenPuzzle,
  intermediateFifteenPuzzleSolution,
  slidingPuzzleGame,
} from "../packages/sliding-puzzle/src/index";
import {
  advancedSokoban,
  applySokobanMove,
  createInitialSokobanState,
  getSokobanStatus,
  intermediateSokoban,
  sokobanGame,
  sokobanLevels,
  type SokobanDirection,
} from "../packages/sokoban/src/index";
import {
  sudokuGame,
  sudokuLevels,
} from "../packages/sudoku/src/index";
import {
  hanoiLevels,
  towerOfHanoiGame,
} from "../packages/tower-of-hanoi/src/index";

function expectThreeUniqueLevels(levels: readonly Readonly<{ id: string }>[]): void {
  expect(levels).toHaveLength(3);
  expect(new Set(levels.map((level) => level.id)).size).toBe(3);
}

describe("puzzle level catalogs", () => {
  test("every game exposes three uniquely identified levels", () => {
    for (const levels of [
      sudokuLevels,
      lightsOutLevels,
      hanoiLevels,
      fifteenPuzzleLevels,
      nonogramLevels,
      mastermindLevels,
      sokobanLevels,
      pegSolitaireLevels,
    ]) {
      expectThreeUniqueLevels(levels);
    }
  });

  test("every level starts in a valid playable state", () => {
    for (const puzzle of sudokuLevels) {
      expect(sudokuGame.getStatus(puzzle, sudokuGame.createInitialState(puzzle))).toBe("playing");
    }
    for (const puzzle of lightsOutLevels) {
      expect(lightsOutGame.getStatus(puzzle, lightsOutGame.createInitialState(puzzle))).toBe("playing");
    }
    for (const puzzle of hanoiLevels) {
      expect(towerOfHanoiGame.getStatus(puzzle, towerOfHanoiGame.createInitialState(puzzle))).toBe("playing");
    }
    for (const puzzle of fifteenPuzzleLevels) {
      expect(slidingPuzzleGame.getStatus(puzzle, slidingPuzzleGame.createInitialState(puzzle))).toBe("playing");
    }
    for (const puzzle of nonogramLevels) {
      expect(nonogramGame.getStatus(puzzle, nonogramGame.createInitialState(puzzle))).toBe("playing");
    }
    for (const puzzle of mastermindLevels) {
      expect(mastermindGame.getStatus(puzzle, mastermindGame.createInitialState(puzzle))).toBe("playing");
    }
    for (const puzzle of sokobanLevels) {
      expect(sokobanGame.getStatus(puzzle, sokobanGame.createInitialState(puzzle))).toBe("playing");
    }
    for (const puzzle of pegSolitaireLevels) {
      expect(pegSolitaireGame.getStatus(puzzle, pegSolitaireGame.createInitialState(puzzle))).toBe("playing");
    }
  });

  test("new Lights Out levels are solved by their deterministic press sequences", () => {
    const cases = [
      { puzzle: intermediateLightsOut, presses: [1, 4, 7, 10, 13, 16, 19, 22] },
      { puzzle: advancedLightsOut, presses: [0, 2, 4, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23] },
    ] as const;

    for (const { puzzle, presses } of cases) {
      let state = createInitialLightsOutState(puzzle);
      for (const index of presses) {
        state = applyLightsOutMove(puzzle, state, { type: "toggle", index });
      }
      expect(getLightsOutStatus(puzzle, state)).toBe("solved");
    }
  });

  test("new Fifteen Puzzle levels retain their recorded solution paths", () => {
    const cases = [
      { puzzle: easyFifteenPuzzle, solution: easyFifteenPuzzleSolution },
      { puzzle: intermediateFifteenPuzzle, solution: intermediateFifteenPuzzleSolution },
    ] as const;

    for (const { puzzle, solution } of cases) {
      let state = createInitialSlidingPuzzleState(puzzle);
      for (const tile of solution) {
        state = applySlidingPuzzleMove(puzzle, state, { type: "slide", tile });
      }
      expect(getSlidingPuzzleStatus(puzzle, state)).toBe("solved");
    }
  });

  test("new Sokoban levels have reproducible solutions", () => {
    const cases: readonly Readonly<{
      puzzle: typeof intermediateSokoban | typeof advancedSokoban;
      solution: readonly SokobanDirection[];
    }>[] = [
      {
        puzzle: intermediateSokoban,
        solution: ["left", "left", "up", "right", "right", "down", "right", "up"],
      },
      {
        puzzle: advancedSokoban,
        solution: [
          "up", "down", "left", "up", "up", "right", "down",
          "down", "left", "left", "up", "left", "up", "right",
        ],
      },
    ];

    for (const { puzzle, solution } of cases) {
      let state = createInitialSokobanState(puzzle);
      for (const direction of solution) {
        state = applySokobanMove(puzzle, state, { type: "move", direction });
      }
      expect(getSokobanStatus(puzzle, state)).toBe("solved");
    }
  });

  test("Peg Solitaire training levels end on their configured goals", () => {
    let trainingState = createInitialPegSolitaireState(trainingPegSolitaire);
    trainingState = applyPegSolitaireMove(trainingPegSolitaire, trainingState, {
      type: "jump",
      from: 3,
      to: 5,
    });
    expect(getPegSolitaireStatus(trainingPegSolitaire, trainingState)).toBe("solved");

    let intermediateState = createInitialPegSolitaireState(intermediatePegSolitaire);
    for (const [from, to] of [[5, 7], [7, 9]] as const) {
      intermediateState = applyPegSolitaireMove(intermediatePegSolitaire, intermediateState, {
        type: "jump",
        from,
        to,
      });
    }
    expect(getPegSolitaireStatus(intermediatePegSolitaire, intermediateState)).toBe("solved");
  });

  test("new Mastermind levels can be solved through the public move contract", () => {
    const cases = [
      { puzzle: intermediateMastermind, code: ["purple", "red", "purple", "blue", "green"] },
      { puzzle: advancedMastermind, code: ["orange", "blue", "yellow", "orange", "green", "purple"] },
    ] as const;

    for (const { puzzle, code } of cases) {
      const state = applyMastermindMove(puzzle, createInitialMastermindState(puzzle), {
        type: "submit-guess",
        code,
      });
      expect(getMastermindStatus(puzzle, state)).toBe("solved");
    }
  });
});
