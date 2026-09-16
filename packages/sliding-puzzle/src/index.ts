import type { GameDefinition, GameStatus } from "@puzzle-game-core/game-core";

export type SlidingPuzzleTile = number | null;

export type SlidingPuzzle = Readonly<{
  id: string;
  width: number;
  height: number;
  initialTiles: readonly SlidingPuzzleTile[];
  goalTiles: readonly SlidingPuzzleTile[];
}>;

export type SlidingPuzzleState = Readonly<{
  tiles: readonly SlidingPuzzleTile[];
}>;

export type SlidingPuzzleMove = Readonly<{
  type: "slide";
  tile: number;
}>;

function hasValidDimensions(width: number, height: number): boolean {
  return Number.isInteger(width) && width > 1 && Number.isInteger(height) && height > 1;
}

function createCanonicalGoal(width: number, height: number): SlidingPuzzleTile[] {
  const cellCount = width * height;
  return [...Array.from({ length: cellCount - 1 }, (_, index) => index + 1), null];
}

function hasCanonicalTileSet(width: number, height: number, tiles: readonly SlidingPuzzleTile[]): boolean {
  if (!hasValidDimensions(width, height) || tiles.length !== width * height) {
    return false;
  }

  const expectedNumberedTiles = width * height - 1;
  const seen = new Set<number>();
  let blankCount = 0;

  for (const tile of tiles) {
    if (tile === null) {
      blankCount += 1;
      continue;
    }

    if (!Number.isInteger(tile) || tile < 1 || tile > expectedNumberedTiles || seen.has(tile)) {
      return false;
    }

    seen.add(tile);
  }

  return blankCount === 1 && seen.size === expectedNumberedTiles;
}

function countInversions(tiles: readonly SlidingPuzzleTile[]): number {
  const numberedTiles = tiles.filter((tile): tile is number => tile !== null);
  let inversions = 0;

  for (let left = 0; left < numberedTiles.length; left += 1) {
    for (let right = left + 1; right < numberedTiles.length; right += 1) {
      if (numberedTiles[left] > numberedTiles[right]) {
        inversions += 1;
      }
    }
  }

  return inversions;
}

export function isSolvableSlidingPuzzleLayout(
  width: number,
  height: number,
  tiles: readonly SlidingPuzzleTile[],
): boolean {
  if (!hasCanonicalTileSet(width, height, tiles)) {
    return false;
  }

  const inversions = countInversions(tiles);
  if (width % 2 === 1) {
    return inversions % 2 === 0;
  }

  const blankIndex = tiles.indexOf(null);
  const blankRowFromBottom = height - Math.floor(blankIndex / width);
  return (inversions + blankRowFromBottom) % 2 === 1;
}

export function createSlidingPuzzle(
  id: string,
  width: number,
  height: number,
  initialTiles: readonly SlidingPuzzleTile[],
): SlidingPuzzle {
  if (!hasValidDimensions(width, height)) {
    throw new Error("Sliding-puzzle dimensions must be integers greater than one.");
  }

  if (!hasCanonicalTileSet(width, height, initialTiles)) {
    throw new Error("Sliding-puzzle tiles must contain each numbered tile exactly once and one blank.");
  }

  if (!isSolvableSlidingPuzzleLayout(width, height, initialTiles)) {
    throw new Error("Sliding-puzzle initial layout must be solvable from the canonical goal.");
  }

  return Object.freeze({
    id,
    width,
    height,
    initialTiles: Object.freeze([...initialTiles]),
    goalTiles: Object.freeze(createCanonicalGoal(width, height)),
  });
}

export function createInitialSlidingPuzzleState(puzzle: SlidingPuzzle): SlidingPuzzleState {
  return { tiles: [...puzzle.initialTiles] };
}

export function isValidSlidingPuzzleState(
  puzzle: SlidingPuzzle,
  state: SlidingPuzzleState,
): boolean {
  return hasCanonicalTileSet(puzzle.width, puzzle.height, state.tiles);
}

function areAdjacent(width: number, leftIndex: number, rightIndex: number): boolean {
  const leftRow = Math.floor(leftIndex / width);
  const leftColumn = leftIndex % width;
  const rightRow = Math.floor(rightIndex / width);
  const rightColumn = rightIndex % width;

  return Math.abs(leftRow - rightRow) + Math.abs(leftColumn - rightColumn) === 1;
}

export function getMovableSlidingPuzzleTiles(
  puzzle: SlidingPuzzle,
  state: SlidingPuzzleState,
): readonly number[] {
  if (!isValidSlidingPuzzleState(puzzle, state)) {
    return [];
  }

  const blankIndex = state.tiles.indexOf(null);
  return state.tiles.flatMap((tile, index) =>
    tile !== null && areAdjacent(puzzle.width, index, blankIndex) ? [tile] : [],
  );
}

export function applySlidingPuzzleMove(
  puzzle: SlidingPuzzle,
  state: SlidingPuzzleState,
  move: SlidingPuzzleMove,
): SlidingPuzzleState {
  if (move.type !== "slide" || !isValidSlidingPuzzleState(puzzle, state) || !Number.isInteger(move.tile)) {
    return state;
  }

  const tileIndex = state.tiles.indexOf(move.tile);
  const blankIndex = state.tiles.indexOf(null);
  if (tileIndex < 0 || !areAdjacent(puzzle.width, tileIndex, blankIndex)) {
    return state;
  }

  const tiles = [...state.tiles];
  tiles[blankIndex] = move.tile;
  tiles[tileIndex] = null;
  return { tiles };
}

export function getSlidingPuzzleStatus(
  puzzle: SlidingPuzzle,
  state: SlidingPuzzleState,
): GameStatus {
  if (!isValidSlidingPuzzleState(puzzle, state)) {
    return "invalid";
  }

  return state.tiles.every((tile, index) => tile === puzzle.goalTiles[index]) ? "solved" : "playing";
}

export const slidingPuzzleGame: GameDefinition<SlidingPuzzle, SlidingPuzzleState, SlidingPuzzleMove> = {
  id: "sliding-puzzle",
  createInitialState: createInitialSlidingPuzzleState,
  applyMove: applySlidingPuzzleMove,
  getStatus: getSlidingPuzzleStatus,
};

export const beginnerFifteenPuzzle = createSlidingPuzzle(
  "fifteen-twenty-move-scramble",
  4,
  4,
  [
    1, 6, 2, 3,
    5, 15, 4, null,
    9, 10, 12, 11,
    13, 14, 8, 7,
  ],
);

export const beginnerFifteenPuzzleSolution = [
  4, 15, 6, 2, 3, 4, 11, 7, 8, 12,
  15, 11, 7, 8, 12, 15, 11, 7, 8, 12,
] as const;
