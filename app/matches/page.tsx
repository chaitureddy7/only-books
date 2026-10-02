import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCityUnlocked } from "@/lib/unlock/cityUnlock";
import { ALGO_VERSION } from "@/lib/matching/weights";
import { TOP_MATCHES_LIMIT } from "@/lib/config";
import MatchCard from "@/components/MatchCard";

type Breakdown = Record<string, { score: number; sharedBooks?: number } | null>;

export default async function MatchesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.csvUploadedAt) redirect("/onboarding");
  if (!user.city || !user.gender || !(await isCityUnlocked(user.city, user.gender))) {
    redirect("/onboarding/waitlist");
  }

  const rows = await prisma.matchScore.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }], algoVersion: ALGO_VERSION },
    orderBy: { score: "desc" },
    take: TOP_MATCHES_LIMIT,
  });

  const otherIds = rows.map((r) => (r.userAId === userId ? r.userBId : r.userAId));
  const others = await prisma.user.findMany({ where: { id: { in: otherIds } } });
  const othersById = new Map(others.map((u) => [u.id, u]));

  const matches = rows
    .map((r) => {
      const otherId = r.userAId === userId ? r.userBId : r.userAId;
      const other = othersById.get(otherId);
      if (!other) return null;
      const breakdown = r.breakdown as Breakdown;
      return {
        id: other.id,
        name: other.name ?? "A fellow reader",
        score: r.score,
        sharedBooks: breakdown.bookOverlap?.sharedBooks ?? 0,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Your top matches</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Ranked by how closely your reading overlaps in {user.city}.
      </p>

      <div className="mt-8 space-y-3">
        {matches.length === 0 && (
          <p className="text-sm text-zinc-500">
            No matches yet — check back as more people in your city upload their library.
          </p>
        )}
        {matches.map((m) => (
          <MatchCard key={m.id} id={m.id} name={m.name} score={m.score} sharedBooks={m.sharedBooks} />
        ))}
      </div>
    </main>
  );
}
