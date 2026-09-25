"use client";

import type { GameDefinition } from "@puzzle-game-core/game-core";
import {
  applyGameSessionMove,
  canUndoGameSession,
  createGameSessionFromState,
  restartGameSession,
  startGameSession,
  undoGameSession,
  type GameSession,
} from "@puzzle-game-core/game-session";
import { useCallback, useState } from "react";

export type GameSessionControls<State, Move> = Readonly<{
  session: GameSession<State>;
  state: State;
  canUndo: boolean;
  applyMove: (move: Move) => void;
  undo: () => void;
  restart: () => void;
  adoptValidatedState: (state: State) => void;
}>;

/**
 * React adapter for the pure session package.
 *
 * Game legality and history semantics stay in the headless packages. This hook
 * only binds those pure transitions to React state for the web application.
 * Callers must validate externally restored state in the owning game package
 * before passing it to adoptValidatedState.
 */
export function useGameSession<Puzzle, State, Move>(
  game: GameDefinition<Puzzle, State, Move>,
  puzzle: Puzzle,
): GameSessionControls<State, Move> {
  const [session, setSession] = useState(() => startGameSession(game, puzzle));

  const applyMove = useCallback(
    (move: Move) => {
      setSession((current) => applyGameSessionMove(game, puzzle, current, move));
    },
    [game, puzzle],
  );

  const undo = useCallback(() => {
    setSession((current) => undoGameSession(current));
  }, []);

  const restart = useCallback(() => {
    setSession(restartGameSession(game, puzzle));
  }, [game, puzzle]);

  const adoptValidatedState = useCallback((state: State) => {
    setSession(createGameSessionFromState(state));
  }, []);

  return {
    session,
    state: session.state,
    canUndo: canUndoGameSession(session),
    applyMove,
    undo,
    restart,
    adoptValidatedState,
  };
}
