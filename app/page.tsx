import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          Meet people through what you read.
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Upload your Goodreads reading history and Kindler matches you with people near you
          whose taste in books looks a lot like yours — same authors, same shelves, same
          ratings on the books you both actually finished.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-200 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">How it works</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Sign in and tell us your gender, age, city and pincode, and what you&apos;re here for — dating or book buddies.</li>
          <li>Export your library from Goodreads and upload the CSV.</li>
          <li>
            Once enough people in your city have joined, you&apos;ll see your top 10 matches,
            ranked by how closely your reading overlaps.
          </li>
        </ol>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-500">
        We only use your gender, age, and location to run this matching — see our{" "}
        <Link href="/privacy" className="underline">
          privacy policy
        </Link>{" "}
        for details, including how to delete your data at any time.
      </p>

      <div>
        <Link
          href="/signin"
          className="inline-flex items-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Get started
        </Link>
      </div>
    </main>
  );
}
