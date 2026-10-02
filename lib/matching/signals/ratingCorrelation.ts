import type { MatchSignal } from "@/lib/matching/signals/types";
import { MIN_CO_RATED_FOR_CORRELATION } from "@/lib/config";

function pearson(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;

  let cov = 0;
  let varX = 0;
  let varY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    cov += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }
  if (varX === 0 || varY === 0) return null;
  return cov / Math.sqrt(varX * varY);
}

const ratingCorrelation: MatchSignal = {
  name: "ratingCorrelation",
  weight: 0.3,
  compute(a, b) {
    const xs: number[] = [];
    const ys: number[] = [];
    for (const [bookId, ratingA] of a.ratedBooks) {
      const ratingB = b.ratedBooks.get(bookId);
      if (ratingB != null) {
        xs.push(ratingA);
        ys.push(ratingB);
      }
    }

    if (xs.length < MIN_CO_RATED_FOR_CORRELATION) return null;

    const r = pearson(xs, ys);
    if (r === null) return null;

    return { score: (r + 1) / 2, meta: { coRatedBooks: xs.length, pearson: r } };
  },
};

export default ratingCorrelation;
