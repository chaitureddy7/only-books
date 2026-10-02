import type { MatchSignal } from "@/lib/matching/signals/types";

const bookOverlap: MatchSignal = {
  name: "bookOverlap",
  weight: 0.5,
  compute(a, b) {
    if (a.readBookIds.size === 0 || b.readBookIds.size === 0) return null;

    let intersection = 0;
    for (const id of a.readBookIds) {
      if (b.readBookIds.has(id)) intersection += 1;
    }
    if (intersection === 0) return null;

    const union = a.readBookIds.size + b.readBookIds.size - intersection;
    return { score: intersection / union, meta: { sharedBooks: intersection, union } };
  },
};

export default bookOverlap;
