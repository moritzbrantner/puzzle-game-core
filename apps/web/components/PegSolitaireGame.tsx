"use client";

import {
  beginnerPegSolitaire,
  getPegSolitaireLegalMoves,
  pegSolitaireGame,
} from "@puzzle-game-core/peg-solitaire";
import { useMemo, useState } from "react";
import { useGameSession } from "../hooks/useGameSession";

export function PegSolitaireGame() {
  const {
    session,
    state,
    canUndo,
    applyMove,
    undo: undoSession,
    restart: restartSession,
  } = useGameSession(pegSolitaireGame, beginnerPegSolitaire);
  const [selected, setSelected] = useState<number | null>(null);

  const holes = useMemo(() => new Set(beginnerPegSolitaire.holes), []);
  const pegs = useMemo(() => new Set(state.pegs), [state.pegs]);
  const legalMoves = useMemo(
    () => getPegSolitaireLegalMoves(beginnerPegSolitaire, state),
    [state],
  );
  const legalTargets = useMemo(
    () =>
      new Set(
        selected === null
          ? []
          : legalMoves.filter((move) => move.from === selected).map((move) => move.to),
      ),
    [legalMoves, selected],
  );
  const status = pegSolitaireGame.getStatus(beginnerPegSolitaire, state);

  function selectHole(index: number) {
    if (pegs.has(index)) {
      const hasLegalMove = legalMoves.some((move) => move.from === index);
      setSelected(hasLegalMove ? index : null);
      return;
    }

    if (selected !== null && legalTargets.has(index)) {
      applyMove({ type: "jump", from: selected, to: index });
    }

    setSelected(null);
  }

  function undo() {
    undoSession();
    setSelected(null);
  }

  function restart() {
    restartSession();
    setSelected(null);
  }

  return (
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,34rem)_minmax(14rem,1fr)] lg:items-start">
      <div
        className="grid aspect-square w-full max-w-[34rem] grid-cols-7 gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-3 dark:border-zinc-800 dark:bg-zinc-900"
        role="grid"
        aria-label="Peg Solitaire board"
      >
        {Array.from(
          { length: beginnerPegSolitaire.width * beginnerPegSolitaire.height },
          (_, index) => {
            if (!holes.has(index)) {
              return <div key={index} aria-hidden="true" />;
            }

            const occupied = pegs.has(index);
            const isSelected = selected === index;
            const legalTarget = legalTargets.has(index);
            const isGoal = beginnerPegSolitaire.goalIndex === index;
            const row = Math.floor(index / beginnerPegSolitaire.width);
            const column = index % beginnerPegSolitaire.width;

            return (
              <button
                key={index}
                type="button"
                role="gridcell"
                aria-pressed={isSelected}
                aria-label={`Row ${row + 1}, column ${column + 1}, ${occupied ? "peg" : "empty"}${isGoal ? ", center goal" : ""}${legalTarget ? ", legal destination" : ""}`}
                className={[
                  "relative flex aspect-square min-h-11 items-center justify-center rounded-full border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
                  legalTarget
                    ? "border-emerald-500 bg-emerald-100 dark:bg-emerald-950"
                    : isSelected
                      ? "border-blue-600 bg-blue-100 ring-2 ring-blue-500 dark:bg-blue-950"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950",
                ].join(" ")}
                onClick={() => selectHole(index)}
              >
                {isGoal ? (
                  <span
                    className="absolute size-3 rounded-full border border-amber-500"
                    aria-hidden="true"
                  />
                ) : null}
                {occupied ? (
                  <span
                    className="relative z-10 size-[62%] rounded-full bg-zinc-800 shadow-sm dark:bg-zinc-100"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          },
        )}
      </div>

      <aside className="space-y-5 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</p>
          <p className="mt-1 text-lg font-semibold" aria-live="polite">
            {status === "solved"
              ? "Center peg solved"
              : legalMoves.length === 0
                ? "No legal jumps"
                : selected === null
                  ? "Choose a movable peg"
                  : "Choose a highlighted destination"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
            <p className="text-zinc-500">Pegs</p>
            <p className="mt-1 font-semibold">{state.pegs.length}</p>
          </div>
          <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
            <p className="text-zinc-500">Moves</p>
            <p className="mt-1 font-semibold">{session.moveCount}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canUndo}
            className="min-h-11 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            onClick={undo}
          >
            Undo
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            onClick={restart}
          >
            Restart
          </button>
        </div>
      </aside>
    </section>
  );
}
