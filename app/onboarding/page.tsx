import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCityUnlocked } from "@/lib/unlock/cityUnlock";

/** Routes a signed-in user to whichever onboarding step (or /matches) they belong at. */
export default async function OnboardingResolverPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/signin");

  if (!user.profileCompletedAt) redirect("/onboarding/profile");
  if (!user.csvUploadedAt) redirect("/onboarding/upload");

  const unlocked = user.city && user.gender ? await isCityUnlocked(user.city, user.gender) : false;
  redirect(unlocked ? "/matches" : "/onboarding/waitlist");
}
