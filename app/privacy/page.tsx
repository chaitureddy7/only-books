export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Privacy (draft)</h1>
      <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        This page is a placeholder describing how the app is engineered to handle your data.
        It is not a final legal privacy policy — that text needs review by Compliance/Legal
        before real launch.
      </p>

      <section className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
          What we collect
        </h2>
        <p>
          Your name, gender, date of birth, matching intent, city, and pincode (all provided by
          you at sign-up), plus the book, author, rating, and shelf data from the Goodreads
          export you upload. We do not collect precise location (no GPS) and we do not store the
          free-text review text from your export.
        </p>
      </section>

      <section className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
          How it&apos;s used
        </h2>
        <p>
          Solely to compute reading-taste similarity with other users in your city and to show
          you (and them) a ranked match list, subject to the matching intent and preferences you
          set. The uploaded file itself is parsed and then discarded, not stored long-term.
        </p>
      </section>

      <section className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
          Deleting your data
        </h2>
        <p>
          You can permanently delete your account and all associated data (your profile, books,
          match scores, and expressed interests) at any time from your account settings.
        </p>
      </section>
    </main>
  );
}
