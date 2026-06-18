"use client";

import type { ProcessedLesson } from "@/lib/types";
import { computeRecentAverages } from "@/lib/parser";

/** Three summary cards showing WPM/accuracy for all-time, last 50, and last 20 lessons */
export function RecentAverages({ lessons }: { lessons: ProcessedLesson[] }) {
  const last20 = computeRecentAverages(lessons, 20);
  const last50 = computeRecentAverages(lessons, 50);
  const all = computeRecentAverages(lessons, lessons.length);

  const rows = [
    { label: "All Time", d: all },
    { label: "Last 50", d: last50 },
    { label: "Last 20", d: last20 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {rows.map((r) => r.d && (
        <div key={r.label} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-500 mb-2">{r.label}</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-zinc-400">WPM:</span> <span className="font-semibold">{r.d.avgWpm}</span></p>
            <p><span className="text-zinc-400">Accuracy:</span> <span className="font-semibold">{r.d.avgAccuracy}%</span></p>
            <p><span className="text-zinc-400">Lessons:</span> {r.d.lessonCount.toLocaleString()}</p>
            <p><span className="text-zinc-400">Time:</span> {r.d.totalTimeMin}m</p>
          </div>
        </div>
      ))}
    </div>
  );
}
