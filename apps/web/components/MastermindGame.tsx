"use client";

import {
  applyGameSessionMove,
  canUndoGameSession,
  restartGameSession,
  startGameSession,
  undoGameSession,
} from "@puzzle-game-core/game-session";
import {
  beginnerMastermind,
  mastermindGame,
  type MastermindPeg,
} from "@puzzle-game-core/mastermind";
import { useState } from "react";

const pegClasses: Record<MastermindPeg, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
};

function PegDot({ peg }: Readonly<{ peg: MastermindPeg }>) {
  return <span className={`inline-block size-3 rounded-full ${pegClasses[peg]}`} aria-hidden="true" />;
}

export function MastermindGame() {
  const [session, setSession] = useState(() => startGameSession(mastermindGame, beginnerMastermind));
  const [draft, setDraft] = useState<MastermindPeg[]>(() =>
    Array.from({ length: beginnerMastermind.slots }, () => beginnerMastermind.palette[0]),
  );
  const [activeSlot, setActiveSlot] = useState(0);

  const status = mastermindGame.getStatus(beginnerMastermind, session.state);

  function choosePeg(peg: MastermindPeg) {
    setDraft((current) => {
      const next = [...current];
      next[activeSlot] = peg;
      return next;
    });
    setActiveSlot((current) => (current + 1) % beginnerMastermind.slots);
  }

  function submitGuess() {
    setSession((current) =>
      applyGameSessionMove(mastermindGame, beginnerMastermind, current, {
        type: "submit-guess",
        code: draft,
      }),
    );
  }

  function undo() {
    setSession((current) => undoGameSession(current));
  }

  function restart() {
    setSession(restartGameSession(mastermindGame, beginnerMastermind));
    setDraft(Array.from({ length: beginnerMastermind.slots }, () => beginnerMastermind.palette[0]));
    setActiveSlot(0);
  }

  return (
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,36rem)_minmax(15rem,1fr)] lg:items-start">
      <div className="min-w-0 space-y-5">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Build a {beginnerMastermind.slots}-peg guess. Feedback reports exact positions and correct colors in the wrong position. Repeated colors are counted only once.
          </p>

          <div className="mt-4 flex flex-wrap gap-2" aria-label="Current guess">
            {draft.map((peg, index) => (
              <button
                key={index}
                type="button"
                aria-pressed={activeSlot === index}
                aria-label={`Guess slot ${index + 1}: ${peg}`}
                className={[
                  "flex min-h-11 min-w-24 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
                  activeSlot === index
                    ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900"
                    : "border-zinc-300 dark:border-zinc-700",
                ].join(" ")}
                onClick={() => setActiveSlot(index)}
              >
                <PegDot peg={peg} />
                {peg}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2" aria-label="Peg palette">
            {beginnerMastermind.palette.map((peg) => (
              <button
                key={peg}
                type="button"
                className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:hover:bg-zinc-900"
                onClick={() => choosePeg(peg)}
              >
                <PegDot peg={peg} />
                {peg}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={status === "solved"}
              className="min-h-11 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
              onClick={submitGuess}
            >
              Submit guess
            </button>
            <button
              type="button"
              disabled={!canUndoGameSession(session)}
              className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700"
              onClick={undo}
            >
              Undo
            </button>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold dark:border-zinc-700"
              onClick={restart}
            >
              Restart
            </button>
          </div>
        </div>

        <div className="space-y-2" aria-label="Guess history">
          {session.state.guesses.length === 0 ? (
            <p className="text-sm text-zinc-500">No guesses yet.</p>
          ) : (
            [...session.state.guesses].reverse().map((guess, reverseIndex) => {
              const guessNumber = session.state.guesses.length - reverseIndex;
              return (
                <div
                  key={guessNumber}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-zinc-500">#{guessNumber}</span>
                    <div className="flex gap-2" aria-label={`Guess ${guessNumber}: ${guess.code.join(", ")}`}>
                      {guess.code.map((peg, index) => (
                        <span key={index} className="flex items-center gap-1 text-sm">
                          <PegDot peg={peg} />
                          <span className="sr-only">{peg}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    <strong className="text-zinc-900 dark:text-zinc-100">{guess.feedback.exact}</strong> exact ·{" "}
                    <strong className="text-zinc-900 dark:text-zinc-100">{guess.feedback.colorOnly}</strong> color-only
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <aside className="space-y-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</p>
          <p className="mt-1 text-lg font-semibold" aria-live="polite">
            {status === "solved" ? "Code solved" : status === "invalid" ? "Invalid game state" : "Deduce the code"}
          </p>
        </div>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Guess history and feedback are domain-owned. The web UI receives feedback after each submitted guess and never reads the stored secret directly.
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <strong className="text-zinc-900 dark:text-zinc-100">Guesses:</strong> {session.moveCount}
        </p>
      </aside>
    </section>
  );
}
