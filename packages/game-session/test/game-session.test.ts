import { describe, expect, test } from "bun:test";
import type { GameDefinition } from "@puzzle-game-core/game-core";
import {
  applyGameSessionMove,
  canUndoGameSession,
  createGameSessionFromState,
  restartGameSession,
  startGameSession,
  undoGameSession,
} from "../src/index";

type CounterState = Readonly<{ value: number }>;
type CounterMove = Readonly<{ amount: number }>;

const counterGame: GameDefinition<number, CounterState, CounterMove> = {
  id: "counter",
  createInitialState: (initialValue) => ({ value: initialValue }),
  applyMove: (_initialValue, state, move) =>
    move.amount === 0 ? state : { value: state.value + move.amount },
  getStatus: () => "playing",
};

describe("game session", () => {
  test("starts from the game's authoritative initial state", () => {
    const session = startGameSession(counterGame, 3);

    expect(session.state).toEqual({ value: 3 });
    expect(session.undoStack).toEqual([]);
    expect(session.moveCount).toBe(0);
    expect(canUndoGameSession(session)).toBe(false);
  });

  test("accepted moves retain the previous state exactly once", () => {
    const initial = startGameSession(counterGame, 0);
    const next = applyGameSessionMove(counterGame, 0, initial, { amount: 2 });

    expect(next.state).toEqual({ value: 2 });
    expect(next.undoStack).toEqual([{ value: 0 }]);
    expect(next.moveCount).toBe(1);
    expect(canUndoGameSession(next)).toBe(true);
  });

  test("rejected or no-op moves preserve the session identity", () => {
    const session = startGameSession(counterGame, 0);
    const next = applyGameSessionMove(counterGame, 0, session, { amount: 0 });

    expect(next).toBe(session);
  });

  test("undo restores the previous state and move depth", () => {
    const initial = startGameSession(counterGame, 0);
    const first = applyGameSessionMove(counterGame, 0, initial, { amount: 1 });
    const second = applyGameSessionMove(counterGame, 0, first, { amount: 1 });
    const undone = undoGameSession(second);

    expect(undone.state).toEqual({ value: 1 });
    expect(undone.undoStack).toEqual([{ value: 0 }]);
    expect(undone.moveCount).toBe(1);
  });

  test("restart asks the game for a fresh authoritative initial state", () => {
    const initial = startGameSession(counterGame, 4);
    const moved = applyGameSessionMove(counterGame, 4, initial, { amount: 3 });
    const restarted = restartGameSession(counterGame, 4);

    expect(moved.state).toEqual({ value: 7 });
    expect(restarted.state).toEqual({ value: 4 });
    expect(restarted.undoStack).toEqual([]);
    expect(restarted.moveCount).toBe(0);
  });

  test("retains a bounded undo window without truncating move depth", () => {
    let session = startGameSession(counterGame, 0);

    for (let index = 0; index < 105; index += 1) {
      session = applyGameSessionMove(counterGame, 0, session, { amount: 1 });
    }

    expect(session.state).toEqual({ value: 105 });
    expect(session.undoStack).toHaveLength(100);
    expect(session.moveCount).toBe(105);

    for (let index = 0; index < 100; index += 1) {
      session = undoGameSession(session);
    }

    expect(session.state).toEqual({ value: 5 });
    expect(session.moveCount).toBe(5);
    expect(canUndoGameSession(session)).toBe(false);
    expect(undoGameSession(session)).toBe(session);
  });

  test("adopts only caller-validated restored state and starts a fresh history", () => {
    const restored = { value: 42 };
    const session = createGameSessionFromState(restored);

    expect(session.state).toBe(restored);
    expect(session.undoStack).toEqual([]);
    expect(session.moveCount).toBe(0);
  });
});
