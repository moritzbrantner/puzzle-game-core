"use client";

import { useState } from "react";
import {
  beginnerHanoi,
  createInitialHanoiState,
  getMinimumHanoiMoveCount,
  towerOfHanoiGame,
  type HanoiState,
} from "@puzzle-game-core/tower-of-hanoi";

export function TowerOfHanoiGame() {
  const [state, setState] = useState<HanoiState>(() => createInitialHanoiState(beginnerHanoi));
  const [history, setHistory] = useState<HanoiState[]>([]);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);

  const status = towerOfHanoiGame.getStatus(beginnerHanoi, state);
  const minimumMoves = getMinimumHanoiMoveCount(beginnerHanoi);

  function selectPeg(pegIndex: number) {
    if (selectedPeg === null) {
      if (state.pegs[pegIndex].length > 0) {
        setSelectedPeg(pegIndex);
      }
      return;
    }

    if (selectedPeg === pegIndex) {
      setSelectedPeg(null);
      return;
    }

    const next = towerOfHanoiGame.applyMove(beginnerHanoi, state, {
      type: "move",
      from: selectedPeg,
      to: pegIndex,
    });

    if (next !== state) {
      setHistory((current) => [...current.slice(-99), state]);
      setState(next);
      setSelectedPeg(null);
    }
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) {
      return;
    }

    setHistory((current) => current.slice(0, -1));
    setState(previous);
    setSelectedPeg(null);
  }

  function restart() {
    setState(createInitialHanoiState(beginnerHanoi));
    setHistory([]);
    setSelectedPeg(null);
  }

  return (
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,42rem)_minmax(14rem,1fr)] lg:items-start">
      <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-4" role="group" aria-label="Tower of Hanoi pegs">
        {state.pegs.map((peg, pegIndex) => {
          const selected = selectedPeg === pegIndex;
          const topDisk = peg.at(-1);

          return (
            <button
              key={pegIndex}
              type="button"
              aria-pressed={selected}
              aria-label={`Peg ${pegIndex + 1}${topDisk ? `, top disk ${topDisk}` : ", empty"}${selected ? ", selected" : ""}`}
              className={[
                "min-w-0 rounded-xl border p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 sm:p-4",
                selected
                  ? "border-zinc-900 bg-zinc-100 ring-2 ring-zinc-900 dark:border-zinc-100 dark:bg-zinc-900 dark:ring-zinc-100"
                  : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900",
              ].join(" ")}
              onClick={() => selectPeg(pegIndex)}
            >
              <div className="relative flex h-52 items-end justify-center sm:h-64">
                <div className="absolute bottom-2 top-4 w-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                <div className="relative z-10 flex w-full flex-col-reverse items-center gap-1 pb-2">
                  {peg.map((disk) => (
                    <div
                      key={disk}
                      className="flex h-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-xs font-bold text-white shadow-sm dark:border-zinc-300 dark:bg-zinc-200 dark:text-zinc-950 sm:h-9"
                      style={{ width: `${36 + (disk / beginnerHanoi.diskCount) * 56}%` }}
                    >
                      {disk}
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-500" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Peg {pegIndex + 1}</p>
            </button>
          );
        })}
      </div>

      <aside className="space-y-5 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</p>
          <p className="mt-1 text-lg font-semibold" aria-live="polite">
            {status === "solved" ? "Tower complete" : selectedPeg === null ? "Choose a source peg" : `Move from peg ${selectedPeg + 1}`}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Move the full tower to peg 3. Only the top disk can move, and a larger disk can never sit on a smaller one.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
            <p className="text-zinc-500">Moves</p>
            <p className="mt-1 font-semibold">{history.length}</p>
          </div>
          <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
            <p className="text-zinc-500">Minimum</p>
            <p className="mt-1 font-semibold">{minimumMoves}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={history.length === 0}
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
