import Link from "next/link";

export default function MatchCard({
  id,
  name,
  score,
  sharedBooks,
}: {
  id: string;
  name: string;
  score: number;
  sharedBooks: number;
}) {
  return (
    <Link
      href={`/matches/${id}`}
      className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
    >
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-zinc-500">{sharedBooks} shared books</p>
      </div>
      <span className="text-lg font-semibold">{Math.round(score * 100)}%</span>
    </Link>
  );
}
