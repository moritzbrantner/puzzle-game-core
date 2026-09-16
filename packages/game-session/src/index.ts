import type { GameDefinition } from "@puzzle-game-core/game-core";

const MAX_UNDO_STATES = 100;

export type GameSession<State> = Readonly<{
  state: State;
  undoStack: readonly State[];
  moveCount: number;
}>;

export function startGameSession<Puzzle, State, Move>(
  game: GameDefinition<Puzzle, State, Move>,
  puzzle: Puzzle,
): GameSession<State> {
  return createGameSessionFromState(game.createInitialState(puzzle));
}

/**
 * Starts a fresh session from a state that the caller has already validated.
 * External persistence remains consumer-owned and must fail closed before it
 * hands a restored state to this function.
 */
export function createGameSessionFromState<State>(state: State): GameSession<State> {
  return {
    state,
    undoStack: [],
    moveCount: 0,
  };
}

export function applyGameSessionMove<Puzzle, State, Move>(
  game: GameDefinition<Puzzle, State, Move>,
  puzzle: Puzzle,
  session: GameSession<State>,
  move: Move,
): GameSession<State> {
  const nextState = game.applyMove(puzzle, session.state, move);

  if (Object.is(nextState, session.state)) {
    return session;
  }

  const undoStack =
    session.undoStack.length >= MAX_UNDO_STATES
      ? [...session.undoStack.slice(1), session.state]
      : [...session.undoStack, session.state];

  return {
    state: nextState,
    undoStack,
    moveCount: session.moveCount + 1,
  };
}

export function canUndoGameSession<State>(session: GameSession<State>): boolean {
  return session.undoStack.length > 0;
}

export function undoGameSession<State>(session: GameSession<State>): GameSession<State> {
  if (!canUndoGameSession(session)) {
    return session;
  }

  const previousState = session.undoStack[session.undoStack.length - 1];

  return {
    state: previousState,
    undoStack: session.undoStack.slice(0, -1),
    moveCount: Math.max(0, session.moveCount - 1),
  };
}

export function restartGameSession<Puzzle, State, Move>(
  game: GameDefinition<Puzzle, State, Move>,
  puzzle: Puzzle,
): GameSession<State> {
  return startGameSession(game, puzzle);
}
