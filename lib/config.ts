function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const UNLOCK_THRESHOLD = envInt("UNLOCK_THRESHOLD", 250);
export const MIN_OVERLAP = envInt("MIN_OVERLAP", 2);
export const POPULAR_BOOK_CAP = envInt("POPULAR_BOOK_CAP", 100);
export const MIN_CO_RATED_FOR_CORRELATION = envInt("MIN_CO_RATED_FOR_CORRELATION", 3);
export const TOP_MATCHES_LIMIT = 10;
export const MIN_SIGNUP_AGE_YEARS = 18;
