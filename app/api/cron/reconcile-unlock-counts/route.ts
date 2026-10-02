import { NextRequest, NextResponse } from "next/server";
import type { Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UNLOCK_THRESHOLD } from "@/lib/config";
import { requireCronSecret } from "@/lib/cronAuth";

/**
 * Recomputes CityUnlockStatus.count from the User table (source of truth),
 * to catch drift. Never un-unlocks a city that has already unlocked, even if
 * its count has since dipped below the threshold (e.g. via account deletions).
 */
export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const grouped = await prisma.user.groupBy({
    by: ["city", "gender"],
    where: { csvUploadedAt: { not: null }, city: { not: null }, gender: { not: null } },
    _count: { _all: true },
  });

  let updated = 0;
  for (const g of grouped) {
    const city = g.city!;
    const gender = g.gender as Gender;
    const count = g._count._all;

    const existing = await prisma.cityUnlockStatus.findUnique({ where: { city_gender: { city, gender } } });
    const alreadyUnlocked = existing?.unlockedAt != null;
    const nowUnlocked = alreadyUnlocked || count >= UNLOCK_THRESHOLD;

    await prisma.cityUnlockStatus.upsert({
      where: { city_gender: { city, gender } },
      create: { city, gender, count, threshold: UNLOCK_THRESHOLD, unlockedAt: nowUnlocked ? new Date() : null },
      update: { count, unlockedAt: alreadyUnlocked ? existing!.unlockedAt : nowUnlocked ? new Date() : null },
    });
    updated += 1;
  }

  return NextResponse.json({ reconciled: updated });
}
