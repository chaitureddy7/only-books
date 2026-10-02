import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnlockProgress } from "@/lib/unlock/cityUnlock";

export default async function WaitlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.city || !user.gender) redirect("/onboarding/profile");

  const progress = await getUnlockProgress(user.city, user.gender);
  if (progress.unlocked) redirect("/matches");

  const pct = Math.min(100, Math.round((progress.count / progress.threshold) * 100));

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">You&apos;re on the list</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Matches unlock in {user.city} once {progress.threshold} people of your gender have
        joined. {progress.remaining > 0
          ? `${progress.remaining} more to go.`
          : "Almost there!"}
      </p>

      <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-900 dark:bg-white"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        {progress.count} / {progress.threshold} joined
      </p>
    </main>
  );
}
