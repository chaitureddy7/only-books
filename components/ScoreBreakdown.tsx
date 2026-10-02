type Breakdown = Record<string, { score: number; [key: string]: unknown } | null>;

const SIGNAL_LABELS: Record<string, string> = {
  bookOverlap: "Shared books",
  ratingCorrelation: "Similar ratings",
  shelfOverlap: "Shared shelves/genres",
};

export default function ScoreBreakdown({ breakdown }: { breakdown: Breakdown }) {
  return (
    <ul className="space-y-1 text-sm">
      {Object.entries(breakdown).map(([signal, result]) => (
        <li key={signal} className="flex items-center justify-between">
          <span className="text-zinc-600 dark:text-zinc-400">
            {SIGNAL_LABELS[signal] ?? signal}
          </span>
          <span className="font-medium">
            {result ? `${Math.round(result.score * 100)}%` : "not enough data"}
          </span>
        </li>
      ))}
    </ul>
  );
}
