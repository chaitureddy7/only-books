"use server";

import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrementCityCount } from "@/lib/unlock/cityUnlock";

export async function deleteAccountAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/");

  await prisma.$transaction(async (tx) => {
    if (user.csvUploadedAt && user.city && user.gender) {
      await decrementCityCount(user.city, user.gender, tx);
    }
    // UserBook, MatchScore, Interest, Session, Account rows cascade via onDelete: Cascade.
    await tx.user.delete({ where: { id: user.id } });
  });

  await signOut({ redirectTo: "/" });
}
