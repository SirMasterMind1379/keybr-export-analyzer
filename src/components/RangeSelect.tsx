"use client";

/**
 * The available lesson-range filter options.
 *
 * - `"all"` — display every lesson in the dataset
 * - `1000 | 100 | 50 | 20` — show only the last N lessons
 */
export type Range = "all" | 1000 | 100 | 50 | 20;

const options: { label: string; value: Range }[] = [
  { label: "All", value: "all" },
  { label: "1000", value: 1000 },
  { label: "100", value: 100 },
  { label: "50", value: 50 },
  { label: "20", value: 20 },
];

/**
 * Horizontal button group that controls how many recent lessons are
 * shown in the charts and summary cards.
 *
 * The active button uses the royal-red accent; inactive buttons are
 * styled with the warm-gray palette.
 */
export function RangeSelect({ range, onChange }: { range: Range; onChange: (r: Range) => void }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-warm-gray mr-1">Show:</span>
      {options.map((o) => (
        <button
          key={o.label}
          onClick={() => onChange(o.value)}
          className={`px-2 py-1 transition-colors ${
            range === o.value
              ? "bg-royal-red text-beige"
              : "text-warm-gray hover:text-warm-brown dark:text-warm-gray-light dark:hover:text-beige"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
