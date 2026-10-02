"use client";

import { useActionState } from "react";
import { uploadGoodreadsCsv, type UploadFormState } from "@/server/actions/upload";

const initialState: UploadFormState = {};

export default function UploadPage() {
  const [state, formAction, pending] = useActionState(uploadGoodreadsCsv, initialState);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Import your reading history</h1>

      <div className="mt-4 space-y-2 rounded-md border border-zinc-200 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">How to export from Goodreads</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            On a desktop browser, sign in at{" "}
            <a href="https://www.goodreads.com" className="underline" target="_blank" rel="noreferrer">
              goodreads.com
            </a>{" "}
            (the mobile app doesn&apos;t support export).
          </li>
          <li>Go to My Books, then &quot;Import and Export&quot; under Tools in the left sidebar.</li>
          <li>Click &quot;Export Library&quot; and wait for the export to finish.</li>
          <li>Click the &quot;Your export from …&quot; link that appears to download the CSV.</li>
        </ol>
      </div>

      <form action={formAction} className="mt-8 space-y-4">
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white dark:file:bg-white dark:file:text-black"
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {pending ? "Importing…" : "Upload"}
        </button>
      </form>
    </main>
  );
}
