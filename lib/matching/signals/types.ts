export interface UserReadingContext {
  userId: string;
  /** bookId -> myRating, for books on the READ shelf that have a rating */
  ratedBooks: Map<string, number>;
  /** bookId set for all books on the READ shelf, rated or not */
  readBookIds: Set<string>;
  /** normalized shelf/tag set, excluding administrative shelves like read/to-read/currently-reading */
  shelfTags: Set<string>;
}

export interface SignalResult {
  /** normalized 0..1, higher = more similar */
  score: number;
  meta: Record<string, unknown>;
}

export interface MatchSignal {
  name: string;
  /** default relative weight; see lib/matching/weights.ts to override */
  weight: number;
  /** returns null when there isn't enough shared data for this signal to be meaningful */
  compute(a: UserReadingContext, b: UserReadingContext): SignalResult | null;
}
