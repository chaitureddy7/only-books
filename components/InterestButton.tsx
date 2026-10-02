"use client";

import { useState, useTransition } from "react";
import { expressInterest } from "@/server/actions/interest";

export default function InterestButton({ toUserId }: { toUserId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ matched: boolean } | null>(null);

  if (result) {
    return (
      <p className="text-sm font-medium">
        {result.matched ? "It's a match! You can now see each other's name here." : "Interest sent."}
      </p>
    );
  }

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => setResult(await expressInterest(toUserId)))}
      className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      {pending ? "Sending…" : "I'm interested"}
    </button>
  );
}
