import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeMatchesForUser } from "@/lib/matching/engine";
import { requireCronSecret } from "@/lib/cronAuth";

/**
 * Reconciliation/full-rescore safety net — not the primary compute path.
 * Primary scoring runs incrementally at the end of each CSV upload; this
 * exists to catch drift, or to force a full rescore after changing signal
 * weights / bumping ALGO_VERSION in lib/matching/weights.ts.
 */
export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const users = await prisma.user.findMany({
    where: { csvUploadedAt: { not: null } },
    select: { id: true },
  });

  for (const user of users) {
    await computeMatchesForUser(user.id);
  }

  return NextResponse.json({ recomputed: users.length });
}
