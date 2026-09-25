import type { GameDefinition, GameStatus } from "@puzzle-game-core/game-core";

export type SokobanDirection = "up" | "down" | "left" | "right";

export type SokobanPuzzle = Readonly<{
  id: string;
  width: number;
  height: number;
  walls: readonly number[];
  goals: readonly number[];
  initialCrates: readonly number[];
  initialPlayer: number;
}>;

export type SokobanState = Readonly<{
  player: number;
  crates: readonly number[];
}>;

export type SokobanMove = Readonly<{
  type: "move";
  direction: SokobanDirection;
}>;

const directionDelta: Record<SokobanDirection, readonly [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

function isIntegerIndex(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

function hasUniqueValues(values: readonly number[]): boolean {
  return new Set(values).size === values.length;
}

function isInsidePuzzle(puzzle: Pick<SokobanPuzzle, "width" | "height">, index: number): boolean {
  return isIntegerIndex(index) && index < puzzle.width * puzzle.height;
}

export function createSokobanPuzzle(puzzle: SokobanPuzzle): SokobanPuzzle {
  if (
    !Number.isInteger(puzzle.width) ||
    !Number.isInteger(puzzle.height) ||
    puzzle.width < 3 ||
    puzzle.height < 3
  ) {
    throw new Error("Sokoban dimensions must be integers of at least 3×3.");
  }

  if (
    !hasUniqueValues(puzzle.walls) ||
    !hasUniqueValues(puzzle.goals) ||
    !hasUniqueValues(puzzle.initialCrates) ||
    !puzzle.walls.every((index) => isInsidePuzzle(puzzle, index)) ||
    !puzzle.goals.every((index) => isInsidePuzzle(puzzle, index)) ||
    !puzzle.initialCrates.every((index) => isInsidePuzzle(puzzle, index)) ||
    !isInsidePuzzle(puzzle, puzzle.initialPlayer)
  ) {
    throw new Error("Sokoban positions must be unique valid board indices.");
  }

  const walls = new Set(puzzle.walls);
  const crates = new Set(puzzle.initialCrates);

  if (
    puzzle.goals.length !== puzzle.initialCrates.length ||
    puzzle.goals.some((index) => walls.has(index)) ||
    puzzle.initialCrates.some((index) => walls.has(index)) ||
    walls.has(puzzle.initialPlayer) ||
    crates.has(puzzle.initialPlayer)
  ) {
    throw new Error("Sokoban walls, goals, crates, and player overlap invalidly.");
  }

  return Object.freeze({
    id: puzzle.id,
    width: puzzle.width,
    height: puzzle.height,
    walls: Object.freeze([...puzzle.walls]),
    goals: Object.freeze([...puzzle.goals]),
    initialCrates: Object.freeze([...puzzle.initialCrates]),
    initialPlayer: puzzle.initialPlayer,
  });
}

export function createInitialSokobanState(puzzle: SokobanPuzzle): SokobanState {
  return {
    player: puzzle.initialPlayer,
    crates: Object.freeze([...puzzle.initialCrates]),
  };
}

export function isValidSokobanState(puzzle: SokobanPuzzle, state: SokobanState): boolean {
  if (
    !state ||
    !Array.isArray(state.crates) ||
    state.crates.length !== puzzle.initialCrates.length ||
    !hasUniqueValues(state.crates) ||
    !isInsidePuzzle(puzzle, state.player)
  ) {
    return false;
  }

  const walls = new Set(puzzle.walls);
  const crates = new Set(state.crates);

  return (
    !walls.has(state.player) &&
    !crates.has(state.player) &&
    state.crates.every((index) => isInsidePuzzle(puzzle, index) && !walls.has(index))
  );
}

function step(
  puzzle: SokobanPuzzle,
  index: number,
  direction: SokobanDirection,
): number | null {
  const row = Math.floor(index / puzzle.width);
  const column = index % puzzle.width;
  const [rowDelta, columnDelta] = directionDelta[direction];
  const nextRow = row + rowDelta;
  const nextColumn = column + columnDelta;

  if (
    nextRow < 0 ||
    nextRow >= puzzle.height ||
    nextColumn < 0 ||
    nextColumn >= puzzle.width
  ) {
    return null;
  }

  return nextRow * puzzle.width + nextColumn;
}

export function applySokobanMove(
  puzzle: SokobanPuzzle,
  state: SokobanState,
  move: SokobanMove,
): SokobanState {
  if (move.type !== "move" || !isValidSokobanState(puzzle, state)) {
    return state;
  }

  const destination = step(puzzle, state.player, move.direction);
  if (destination === null || puzzle.walls.includes(destination)) {
    return state;
  }

  const crateIndex = state.crates.indexOf(destination);
  if (crateIndex === -1) {
    return {
      player: destination,
      crates: state.crates,
    };
  }

  const crateDestination = step(puzzle, destination, move.direction);
  if (
    crateDestination === null ||
    puzzle.walls.includes(crateDestination) ||
    state.crates.includes(crateDestination)
  ) {
    return state;
  }

  const crates = [...state.crates];
  crates[crateIndex] = crateDestination;
  crates.sort((left, right) => left - right);

  return {
    player: destination,
    crates: Object.freeze(crates),
  };
}

export function getSokobanStatus(
  puzzle: SokobanPuzzle,
  state: SokobanState,
): GameStatus {
  if (!isValidSokobanState(puzzle, state)) {
    return "invalid";
  }

  const goals = new Set(puzzle.goals);
  return state.crates.every((crate) => goals.has(crate)) ? "solved" : "playing";
}

export const sokobanGame: GameDefinition<SokobanPuzzle, SokobanState, SokobanMove> = {
  id: "sokoban",
  createInitialState: createInitialSokobanState,
  applyMove: applySokobanMove,
  getStatus: getSokobanStatus,
};

function puzzleFromRows(id: string, rows: readonly string[]): SokobanPuzzle {
  if (rows.length === 0 || rows.some((row) => row.length !== rows[0].length)) {
    throw new Error("Sokoban fixture rows must form a non-empty rectangle.");
  }

  const width = rows[0].length;
  const walls: number[] = [];
  const goals: number[] = [];
  const initialCrates: number[] = [];
  let initialPlayer: number | null = null;

  rows.forEach((row, rowIndex) => {
    [...row].forEach((cell, columnIndex) => {
      const index = rowIndex * width + columnIndex;

      if (cell === "#") {
        walls.push(index);
      } else if (cell === ".") {
        goals.push(index);
      } else if (cell === "$") {
        initialCrates.push(index);
      } else if (cell === "@") {
        if (initialPlayer !== null) {
          throw new Error("Sokoban fixture must contain exactly one player.");
        }
        initialPlayer = index;
      } else if (cell === "*") {
        goals.push(index);
        initialCrates.push(index);
      } else if (cell === "+") {
        goals.push(index);
        if (initialPlayer !== null) {
          throw new Error("Sokoban fixture must contain exactly one player.");
        }
        initialPlayer = index;
      } else if (cell !== " ") {
        throw new Error(`Unsupported Sokoban fixture cell: ${cell}`);
      }
    });
  });

  if (initialPlayer === null) {
    throw new Error("Sokoban fixture must contain a player.");
  }

  return createSokobanPuzzle({
    id,
    width,
    height: rows.length,
    walls,
    goals,
    initialCrates,
    initialPlayer,
  });
}

export const beginnerSokoban = puzzleFromRows("warehouse-two-crates", [
  "#######",
  "#     #",
  "# .$  #",
  "#  $ .#",
  "#  @  #",
  "#     #",
  "#######",
]);
