import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ALGO_VERSION } from "@/lib/matching/weights";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import InterestButton from "@/components/InterestButton";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchUserId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;
  const { matchUserId } = await params;

  const [userAId, userBId] = userId < matchUserId ? [userId, matchUserId] : [matchUserId, userId];
  const matchScore = await prisma.matchScore.findUnique({
    where: { userAId_userBId_algoVersion: { userAId, userBId, algoVersion: ALGO_VERSION } },
  });
  if (!matchScore) notFound();

  const other = await prisma.user.findUnique({ where: { id: matchUserId } });
  if (!other) notFound();

  const sharedBooks = await prisma.$queryRaw<{ title: string; author: string }[]>`
    SELECT b.title, b.author
    FROM "UserBook" ub1
    JOIN "UserBook" ub2 ON ub1."bookId" = ub2."bookId"
    JOIN "Book" b ON b.id = ub1."bookId"
    WHERE ub1."userId" = ${userId}
      AND ub2."userId" = ${matchUserId}
      AND ub1."exclusiveShelf" = 'READ'
      AND ub2."exclusiveShelf" = 'READ'
    LIMIT 5
  `;

  const breakdown = matchScore.breakdown as Record<string, { score: number } | null>;

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{other.name ?? "A fellow reader"}</h1>
      <p className="mt-1 text-3xl font-bold">{Math.round(matchScore.score * 100)}% match</p>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Score breakdown</h2>
        <div className="mt-2">
          <ScoreBreakdown breakdown={breakdown} />
        </div>
      </div>

      {sharedBooks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Books you both read</h2>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {sharedBooks.map((b) => (
              <li key={`${b.title}-${b.author}`}>
                {b.title} — {b.author}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10">
        <InterestButton toUserId={other.id} />
      </div>
    </main>
  );
}
