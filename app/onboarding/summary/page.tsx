import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function topEntries(counts: Map<string, number>, limit: number): [string, number][] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; skipped?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { imported, skipped } = await searchParams;

  const userBooks = await prisma.userBook.findMany({
    where: { userId: session.user.id, exclusiveShelf: "READ" },
    include: { book: true },
  });

  const authorCounts = new Map<string, number>();
  const shelfCounts = new Map<string, number>();
  for (const ub of userBooks) {
    authorCounts.set(ub.book.author, (authorCounts.get(ub.book.author) ?? 0) + 1);
    for (const shelf of ub.bookshelves) {
      if (["read", "to-read", "currently-reading"].includes(shelf)) continue;
      shelfCounts.set(shelf, (shelfCounts.get(shelf) ?? 0) + 1);
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Your reading profile</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Imported {imported ?? userBooks.length} books
        {skipped && Number(skipped) > 0 ? ` (skipped ${skipped} rows we couldn't read)` : ""} —
        {" "}
        {userBooks.length} marked as read.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Top authors</h2>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {topEntries(authorCounts, 5).map(([author, count]) => (
              <li key={author}>
                {author} <span className="text-zinc-400">×{count}</span>
              </li>
            ))}
            {authorCounts.size === 0 && <li className="text-zinc-400">No read books found</li>}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Top shelves</h2>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {topEntries(shelfCounts, 5).map(([shelf, count]) => (
              <li key={shelf}>
                {shelf} <span className="text-zinc-400">×{count}</span>
              </li>
            ))}
            {shelfCounts.size === 0 && <li className="text-zinc-400">No custom shelves found</li>}
          </ul>
        </div>
      </div>

      <Link
        href="/onboarding"
        className="mt-10 inline-flex items-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Continue
      </Link>
    </main>
  );
}
