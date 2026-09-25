import { describe, expect, test } from "bun:test";
import {
  applyPegSolitaireMove,
  beginnerPegSolitaire,
  createInitialPegSolitaireState,
  getPegSolitaireLegalMoves,
  getPegSolitaireStatus,
  isLegalPegSolitaireMove,
  isValidPegSolitaireState,
  type PegSolitaireState,
} from "../src/index";

describe("Peg Solitaire rules", () => {
  test("starts with the classic center hole and four legal opening jumps", () => {
    const state = createInitialPegSolitaireState(beginnerPegSolitaire);
    const legalMoves = getPegSolitaireLegalMoves(beginnerPegSolitaire, state);

    expect(state.pegs).toHaveLength(32);
    expect(state.pegs).not.toContain(beginnerPegSolitaire.goalIndex);
    expect(legalMoves).toHaveLength(4);
    expect(getPegSolitaireStatus(beginnerPegSolitaire, state)).toBe("playing");
  });

  test("a legal jump removes the source and jumped peg", () => {
    const state = createInitialPegSolitaireState(beginnerPegSolitaire);
    const move = { type: "jump", from: 10, to: 24 } as const;

    expect(isLegalPegSolitaireMove(beginnerPegSolitaire, state, move)).toBe(true);

    const next = applyPegSolitaireMove(beginnerPegSolitaire, state, move);

    expect(next.pegs).toHaveLength(31);
    expect(next.pegs).not.toContain(10);
    expect(next.pegs).not.toContain(17);
    expect(next.pegs).toContain(24);
  });

  test("illegal jumps preserve state identity", () => {
    const state = createInitialPegSolitaireState(beginnerPegSolitaire);
    const next = applyPegSolitaireMove(beginnerPegSolitaire, state, {
      type: "jump",
      from: 9,
      to: 11,
    });

    expect(next).toBe(state);
  });

  test("solved state requires the final peg at the configured goal", () => {
    const solved: PegSolitaireState = { pegs: [beginnerPegSolitaire.goalIndex] };
    const wrongHole: PegSolitaireState = { pegs: [beginnerPegSolitaire.holes[0]] };

    expect(isValidPegSolitaireState(beginnerPegSolitaire, solved)).toBe(true);
    expect(getPegSolitaireStatus(beginnerPegSolitaire, solved)).toBe("solved");
    expect(getPegSolitaireStatus(beginnerPegSolitaire, wrongHole)).toBe("playing");
  });

  test("restored state fails closed for pegs outside playable holes", () => {
    const malformed: PegSolitaireState = { pegs: [0] };

    expect(isValidPegSolitaireState(beginnerPegSolitaire, malformed)).toBe(false);
    expect(getPegSolitaireStatus(beginnerPegSolitaire, malformed)).toBe("invalid");
  });
});
