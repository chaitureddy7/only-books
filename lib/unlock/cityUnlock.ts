import type { Gender, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UNLOCK_THRESHOLD } from "@/lib/config";

type Db = PrismaClient | Prisma.TransactionClient;

export async function isCityUnlocked(city: string, gender: Gender, db: Db = prisma): Promise<boolean> {
  const status = await db.cityUnlockStatus.findUnique({ where: { city_gender: { city, gender } } });
  return status?.unlockedAt != null;
}

export async function getUnlockProgress(city: string, gender: Gender, db: Db = prisma) {
  const status = await db.cityUnlockStatus.findUnique({ where: { city_gender: { city, gender } } });
  const count = status?.count ?? 0;
  const threshold = status?.threshold ?? UNLOCK_THRESHOLD;
  return { count, threshold, unlocked: status?.unlockedAt != null, remaining: Math.max(threshold - count, 0) };
}

/** Called once, when a user finishes onboarding (profile + CSV upload). Idempotency is the caller's responsibility. */
export async function incrementCityCount(city: string, gender: Gender, db: Db = prisma) {
  const existing = await db.cityUnlockStatus.findUnique({ where: { city_gender: { city, gender } } });
  const nextCount = (existing?.count ?? 0) + 1;
  const alreadyUnlocked = existing?.unlockedAt != null;
  const nowUnlocked = alreadyUnlocked || nextCount >= UNLOCK_THRESHOLD;

  await db.cityUnlockStatus.upsert({
    where: { city_gender: { city, gender } },
    create: {
      city,
      gender,
      count: nextCount,
      threshold: UNLOCK_THRESHOLD,
      unlockedAt: nowUnlocked ? new Date() : null,
    },
    update: {
      count: nextCount,
      unlockedAt: alreadyUnlocked ? existing!.unlockedAt : nowUnlocked ? new Date() : null,
    },
  });

  return { justUnlocked: !alreadyUnlocked && nowUnlocked };
}

/** Called on account deletion for a user who had completed onboarding. Never unlocks a city that has already unlocked. */
export async function decrementCityCount(city: string, gender: Gender, db: Db = prisma) {
  const existing = await db.cityUnlockStatus.findUnique({ where: { city_gender: { city, gender } } });
  if (!existing) return;
  await db.cityUnlockStatus.update({
    where: { city_gender: { city, gender } },
    data: { count: Math.max(existing.count - 1, 0) },
  });
}
