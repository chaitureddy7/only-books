"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveProfile, type ProfileFormState } from "@/server/actions/profile";

const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "OTHER", label: "Other" },
];

const initialState: ProfileFormState = {};

export default function ProfilePage() {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);
  const [intent, setIntent] = useState<"DATING" | "BOOK_BUDDY">("BOOK_BUDDY");

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Tell us about you</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        This is used only to place you in the right matching pool for your city.
      </p>

      <form action={formAction} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            name="name"
            required
            maxLength={100}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Gender</label>
          <select
            name="gender"
            required
            defaultValue=""
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="" disabled>
              Select one
            </option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Date of birth</label>
          <input
            type="date"
            name="dob"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <p className="mt-1 text-xs text-zinc-500">You must be 18 or older to use Kindler.</p>
        </div>

        <fieldset>
          <legend className="block text-sm font-medium">What are you here for?</legend>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="intent"
                value="BOOK_BUDDY"
                checked={intent === "BOOK_BUDDY"}
                onChange={() => setIntent("BOOK_BUDDY")}
              />
              Book buddies — platonic, any gender
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="intent"
                value="DATING"
                checked={intent === "DATING"}
                onChange={() => setIntent("DATING")}
              />
              Dating — matched within your preferred gender(s)
            </label>
          </div>
        </fieldset>

        {intent === "DATING" && (
          <fieldset>
            <legend className="block text-sm font-medium">Show me matches who are</legend>
            <div className="mt-2 space-y-2">
              {GENDERS.map((g) => (
                <label key={g.value} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="preferredGenders" value={g.value} />
                  {g.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div>
          <label className="block text-sm font-medium">City</label>
          <input
            name="city"
            required
            maxLength={100}
            placeholder="Bangalore"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Pincode</label>
          <input
            name="pincode"
            required
            inputMode="numeric"
            pattern="[1-9][0-9]{5}"
            placeholder="560001"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Used only to rank matches by proximity once your city unlocks.
          </p>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="consent" className="mt-0.5" />
          <span>
            I agree to Kindler using this information to find matches, per the{" "}
            <Link href="/privacy" className="underline" target="_blank">
              privacy policy
            </Link>
            .
          </span>
        </label>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {pending ? "Saving…" : "Continue"}
        </button>
      </form>
    </main>
  );
}
