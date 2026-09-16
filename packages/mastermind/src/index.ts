import type { GameDefinition, GameStatus } from "@puzzle-game-core/game-core";

export const MASTERMIND_PEGS = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
] as const;

export type MastermindPeg = (typeof MASTERMIND_PEGS)[number];

export type MastermindFeedback = Readonly<{
  exact: number;
  colorOnly: number;
}>;

export type MastermindGuess = Readonly<{
  code: readonly MastermindPeg[];
  feedback: MastermindFeedback;
}>;

export type MastermindPuzzle = Readonly<{
  id: string;
  slots: number;
  palette: readonly MastermindPeg[];
}>;

export type MastermindState = Readonly<{
  guesses: readonly MastermindGuess[];
}>;

export type MastermindMove = Readonly<{
  type: "submit-guess";
  code: readonly MastermindPeg[];
}>;

const secretByPuzzle = new WeakMap<MastermindPuzzle, readonly MastermindPeg[]>();

function isMastermindPeg(value: unknown): value is MastermindPeg {
  return MASTERMIND_PEGS.includes(value as MastermindPeg);
}

function hasValidPalette(palette: readonly MastermindPeg[]): boolean {
  return (
    palette.length >= 2 &&
    palette.every(isMastermindPeg) &&
    new Set(palette).size === palette.length
  );
}

function hasValidCode(puzzle: MastermindPuzzle, code: readonly unknown[]): code is readonly MastermindPeg[] {
  return (
    code.length === puzzle.slots &&
    code.every((peg) => isMastermindPeg(peg) && puzzle.palette.includes(peg))
  );
}

function getSecret(puzzle: MastermindPuzzle): readonly MastermindPeg[] | null {
  return secretByPuzzle.get(puzzle) ?? null;
}

export function createMastermindPuzzle(
  id: string,
  secret: readonly MastermindPeg[],
  palette: readonly MastermindPeg[] = MASTERMIND_PEGS,
): MastermindPuzzle {
  if (!hasValidPalette(palette)) {
    throw new Error("Mastermind palette must contain at least two unique supported pegs.");
  }

  if (secret.length < 2 || secret.some((peg) => !palette.includes(peg))) {
    throw new Error("Mastermind secret must contain at least two pegs from the puzzle palette.");
  }

  const puzzle: MastermindPuzzle = Object.freeze({
    id,
    slots: secret.length,
    palette: Object.freeze([...palette]),
  });

  secretByPuzzle.set(puzzle, Object.freeze([...secret]));
  return puzzle;
}

export function scoreMastermindGuess(
  puzzle: MastermindPuzzle,
  code: readonly MastermindPeg[],
): MastermindFeedback | null {
  const secret = getSecret(puzzle);
  if (!secret || !hasValidCode(puzzle, code)) {
    return null;
  }

  let exact = 0;
  const remainingSecret = new Map<MastermindPeg, number>();
  const remainingGuess = new Map<MastermindPeg, number>();

  for (let index = 0; index < puzzle.slots; index += 1) {
    const secretPeg = secret[index];
    const guessPeg = code[index];

    if (secretPeg === guessPeg) {
      exact += 1;
      continue;
    }

    remainingSecret.set(secretPeg, (remainingSecret.get(secretPeg) ?? 0) + 1);
    remainingGuess.set(guessPeg, (remainingGuess.get(guessPeg) ?? 0) + 1);
  }

  let colorOnly = 0;
  for (const peg of puzzle.palette) {
    colorOnly += Math.min(remainingSecret.get(peg) ?? 0, remainingGuess.get(peg) ?? 0);
  }

  return Object.freeze({ exact, colorOnly });
}

function feedbackMatches(left: MastermindFeedback, right: MastermindFeedback): boolean {
  return left.exact === right.exact && left.colorOnly === right.colorOnly;
}

export function createInitialMastermindState(_puzzle: MastermindPuzzle): MastermindState {
  return { guesses: [] };
}

export function isValidMastermindState(
  puzzle: MastermindPuzzle,
  state: MastermindState,
): boolean {
  if (!getSecret(puzzle) || !Array.isArray(state.guesses)) {
    return false;
  }

  let solved = false;

  for (const guess of state.guesses) {
    if (solved || !guess || !Array.isArray(guess.code) || !hasValidCode(puzzle, guess.code)) {
      return false;
    }

    if (
      !guess.feedback ||
      !Number.isInteger(guess.feedback.exact) ||
      !Number.isInteger(guess.feedback.colorOnly) ||
      guess.feedback.exact < 0 ||
      guess.feedback.colorOnly < 0 ||
      guess.feedback.exact + guess.feedback.colorOnly > puzzle.slots
    ) {
      return false;
    }

    const authoritative = scoreMastermindGuess(puzzle, guess.code);
    if (authoritative === null || !feedbackMatches(guess.feedback, authoritative)) {
      return false;
    }

    solved = authoritative.exact === puzzle.slots;
  }

  return true;
}

function hasSolvedGuess(puzzle: MastermindPuzzle, state: MastermindState): boolean {
  return state.guesses.some((guess) => guess.feedback.exact === puzzle.slots);
}

export function applyMastermindMove(
  puzzle: MastermindPuzzle,
  state: MastermindState,
  move: MastermindMove,
): MastermindState {
  if (
    move.type !== "submit-guess" ||
    !isValidMastermindState(puzzle, state) ||
    hasSolvedGuess(puzzle, state) ||
    !Array.isArray(move.code) ||
    !hasValidCode(puzzle, move.code)
  ) {
    return state;
  }

  const feedback = scoreMastermindGuess(puzzle, move.code);
  if (!feedback) {
    return state;
  }

  return {
    guesses: [
      ...state.guesses,
      Object.freeze({
        code: Object.freeze([...move.code]),
        feedback,
      }),
    ],
  };
}

export function getMastermindStatus(
  puzzle: MastermindPuzzle,
  state: MastermindState,
): GameStatus {
  if (!isValidMastermindState(puzzle, state)) {
    return "invalid";
  }

  return hasSolvedGuess(puzzle, state) ? "solved" : "playing";
}

export const mastermindGame: GameDefinition<MastermindPuzzle, MastermindState, MastermindMove> = {
  id: "mastermind",
  createInitialState: createInitialMastermindState,
  applyMove: applyMastermindMove,
  getStatus: getMastermindStatus,
};

export const beginnerMastermind = createMastermindPuzzle(
  "classic-four",
  ["red", "yellow", "blue", "green"],
);
