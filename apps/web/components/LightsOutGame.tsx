"use client";

import { useState } from "react";
import {
  beginnerLightsOut,
  createInitialLightsOutState,
  lightsOutGame,
  type LightsOutState,
} from "@puzzle-game-core/lights-out";

export function LightsOutGame() {
  const [state, setState] = useState<LightsOutState>(() => createInitialLightsOutState(beginnerLightsOut));
  const [history, setHistory] = useState<LightsOutState[]>([]);

  const status = lightsOutGame.getStatus(beginnerLightsOut, state);
  const litCount = state.cells.filter(Boolean).length;

  function press(index: number) {
    const next = lightsOutGame.applyMove(beginnerLightsOut, state, { type: "toggle", index });
    if (next === state) {
      return;
    }

    setHistory((current) => [...current.slice(-99), state]);
    setState(next);
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) {
      return;
    }

    setHistory((current) => current.slice(0, -1));
    setState(previous);
  }

  function restart() {
    setState(createInitialLightsOutState(beginnerLightsOut));
    setHistory([]);
  }

  return (
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,34rem)_minmax(14rem,1fr)] lg:items-start">
      <div className="min-w-0 space-y-4">
        <div
          className="grid aspect-square w-full max-w-[34rem] gap-2 rounded-xl border border-zinc-200 bg-zinc-100 p-3 dark:border-zinc-800 dark:bg-zinc-900"
          role="grid"
          aria-label="Lights Out board"
          style={{ gridTemplateColumns: `repeat(${beginnerLightsOut.width}, minmax(0, 1fr))` }}
        >
          {state.cells.map((lit, index) => {
            const row = Math.floor(index / beginnerLightsOut.width);
            const column = index % beginnerLightsOut.width;

            return (
              <button
                key={index}
                type="button"
                role="gridcell"
                aria-label={`Row ${row + 1}, column ${column + 1}, ${lit ? "on" : "off"}`}
                aria-pressed={lit}
                className={[
                  "aspect-square min-h-11 rounded-lg border text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
                  lit
                    ? "border-amber-300 bg-amber-300 text-amber-950 shadow-[0_0_24px_rgba(252,211,77,0.45)] hover:bg-amber-200 dark:border-amber-300 dark:bg-amber-300"
                    : "border-zinc-300 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-800",
                ].join(" ")}
                onClick={() => press(index)}
              >
                {lit ? "On" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="space-y-5 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</p>
          <p className="mt-1 text-lg font-semibold" aria-live="polite">
            {status === "solved" ? "All lights are out" : `${litCount} light${litCount === 1 ? "" : "s"} on`}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Pressing a tile flips that light and its orthogonal neighbors. Turn every light off.
          </p>
        </div>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Moves:</span> {history.length}
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
