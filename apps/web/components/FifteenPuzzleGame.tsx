"use client";

import { useGameSession } from "../hooks/useGameSession";
import {
  beginnerFifteenPuzzle,
  getMovableSlidingPuzzleTiles,
  slidingPuzzleGame,
} from "@puzzle-game-core/sliding-puzzle";
import { useMemo } from "react";

export function FifteenPuzzleGame() {
  const { session, state, canUndo, applyMove, undo, restart } = useGameSession(
    slidingPuzzleGame,
    beginnerFifteenPuzzle,
  );
  const status = slidingPuzzleGame.getStatus(beginnerFifteenPuzzle, state);
  const movableTiles = useMemo(
    () => new Set(getMovableSlidingPuzzleTiles(beginnerFifteenPuzzle, state)),
    [state],
  );

  function slide(tile: number) {
    applyMove({ type: "slide", tile });
  }

  return (
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,34rem)_minmax(14rem,1fr)] lg:items-start">
      <div
        className="grid aspect-square w-full max-w-[34rem] grid-cols-4 gap-2 rounded-xl border border-zinc-200 bg-zinc-100 p-3 dark:border-zinc-800 dark:bg-zinc-900"
        role="grid"
        aria-label="Fifteen Puzzle board"
      >
        {state.tiles.map((tile, index) => {
          if (tile === null) {
            return (
              <div
                key="blank"
                role="gridcell"
                aria-label="Empty space"
                className="aspect-square rounded-lg border border-dashed border-zinc-300 bg-white/50 dark:border-zinc-700 dark:bg-zinc-950/40"
              />
            );
          }

          const movable = movableTiles.has(tile);
          const correct = tile === index + 1;

          return (
            <button
              key={tile}
              type="button"
              role="gridcell"
              disabled={!movable}
              aria-label={`Tile ${tile}${movable ? ", movable" : ""}${correct ? ", correct position" : ""}`}
              className={[
                "aspect-square min-h-11 rounded-lg border text-xl font-semibold transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 sm:text-2xl",
                correct
                  ? "border-zinc-400 bg-zinc-200 text-zinc-950 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  : "border-zinc-700 bg-zinc-900 text-white dark:border-zinc-300 dark:bg-zinc-100 dark:text-zinc-950",
                movable ? "cursor-pointer hover:-translate-y-0.5" : "cursor-default opacity-80",
              ].join(" ")}
              onClick={() => slide(tile)}
            >
              {tile}
            </button>
          );
        })}
      </div>

      <aside className="space-y-5 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</p>
          <p className="mt-1 text-lg font-semibold" aria-live="polite">
            {status === "solved" ? "Puzzle solved" : status === "invalid" ? "Invalid position" : "Arrange 1 through 15"}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Slide a numbered tile into the empty space until the tiles are ordered left-to-right, top-to-bottom. The fixture is a reproducible legal scramble.
          </p>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Moves:</span> {session.moveCount}
        </p>

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
            className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:hover:bg-zinc-900"
            onClick={restart}
          >
            Restart
          </button>
        </div>
      </aside>
    </section>
  );
}
