import type { GameDefinition, GameStatus } from "@puzzle-game-core/game-core";

export type PegSolitairePuzzle = Readonly<{
  id: string;
  width: number;
  height: number;
  holes: readonly number[];
  initialPegs: readonly number[];
  goalIndex: number;
}>;

export type PegSolitaireState = Readonly<{
  pegs: readonly number[];
}>;

export type PegSolitaireMove = Readonly<{
  type: "jump";
  from: number;
  to: number;
}>;

function hasUniqueValues(values: readonly number[]): boolean {
  return new Set(values).size === values.length;
}

function isInsidePuzzle(
  puzzle: Pick<PegSolitairePuzzle, "width" | "height">,
  index: number,
): boolean {
  return Number.isInteger(index) && index >= 0 && index < puzzle.width * puzzle.height;
}

export function createPegSolitairePuzzle(
  puzzle: PegSolitairePuzzle,
): PegSolitairePuzzle {
  if (
    !Number.isInteger(puzzle.width) ||
    !Number.isInteger(puzzle.height) ||
    puzzle.width < 3 ||
    puzzle.height < 3
  ) {
    throw new Error("Peg Solitaire dimensions must be integers of at least 3×3.");
  }

  if (
    puzzle.holes.length < 3 ||
    !hasUniqueValues(puzzle.holes) ||
    !hasUniqueValues(puzzle.initialPegs) ||
    !puzzle.holes.every((index) => isInsidePuzzle(puzzle, index))
  ) {
    throw new Error("Peg Solitaire holes must be unique valid board indices.");
  }

  const holes = new Set(puzzle.holes);
  if (
    !holes.has(puzzle.goalIndex) ||
    puzzle.initialPegs.length < 2 ||
    puzzle.initialPegs.some((index) => !holes.has(index))
  ) {
    throw new Error("Peg Solitaire pegs and goal must occupy playable holes.");
  }

  return Object.freeze({
    id: puzzle.id,
    width: puzzle.width,
    height: puzzle.height,
    holes: Object.freeze([...puzzle.holes]),
    initialPegs: Object.freeze([...puzzle.initialPegs]),
    goalIndex: puzzle.goalIndex,
  });
}

export function createInitialPegSolitaireState(
  puzzle: PegSolitairePuzzle,
): PegSolitaireState {
  return {
    pegs: Object.freeze([...puzzle.initialPegs]),
  };
}

export function isValidPegSolitaireState(
  puzzle: PegSolitairePuzzle,
  state: PegSolitaireState,
): boolean {
  if (
    !state ||
    !Array.isArray(state.pegs) ||
    state.pegs.length < 1 ||
    state.pegs.length > puzzle.initialPegs.length ||
    !hasUniqueValues(state.pegs)
  ) {
    return false;
  }

  const holes = new Set(puzzle.holes);
  return state.pegs.every((index) => holes.has(index));
}

function jumpedIndex(
  puzzle: PegSolitairePuzzle,
  from: number,
  to: number,
): number | null {
  if (!isInsidePuzzle(puzzle, from) || !isInsidePuzzle(puzzle, to)) {
    return null;
  }

  const fromRow = Math.floor(from / puzzle.width);
  const fromColumn = from % puzzle.width;
  const toRow = Math.floor(to / puzzle.width);
  const toColumn = to % puzzle.width;
  const rowDelta = toRow - fromRow;
  const columnDelta = toColumn - fromColumn;

  if (
    !(
      (Math.abs(rowDelta) === 2 && columnDelta === 0) ||
      (Math.abs(columnDelta) === 2 && rowDelta === 0)
    )
  ) {
    return null;
  }

  return ((fromRow + toRow) / 2) * puzzle.width + (fromColumn + toColumn) / 2;
}

export function isLegalPegSolitaireMove(
  puzzle: PegSolitairePuzzle,
  state: PegSolitaireState,
  move: PegSolitaireMove,
): boolean {
  if (move.type !== "jump" || !isValidPegSolitaireState(puzzle, state)) {
    return false;
  }

  const holes = new Set(puzzle.holes);
  const pegs = new Set(state.pegs);
  const jumped = jumpedIndex(puzzle, move.from, move.to);

  return (
    jumped !== null &&
    holes.has(move.from) &&
    holes.has(move.to) &&
    pegs.has(move.from) &&
    pegs.has(jumped) &&
    !pegs.has(move.to)
  );
}

export function getPegSolitaireLegalMoves(
  puzzle: PegSolitairePuzzle,
  state: PegSolitaireState,
): readonly PegSolitaireMove[] {
  if (!isValidPegSolitaireState(puzzle, state)) {
    return [];
  }

  const moves: PegSolitaireMove[] = [];
  const holes = new Set(puzzle.holes);
  const pegs = new Set(state.pegs);
  const directions = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ] as const;

  for (const from of state.pegs) {
    const fromRow = Math.floor(from / puzzle.width);
    const fromColumn = from % puzzle.width;

    for (const [rowDelta, columnDelta] of directions) {
      const toRow = fromRow + rowDelta;
      const toColumn = fromColumn + columnDelta;
      if (
        toRow < 0 ||
        toRow >= puzzle.height ||
        toColumn < 0 ||
        toColumn >= puzzle.width
      ) {
        continue;
      }

      const to = toRow * puzzle.width + toColumn;
      const jumped = ((fromRow + toRow) / 2) * puzzle.width + (fromColumn + toColumn) / 2;

      if (holes.has(to) && !pegs.has(to) && pegs.has(jumped)) {
        moves.push({ type: "jump", from, to });
      }
    }
  }

  return moves;
}

export function applyPegSolitaireMove(
  puzzle: PegSolitairePuzzle,
  state: PegSolitaireState,
  move: PegSolitaireMove,
): PegSolitaireState {
  if (!isLegalPegSolitaireMove(puzzle, state, move)) {
    return state;
  }

  const jumped = jumpedIndex(puzzle, move.from, move.to);
  if (jumped === null) {
    return state;
  }

  const pegs = state.pegs
    .filter((index) => index !== move.from && index !== jumped)
    .concat(move.to)
    .sort((left, right) => left - right);

  return {
    pegs: Object.freeze(pegs),
  };
}

export function getPegSolitaireStatus(
  puzzle: PegSolitairePuzzle,
  state: PegSolitaireState,
): GameStatus {
  if (!isValidPegSolitaireState(puzzle, state)) {
    return "invalid";
  }

  return state.pegs.length === 1 && state.pegs[0] === puzzle.goalIndex
    ? "solved"
    : "playing";
}

export const pegSolitaireGame: GameDefinition<
  PegSolitairePuzzle,
  PegSolitaireState,
  PegSolitaireMove
> = {
  id: "peg-solitaire",
  createInitialState: createInitialPegSolitaireState,
  applyMove: applyPegSolitaireMove,
  getStatus: getPegSolitaireStatus,
};

const ENGLISH_BOARD_SIZE = 7;
const englishBoardHoles = Array.from(
  { length: ENGLISH_BOARD_SIZE * ENGLISH_BOARD_SIZE },
  (_, index) => index,
).filter((index) => {
  const row = Math.floor(index / ENGLISH_BOARD_SIZE);
  const column = index % ENGLISH_BOARD_SIZE;
  return (row >= 2 && row <= 4) || (column >= 2 && column <= 4);
});
const englishBoardCenter = 3 * ENGLISH_BOARD_SIZE + 3;

export const beginnerPegSolitaire = createPegSolitairePuzzle({
  id: "english-center-goal",
  width: ENGLISH_BOARD_SIZE,
  height: ENGLISH_BOARD_SIZE,
  holes: englishBoardHoles,
  initialPegs: englishBoardHoles.filter((index) => index !== englishBoardCenter),
  goalIndex: englishBoardCenter,
});
