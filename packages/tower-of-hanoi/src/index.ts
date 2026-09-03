import type { GameDefinition, GameStatus } from "@puzzle-game-core/game-core";

export type HanoiPuzzle = Readonly<{
  id: string;
  diskCount: number;
}>;

export type HanoiState = Readonly<{
  pegs: readonly (readonly number[])[];
}>;

export type HanoiMove = Readonly<{
  type: "move";
  from: number;
  to: number;
}>;

const PEG_COUNT = 3;

export function createHanoiPuzzle(id: string, diskCount: number): HanoiPuzzle {
  if (!Number.isInteger(diskCount) || diskCount <= 0) {
    throw new Error("Tower of Hanoi must contain a positive integer number of disks.");
  }

  return Object.freeze({ id, diskCount });
}

export function createInitialHanoiState(puzzle: HanoiPuzzle): HanoiState {
  return {
    pegs: [
      Array.from({ length: puzzle.diskCount }, (_, index) => puzzle.diskCount - index),
      [],
      [],
    ],
  };
}

export function isValidHanoiState(puzzle: HanoiPuzzle, state: HanoiState): boolean {
  if (state.pegs.length !== PEG_COUNT) {
    return false;
  }

  const seen = new Set<number>();
  let diskTotal = 0;

  for (const peg of state.pegs) {
    diskTotal += peg.length;

    for (let index = 0; index < peg.length; index += 1) {
      const disk = peg[index];
      if (
        !Number.isInteger(disk) ||
        disk < 1 ||
        disk > puzzle.diskCount ||
        seen.has(disk)
      ) {
        return false;
      }

      if (index > 0 && peg[index - 1] <= disk) {
        return false;
      }

      seen.add(disk);
    }
  }

  return diskTotal === puzzle.diskCount && seen.size === puzzle.diskCount;
}

export function applyHanoiMove(
  puzzle: HanoiPuzzle,
  state: HanoiState,
  move: HanoiMove,
): HanoiState {
  if (move.type !== "move" || !isValidHanoiState(puzzle, state)) {
    return state;
  }

  if (
    !Number.isInteger(move.from) ||
    !Number.isInteger(move.to) ||
    move.from < 0 ||
    move.from >= PEG_COUNT ||
    move.to < 0 ||
    move.to >= PEG_COUNT ||
    move.from === move.to
  ) {
    return state;
  }

  const source = state.pegs[move.from];
  const target = state.pegs[move.to];
  const disk = source.at(-1);
  if (disk === undefined) {
    return state;
  }

  const targetTop = target.at(-1);
  if (targetTop !== undefined && targetTop < disk) {
    return state;
  }

  const pegs = state.pegs.map((peg) => [...peg]);
  pegs[move.from].pop();
  pegs[move.to].push(disk);
  return { pegs };
}

export function getHanoiStatus(puzzle: HanoiPuzzle, state: HanoiState): GameStatus {
  if (!isValidHanoiState(puzzle, state)) {
    return "invalid";
  }

  return state.pegs[PEG_COUNT - 1].length === puzzle.diskCount ? "solved" : "playing";
}

export function getMinimumHanoiMoveCount(puzzle: HanoiPuzzle): number {
  return 2 ** puzzle.diskCount - 1;
}

export const towerOfHanoiGame: GameDefinition<HanoiPuzzle, HanoiState, HanoiMove> = {
  id: "tower-of-hanoi",
  createInitialState: createInitialHanoiState,
  applyMove: applyHanoiMove,
  getStatus: getHanoiStatus,
};

export const beginnerHanoi = createHanoiPuzzle("three-disks", 3);
