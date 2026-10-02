import type { Gender, Prisma, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MIN_OVERLAP, POPULAR_BOOK_CAP } from "@/lib/config";
import { SIGNALS, ALGO_VERSION } from "@/lib/matching/weights";
import { buildInvertedIndex, findCandidates } from "@/lib/matching/invertedIndex";
import type { UserReadingContext } from "@/lib/matching/signals/types";

const ADMIN_SHELVES = new Set(["read", "to-read", "currently-reading"]);

function canonicalPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** Users in the same city, in the same intent pool, and — for DATING — mutually gender-compatible. */
async function getCandidatePool(user: User) {
  if (!user.city || !user.intent || !user.gender) return [];

  if (user.intent === "BOOK_BUDDY") {
    return prisma.user.findMany({
      where: {
        id: { not: user.id },
        city: user.city,
        intent: "BOOK_BUDDY",
        csvUploadedAt: { not: null },
      },
    });
  }

  return prisma.user.findMany({
    where: {
      id: { not: user.id },
      city: user.city,
      intent: "DATING",
      csvUploadedAt: { not: null },
      gender: { in: user.preferredGenders },
      preferredGenders: { has: user.gender as Gender },
    },
  });
}

async function buildReadingContexts(userIds: string[]): Promise<Map<string, UserReadingContext>> {
  const userBooks = await prisma.userBook.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, bookId: true, myRating: true, exclusiveShelf: true, bookshelves: true },
  });

  const contexts = new Map<string, UserReadingContext>();
  for (const userId of userIds) {
    contexts.set(userId, { userId, ratedBooks: new Map(), readBookIds: new Set(), shelfTags: new Set() });
  }

  for (const row of userBooks) {
    const ctx = contexts.get(row.userId);
    if (!ctx) continue;

    if (row.exclusiveShelf === "READ") {
      ctx.readBookIds.add(row.bookId);
      if (row.myRating != null) ctx.ratedBooks.set(row.bookId, row.myRating);
    }

    for (const tag of row.bookshelves) {
      if (!ADMIN_SHELVES.has(tag)) ctx.shelfTags.add(tag);
    }
  }

  return contexts;
}

function combineSignals(a: UserReadingContext, b: UserReadingContext) {
  const breakdown: Record<string, unknown> = {};
  let weightedSum = 0;
  let weightTotal = 0;

  for (const signal of SIGNALS) {
    const result = signal.compute(a, b);
    if (result === null) {
      breakdown[signal.name] = null;
      continue;
    }
    breakdown[signal.name] = { score: result.score, ...result.meta };
    weightedSum += signal.weight * result.score;
    weightTotal += signal.weight;
  }

  if (weightTotal === 0) return null;
  return { score: weightedSum / weightTotal, breakdown };
}

/**
 * Scores the given user against their candidate pool and persists MatchScore
 * rows. Runs in O(pool size), not O(pool size squared): candidate discovery
 * goes through an inverted index scoped to the pool, so only pairs sharing at
 * least one (non-overcapped) book are ever fully scored.
 */
export async function computeMatchesForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.city || !user.gender || !user.intent) return;

  const pool = await getCandidatePool(user);
  if (pool.length === 0) return;

  const poolIds = pool.map((u) => u.id);
  const contexts = await buildReadingContexts([userId, ...poolIds]);
  const userContext = contexts.get(userId);
  if (!userContext) return;

  const readBooksByUser = new Map<string, Set<string>>();
  for (const [id, ctx] of contexts) readBooksByUser.set(id, ctx.readBookIds);

  const index = buildInvertedIndex(readBooksByUser, POPULAR_BOOK_CAP);
  const candidates = findCandidates(userId, userContext.readBookIds, index, MIN_OVERLAP);

  for (const candidateId of candidates.keys()) {
    const candidateContext = contexts.get(candidateId);
    if (!candidateContext) continue;

    const combined = combineSignals(userContext, candidateContext);
    if (!combined) continue;

    const [userAId, userBId] = canonicalPair(userId, candidateId);
    await prisma.matchScore.upsert({
      where: { userAId_userBId_algoVersion: { userAId, userBId, algoVersion: ALGO_VERSION } },
      create: {
        userAId,
        userBId,
        algoVersion: ALGO_VERSION,
        score: combined.score,
        breakdown: combined.breakdown as Prisma.InputJsonValue,
      },
      update: {
        score: combined.score,
        breakdown: combined.breakdown as Prisma.InputJsonValue,
        computedAt: new Date(),
      },
    });
  }
}
