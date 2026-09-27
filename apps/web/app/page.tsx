import Link from "next/link";
import { games } from "./games";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Puzzle games</h1>
      </header>

      <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Games">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/${game.id}`}
            className="rounded-xl border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{game.category}</span>
            <span className="mt-1 block text-lg font-semibold">{game.name}</span>
            <span className="mt-1 block text-sm leading-5 text-zinc-600 dark:text-zinc-400">{game.description}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
