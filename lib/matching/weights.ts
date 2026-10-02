import type { MatchSignal } from "@/lib/matching/signals/types";
import bookOverlap from "@/lib/matching/signals/bookOverlap";
import ratingCorrelation from "@/lib/matching/signals/ratingCorrelation";
import shelfOverlap from "@/lib/matching/signals/shelfOverlap";

/**
 * Registered match signals. Add a new signal by implementing MatchSignal
 * (see lib/matching/signals/types.ts) and listing it here — the engine
 * combines and renormalizes weights automatically.
 */
export const SIGNALS: MatchSignal[] = [bookOverlap, ratingCorrelation, shelfOverlap];

export const ALGO_VERSION = 1;
