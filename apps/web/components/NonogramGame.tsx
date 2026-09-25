"use client";

import { useGameSession } from "../hooks/useGameSession";
import {
  beginnerNonogram,
  nonogramGame,
  type NonogramCell,
} from "@puzzle-game-core/nonogram";
import { Fragment, useState } from "react";

type MarkingMode = Extract<NonogramCell, "filled" | "crossed">;

function clueLabel(clue: readonly number[]): string {
  return clue.length === 0 ? "0" : clue.join(" ");
}

export function NonogramGame() {
  const { session, state, canUndo, applyMove, undo, restart: restartSession } = useGameSession(
    nonogramGame,
    beginnerNonogram,
  );
  const [mode, setMode] = useState<MarkingMode>("filled");
  const status = nonogramGame.getStatus(beginnerNonogram, state);
  const requiredFilled = beginnerNonogram.rowClues.flat().reduce((sum, run) => sum + run, 0);
  const filledCount = state.cells.filter((cell) => cell === "filled").length;

  function markCell(index: number) {
    const target: NonogramCell = state.cells[index] === mode ? "unknown" : mode;
    applyMove({
      type: "set-cell",
      index,
      value: target,
    });
  }

  function restart() {
    restartSession();
    setMode("filled");
  }

  return (
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,38rem)_minmax(14rem,1fr)] lg:items-start">
      <div className="min-w-0 overflow-x-auto pb-1">
        <div
          className="grid w-full min-w-[19rem] max-w-[38rem] gap-1"
          role="grid"
          aria-label="Nonogram board"
          style={{
            gridTemplateColumns: `minmax(3.5rem, auto) repeat(${beginnerNonogram.width}, minmax(2.75rem, 1fr))`,
          }}
        >
          <div aria-hidden="true" />
          {beginnerNonogram.columnClues.map((clue, column) => (
            <div
              key={`column-${column}`}
              className="flex min-h-16 items-end justify-center pb-2 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400"
              aria-label={`Column ${column + 1} clue: ${clueLabel(clue)}`}
            >
              <span className="whitespace-pre-line">{clue.length === 0 ? "0" : clue.join("\n")}</span>
            </div>
          ))}

          {Array.from({ length: beginnerNonogram.height }, (_, row) => (
            <Fragment key={`row-${row}`}>
              <div
                className="flex min-h-11 items-center justify-end pr-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400"
                aria-label={`Row ${row + 1} clue: ${clueLabel(beginnerNonogram.rowClues[row])}`}
              >
                {clueLabel(beginnerNonogram.rowClues[row])}
              </div>

              {Array.from({ length: beginnerNonogram.width }, (_, column) => {
                const index = row * beginnerNonogram.width + column;
                const cell = state.cells[index];
                const marked = cell !== "unknown";

                return (
                  <button
                    key={index}
                    type="button"
                    role="gridcell"
                    aria-label={`Row ${row + 1}, column ${column + 1}, ${cell}`}
                    aria-pressed={marked}
                    className={[
                      "aspect-square min-h-11 rounded-md border text-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
                      cell === "filled"
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                        : cell === "crossed"
                          ? "border-zinc-300 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                          : "border-zinc-300 bg-white hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900",
                    ].join(" ")}
                    onClick={() => markCell(index)}
                  >
                    {cell === "crossed" ? "×" : ""}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <aside className="space-y-5 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</p>
          <p className="mt-1 text-lg font-semibold" aria-live="polite">
            {status === "solved" ? "Picture complete" : "Use the clues to reveal the picture"}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Each clue gives the lengths of consecutive filled runs in that row or column. Crosses are optional notes for cells you believe are empty.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Marking mode</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={mode === "filled"}
              className={[
                "min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
                mode === "filled"
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                  : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
              ].join(" ")}
              onClick={() => setMode("filled")}
            >
              Fill
            </button>
            <button
              type="button"
              aria-pressed={mode === "crossed"}
              className={[
                "min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
                mode === "crossed"
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                  : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
              ].join(" ")}
              onClick={() => setMode("crossed")}
            >
              Mark empty
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
            <p className="text-zinc-500">Moves</p>
            <p className="mt-1 font-semibold">{session.moveCount}</p>
          </div>
          <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
            <p className="text-zinc-500">Filled</p>
            <p className="mt-1 font-semibold">{filledCount} / {requiredFilled}</p>
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
