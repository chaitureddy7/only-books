import type { MatchSignal } from "@/lib/matching/signals/types";

const shelfOverlap: MatchSignal = {
  name: "shelfOverlap",
  weight: 0.2,
  compute(a, b) {
    if (a.shelfTags.size === 0 || b.shelfTags.size === 0) return null;

    let intersection = 0;
    for (const tag of a.shelfTags) {
      if (b.shelfTags.has(tag)) intersection += 1;
    }
    if (intersection === 0) return null;

    const union = a.shelfTags.size + b.shelfTags.size - intersection;
    return { score: intersection / union, meta: { sharedTags: intersection, union } };
  },
};

export default shelfOverlap;
