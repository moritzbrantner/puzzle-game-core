import { SudokuGame } from "../components/SudokuGame";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-12">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">A0 vertical slice</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Sudoku</h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          The board is only a renderer. Puzzle rules live in the headless Sudoku package and can be reused by future mobile and desktop shells.
        </p>
      </header>

      <SudokuGame />
    </main>
  );
}
