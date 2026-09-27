export const games = [
  {
    id: "sudoku",
    name: "Sudoku",
    category: "Classic constraint puzzle",
    description: "Place digits without repeating them across rows, columns, or boxes.",
  },
  {
    id: "lights-out",
    name: "Lights Out",
    category: "Toggle puzzle",
    description: "Toggle neighboring lights until the whole board is dark.",
  },
  {
    id: "tower-of-hanoi",
    name: "Tower of Hanoi",
    category: "Ordering puzzle",
    description: "Move a stack while never placing a larger disk on a smaller one.",
  },
  {
    id: "fifteen-puzzle",
    name: "Fifteen Puzzle",
    category: "Permutation puzzle",
    description: "Slide numbered tiles through one empty space until the board is ordered.",
  },
  {
    id: "nonogram",
    name: "Nonogram",
    category: "Deduction puzzle",
    description: "Use row and column run clues to reveal a hidden pixel picture.",
  },
  {
    id: "mastermind",
    name: "Mastermind",
    category: "Feedback puzzle",
    description: "Deduce a hidden color code from exact-position and color-only feedback.",
  },
  {
    id: "sokoban",
    name: "Sokoban",
    category: "Push puzzle",
    description: "Push crates through a warehouse until every crate occupies a goal.",
  },
  {
    id: "peg-solitaire",
    name: "Peg Solitaire",
    category: "Jump puzzle",
    description: "Jump pegs over neighbors until only the goal peg remains.",
  },
] as const;

export type GameId = (typeof games)[number]["id"];

export function getGame(gameId: string) {
  return games.find((game) => game.id === gameId);
}
