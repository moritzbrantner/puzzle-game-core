"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  beginnerSudoku,
  createInitialSudokuState,
  getConflictingCells,
  isGivenCell,
  restoreSudokuState,
  sudokuGame,
  type SudokuCell,
  type SudokuDigit,
  type SudokuState,
} from "@puzzle-game-core/sudoku";

const STORAGE_KEY = "puzzle-game-core:sudoku:classic-easy-1:v1";
const DIGITS: SudokuDigit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function cellCoordinates(index: number): { row: number; column: number } {
  return { row: Math.floor(index / 9), column: index % 9 };
}

export function SudokuGame() {
  const [state, setState] = useState<SudokuState>(() => createInitialSudokuState(beginnerSudoku));
  const [history, setHistory] = useState<SudokuState[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(2);
  const [persistenceReady, setPersistenceReady] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const status = sudokuGame.getStatus(beginnerSudoku, state);
  const conflicts = useMemo(() => getConflictingCells(state), [state]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { cells?: unknown };
        const restored = restoreSudokuState(beginnerSudoku, parsed.cells);
        if (restored) {
          setState(restored);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setPersistenceReady(true);
    }
  }, []);

  useEffect(() => {
    if (!persistenceReady) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cells: state.cells }));
  }, [persistenceReady, state]);

  function commit(value: SudokuCell) {
    const next = sudokuGame.applyMove(beginnerSudoku, state, {
      type: "set-cell",
      index: selectedIndex,
      value,
    });

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
    setState(createInitialSudokuState(beginnerSudoku));
    setHistory([]);
    setSelectedIndex(2);
    boardRef.current?.focus();
  }

  function moveSelection(rowDelta: number, columnDelta: number) {
    const { row, column } = cellCoordinates(selectedIndex);
    const nextRow = Math.max(0, Math.min(8, row + rowDelta));
    const nextColumn = Math.max(0, Math.min(8, column + columnDelta));
    setSelectedIndex(nextRow * 9 + nextColumn);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key >= "1" && event.key <= "9") {
      event.preventDefault();
      commit(Number(event.key) as SudokuDigit);
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
      event.preventDefault();
      commit(null);
      return;
    }

    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const delta = moves[event.key];
    if (delta) {
      event.preventDefault();
      moveSelection(...delta);
    }
  }

  return (
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,34rem)_minmax(14rem,1fr)] lg:items-start">
      <div className="min-w-0 space-y-4">
        <div
          ref={boardRef}
          className="grid aspect-square w-full max-w-[34rem] grid-cols-9 overflow-hidden rounded-xl border-2 border-zinc-900 bg-zinc-900 outline-none focus-visible:ring-4 focus-visible:ring-zinc-400/50 dark:border-zinc-100 dark:bg-zinc-100"
          role="grid"
          aria-label="Sudoku board"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {state.cells.map((value, index) => {
            const { row, column } = cellCoordinates(index);
            const given = isGivenCell(beginnerSudoku, index);
            const selected = selectedIndex === index;
            const conflict = conflicts.has(index);
            const sameValue = value !== null && state.cells[selectedIndex] === value;
            const sameGroup =
              row === Math.floor(selectedIndex / 9) ||
              column === selectedIndex % 9 ||
              (Math.floor(row / 3) === Math.floor(Math.floor(selectedIndex / 9) / 3) &&
                Math.floor(column / 3) === Math.floor((selectedIndex % 9) / 3));

            const boxRight = column === 2 || column === 5;
            const boxBottom = row === 2 || row === 5;

            return (
              <button
                key={index}
                type="button"
                role="gridcell"
                aria-label={`Row ${row + 1}, column ${column + 1}${value ? `, ${value}` : ", empty"}${given ? ", given" : ""}`}
                aria-selected={selected}
                className={[
                  "relative flex min-h-0 min-w-0 items-center justify-center border-b border-r border-zinc-300 text-[clamp(1rem,5vw,2rem)] font-medium text-zinc-800 transition-colors dark:border-zinc-700 dark:text-zinc-100",
                  given ? "bg-zinc-100 font-bold dark:bg-zinc-900" : "bg-white dark:bg-zinc-950",
                  sameGroup && !selected ? "bg-zinc-100/90 dark:bg-zinc-900/90" : "",
                  sameValue && !selected ? "bg-zinc-200 dark:bg-zinc-800" : "",
                  selected ? "z-10 bg-zinc-300 ring-2 ring-inset ring-zinc-900 dark:bg-zinc-700 dark:ring-zinc-100" : "",
                  conflict ? "text-red-700 dark:text-red-400" : "",
                  boxRight ? "border-r-2 border-r-zinc-900 dark:border-r-zinc-100" : "",
                  boxBottom ? "border-b-2 border-b-zinc-900 dark:border-b-zinc-100" : "",
                  column === 8 ? "border-r-0" : "",
                  row === 8 ? "border-b-0" : "",
                ].join(" ")}
                onClick={() => {
                  setSelectedIndex(index);
                  boardRef.current?.focus();
                }}
              >
                {value ?? ""}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10" aria-label="Number pad">
          {DIGITS.map((digit) => (
            <button
              key={digit}
              type="button"
              className="min-h-11 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-semibold hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              onClick={() => commit(digit)}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            className="min-h-11 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            onClick={() => commit(null)}
          >
            Clear
          </button>
        </div>
      </div>

      <aside className="space-y-5 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</p>
          <p className="mt-1 text-lg font-semibold" aria-live="polite">
            {status === "solved" ? "Solved" : status === "invalid" ? "Conflict on the board" : "In progress"}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Progress is stored locally in this browser. No account or server is involved.
          </p>
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

        <div className="border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p><strong className="text-zinc-900 dark:text-zinc-100">Keyboard:</strong> arrows move, 1–9 enter a digit, Backspace/Delete clears.</p>
        </div>
      </aside>
    </section>
  );
}
