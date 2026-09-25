"use client";

import {
  beginnerSokoban,
  sokobanGame,
  type SokobanDirection,
} from "@puzzle-game-core/sokoban";
import { useMemo, type KeyboardEvent } from "react";
import { useGameSession } from "../hooks/useGameSession";

const keyDirections: Partial<Record<string, SokobanDirection>> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

export function SokobanGame() {
  const { session, state, canUndo, applyMove, undo, restart } = useGameSession(
    sokobanGame,
    beginnerSokoban,
  );
  const walls = useMemo(() => new Set(beginnerSokoban.walls), []);
  const goals = useMemo(() => new Set(beginnerSokoban.goals), []);
  const crates = useMemo(() => new Set(state.crates), [state.crates]);
  const status = sokobanGame.getStatus(beginnerSokoban, state);

  function move(direction: SokobanDirection) {
    applyMove({ type: "move", direction });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = keyDirections[event.key];
    if (!direction) {
      return;
    }

    event.preventDefault();
    move(direction);
  }

  return (
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,34rem)_minmax(14rem,1fr)] lg:items-start">
      <div className="min-w-0 space-y-4">
        <div
          className="grid aspect-square w-full max-w-[34rem] gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-3 outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
          role="grid"
          aria-label="Sokoban board"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          style={{
            gridTemplateColumns: `repeat(${beginnerSokoban.width}, minmax(0, 1fr))`,
          }}
        >
          {Array.from(
            { length: beginnerSokoban.width * beginnerSokoban.height },
            (_, index) => {
              const wall = walls.has(index);
              const goal = goals.has(index);
              const crate = crates.has(index);
              const player = state.player === index;
              const row = Math.floor(index / beginnerSokoban.width);
              const column = index % beginnerSokoban.width;

              if (wall) {
                return (
                  <div
                    key={index}
                    role="gridcell"
                    aria-label={`Row ${row + 1}, column ${column + 1}, wall`}
                    className="aspect-square rounded-sm bg-zinc-800 dark:bg-zinc-200"
                  />
                );
              }

              return (
                <div
                  key={index}
                  role="gridcell"
                  aria-label={`Row ${row + 1}, column ${column + 1}${goal ? ", goal" : ""}${crate ? ", crate" : ""}${player ? ", player" : ""}`}
                  className={[
                    "relative flex aspect-square items-center justify-center rounded-sm border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
                    goal ? "ring-2 ring-inset ring-amber-400/70" : "",
                  ].join(" ")}
                >
                  {goal ? (
                    <span
                      className="absolute size-2 rounded-full bg-amber-400 sm:size-3"
                      aria-hidden="true"
                    />
                  ) : null}
                  {crate ? (
                    <span
                      className={[
                        "relative z-10 flex size-[70%] items-center justify-center rounded-md border-2 font-bold",
                        goal
                          ? "border-emerald-700 bg-emerald-500 text-emerald-950 dark:border-emerald-300"
                          : "border-amber-800 bg-amber-600 text-white dark:border-amber-300 dark:bg-amber-500 dark:text-amber-950",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      □
                    </span>
                  ) : null}
                  {player ? (
                    <span
                      className="relative z-20 size-[46%] rounded-full bg-blue-600 ring-2 ring-white dark:bg-blue-400 dark:ring-zinc-950"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              );
            },
          )}
        </div>

        <div className="mx-auto grid w-40 grid-cols-3 gap-2" aria-label="Movement controls">
          <div />
          <button
            type="button"
            className="min-h-11 rounded-lg border border-zinc-300 font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            aria-label="Move up"
            onClick={() => move("up")}
          >
            ↑
          </button>
          <div />
          <button
            type="button"
            className="min-h-11 rounded-lg border border-zinc-300 font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            aria-label="Move left"
            onClick={() => move("left")}
          >
            ←
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-zinc-300 font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            aria-label="Move down"
            onClick={() => move("down")}
          >
            ↓
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-zinc-300 font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            aria-label="Move right"
            onClick={() => move("right")}
          >
            →
          </button>
        </div>
      </div>

      <aside className="space-y-5 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</p>
          <p className="mt-1 text-lg font-semibold" aria-live="polite">
            {status === "solved"
              ? "Warehouse solved"
              : status === "invalid"
                ? "Invalid position"
                : "Push both crates onto goals"}
          </p>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Moves:</span>{" "}
          {session.moveCount}
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
