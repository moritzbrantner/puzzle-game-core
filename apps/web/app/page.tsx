import { FifteenPuzzleGame } from "../components/FifteenPuzzleGame";
import { LightsOutGame } from "../components/LightsOutGame";
import { SudokuGame } from "../components/SudokuGame";
import { TowerOfHanoiGame } from "../components/TowerOfHanoiGame";

const games = [
  { id: "sudoku", name: "Sudoku", description: "Place digits without repeating them across rows, columns, or boxes." },
  { id: "lights-out", name: "Lights Out", description: "Toggle neighboring lights until the whole board is dark." },
  { id: "tower-of-hanoi", name: "Tower of Hanoi", description: "Move a stack while never placing a larger disk on a smaller one." },
  { id: "fifteen-puzzle", name: "Fifteen Puzzle", description: "Slide numbered tiles through one empty space until the board is ordered." },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 py-8 sm:px-8 sm:py-12">
      <header className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Deterministic logic games</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Puzzle game core</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Four playable vertical slices exercise the same small headless contracts while keeping each puzzle&apos;s rules and invariants in its own package.
          </p>
        </div>

        <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Games">
          {games.map((game) => (
            <a
              key={game.id}
              href={`#${game.id}`}
              className="rounded-xl border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <span className="font-semibold">{game.name}</span>
              <span className="mt-1 block text-sm leading-5 text-zinc-600 dark:text-zinc-400">{game.description}</span>
            </a>
          ))}
        </nav>
      </header>

      <section id="sudoku" className="scroll-mt-8 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Classic constraint puzzle</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Sudoku</h2>
        </div>
        <SudokuGame />
      </section>

      <section id="lights-out" className="scroll-mt-8 space-y-5 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Toggle puzzle</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Lights Out</h2>
        </div>
        <LightsOutGame />
      </section>

      <section id="tower-of-hanoi" className="scroll-mt-8 space-y-5 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Ordering puzzle</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Tower of Hanoi</h2>
        </div>
        <TowerOfHanoiGame />
      </section>

      <section id="fifteen-puzzle" className="scroll-mt-8 space-y-5 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Permutation puzzle</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Fifteen Puzzle</h2>
        </div>
        <FifteenPuzzleGame />
      </section>
    </main>
  );
}
