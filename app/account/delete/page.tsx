import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { deleteAccountAction } from "@/server/actions/account";

export default async function DeleteAccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Delete your account</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        This permanently deletes your profile, imported books, match scores, and expressed
        interest — for everyone you matched with too. This can&apos;t be undone.
      </p>
      <form action={deleteAccountAction} className="mt-6">
        <button
          type="submit"
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Permanently delete my account
        </button>
      </form>
    </main>
  );
}
