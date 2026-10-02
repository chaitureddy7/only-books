"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function expressInterest(toUserId: string): Promise<{ matched: boolean }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const fromId = session.user.id;
  if (fromId === toUserId) throw new Error("Cannot express interest in yourself");

  await prisma.interest.upsert({
    where: { fromId_toId: { fromId, toId: toUserId } },
    create: { fromId, toId: toUserId },
    update: {},
  });

  const reciprocal = await prisma.interest.findUnique({
    where: { fromId_toId: { fromId: toUserId, toId: fromId } },
  });

  let matched = false;
  if (reciprocal) {
    const now = new Date();
    await prisma.$transaction([
      prisma.interest.update({
        where: { fromId_toId: { fromId, toId: toUserId } },
        data: { status: "MATCHED", matchedAt: now },
      }),
      prisma.interest.update({
        where: { fromId_toId: { fromId: toUserId, toId: fromId } },
        data: { status: "MATCHED", matchedAt: now },
      }),
    ]);
    matched = true;
  }

  revalidatePath("/matches");
  return { matched };
}
