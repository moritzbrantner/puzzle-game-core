"use client";

import { hanoiLevels } from "@puzzle-game-core/tower-of-hanoi";
import { lightsOutLevels } from "@puzzle-game-core/lights-out";
import { mastermindLevels } from "@puzzle-game-core/mastermind";
import { nonogramLevels } from "@puzzle-game-core/nonogram";
import { pegSolitaireLevels } from "@puzzle-game-core/peg-solitaire";
import { fifteenPuzzleLevels } from "@puzzle-game-core/sliding-puzzle";
import { sokobanLevels } from "@puzzle-game-core/sokoban";
import { sudokuLevels } from "@puzzle-game-core/sudoku";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import type { GameId } from "../app/games";
import { FifteenPuzzleGame } from "./FifteenPuzzleGame";
import { LightsOutGame } from "./LightsOutGame";
import { MastermindGame } from "./MastermindGame";
import { NonogramGame } from "./NonogramGame";
import { PegSolitaireGame } from "./PegSolitaireGame";
import { SokobanGame } from "./SokobanGame";
import { SudokuGame } from "./SudokuGame";
import { TowerOfHanoiGame } from "./TowerOfHanoiGame";

type LevelOption = Readonly<{
  id: string;
  detail: string;
  render: () => ReactNode;
}>;

function levelOptions(gameId: GameId): readonly LevelOption[] {
  switch (gameId) {
    case "sudoku":
      return sudokuLevels.map((puzzle, index) => ({
        id: puzzle.id,
        detail: `Classic ${String.fromCharCode(65 + index)}`,
        render: () => <SudokuGame key={puzzle.id} puzzle={puzzle} />,
      }));
    case "lights-out":
      return lightsOutLevels.map((puzzle, index) => ({
        id: puzzle.id,
        detail: `${[5, 8, 13][index]} presses`,
        render: () => <LightsOutGame key={puzzle.id} puzzle={puzzle} />,
      }));
    case "tower-of-hanoi":
      return hanoiLevels.map((puzzle) => ({
        id: puzzle.id,
        detail: `${puzzle.diskCount} disks`,
        render: () => <TowerOfHanoiGame key={puzzle.id} puzzle={puzzle} />,
      }));
    case "fifteen-puzzle":
      return fifteenPuzzleLevels.map((puzzle, index) => ({
        id: puzzle.id,
        detail: `${[6, 12, 20][index]}-move scramble`,
        render: () => <FifteenPuzzleGame key={puzzle.id} puzzle={puzzle} />,
      }));
    case "nonogram":
      return nonogramLevels.map((puzzle) => ({
        id: puzzle.id,
        detail: `${puzzle.width}×${puzzle.height}`,
        render: () => <NonogramGame key={puzzle.id} puzzle={puzzle} />,
      }));
    case "mastermind":
      return mastermindLevels.map((puzzle) => ({
        id: puzzle.id,
        detail: `${puzzle.slots} slots`,
        render: () => <MastermindGame key={puzzle.id} puzzle={puzzle} />,
      }));
    case "sokoban":
      return sokobanLevels.map((puzzle) => ({
        id: puzzle.id,
        detail: `${puzzle.initialCrates.length} crate${puzzle.initialCrates.length === 1 ? "" : "s"}`,
        render: () => <SokobanGame key={puzzle.id} puzzle={puzzle} />,
      }));
    case "peg-solitaire":
      return pegSolitaireLevels.map((puzzle, index) => ({
        id: puzzle.id,
        detail: ["1 jump", "2 jumps", "Full board"][index],
        render: () => <PegSolitaireGame key={puzzle.id} puzzle={puzzle} />,
      }));
  }
}

function parseLevel(value: string | null, levelCount: number): number {
  if (value === null) {
    return 0;
  }

  const level = Number(value);
  return Number.isInteger(level) && level >= 1 && level <= levelCount ? level - 1 : 0;
}

export function GameLevels({ gameId }: Readonly<{ gameId: GameId }>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const options = levelOptions(gameId);
  const selectedIndex = parseLevel(searchParams.get("level"), options.length);
  const selected = options[selectedIndex];

  function selectLevel(index: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (index === 0) {
      params.delete("level");
    } else {
      params.set("level", String(index + 1));
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2" aria-label="Puzzle level">
        <span className="mr-1 text-sm font-semibold text-zinc-600 dark:text-zinc-400">Level</span>
        {options.map((option, index) => {
          const active = selectedIndex === index;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              className={[
                "min-h-11 rounded-lg border px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
                active
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                  : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
              ].join(" ")}
              onClick={() => selectLevel(index)}
            >
              <span className="font-semibold">{index + 1}</span>
              <span className={`ml-2 ${active ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500"}`}>
                {option.detail}
              </span>
            </button>
          );
        })}
      </div>

      {selected.render()}
    </div>
  );
}
