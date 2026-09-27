import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { FifteenPuzzleGame } from "../../components/FifteenPuzzleGame";
import { LightsOutGame } from "../../components/LightsOutGame";
import { MastermindGame } from "../../components/MastermindGame";
import { NonogramGame } from "../../components/NonogramGame";
import { PegSolitaireGame } from "../../components/PegSolitaireGame";
import { SokobanGame } from "../../components/SokobanGame";
import { SudokuGame } from "../../components/SudokuGame";
import { TowerOfHanoiGame } from "../../components/TowerOfHanoiGame";
import { games, getGame, type GameId } from "../games";

const gameComponents: Record<GameId, ComponentType> = {
  sudoku: SudokuGame,
  "lights-out": LightsOutGame,
  "tower-of-hanoi": TowerOfHanoiGame,
  "fifteen-puzzle": FifteenPuzzleGame,
  nonogram: NonogramGame,
  mastermind: MastermindGame,
  sokoban: SokobanGame,
  "peg-solitaire": PegSolitaireGame,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.id }));
}

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ gameId: string }>;
}>): Promise<Metadata> {
  const { gameId } = await params;
  const game = getGame(gameId);

  if (!game) {
    return {};
  }

  return {
    title: `${game.name} | Puzzle Game Core`,
    description: game.description,
  };
}

export default async function GamePage({
  params,
}: Readonly<{
  params: Promise<{ gameId: string }>;
}>) {
  const { gameId } = await params;
  const game = getGame(gameId);

  if (!game) {
    notFound();
  }

  const Game = gameComponents[game.id];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-12">
      <header className="space-y-4">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-medium text-zinc-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:text-zinc-400"
        >
          ← All games
        </Link>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{game.category}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{game.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {game.description}
          </p>
        </div>
      </header>

      <Game />
    </main>
  );
}
