"use client";

import { useActionState } from "react";
import { sendMagicLink, type SignInFormState } from "@/server/actions/auth";

const initialState: SignInFormState = {};

export default function SignInPage() {
  const [state, formAction, pending] = useActionState(sendMagicLink, initialState);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          We&apos;ll email you a one-time link — no password needed.
        </p>
      </div>

      {state.sent ? (
        <p className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          Check your email for a sign-in link. (In local development, it&apos;s logged to the
          server console instead of actually being sent.)
        </p>
      ) : (
        <form action={formAction} className="space-y-3">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {pending ? "Sending…" : "Send sign-in link"}
          </button>
        </form>
      )}
    </main>
  );
}
