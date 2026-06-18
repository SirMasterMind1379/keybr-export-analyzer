"use client";

/** Number-of-lessons filter options for charts */
export type Range = "all" | 1000 | 100 | 50 | 20;

const options: { label: string; value: Range }[] = [
  { label: "All", value: "all" },
  { label: "1000", value: 1000 },
  { label: "100", value: 100 },
  { label: "50", value: 50 },
  { label: "20", value: 20 },
];

/** Button group that selects how many recent lessons to display in charts */
export function RangeSelect({ range, onChange }: { range: Range; onChange: (r: Range) => void }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-zinc-400 mr-1">Show:</span>
      {options.map((o) => (
        <button
          key={o.label}
          onClick={() => onChange(o.value)}
          className={`px-2 py-1 rounded-md transition-colors ${
            range === o.value
              ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
