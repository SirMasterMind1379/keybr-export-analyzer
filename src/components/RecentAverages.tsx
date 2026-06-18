"use client";

import type { ProcessedLesson } from "@/lib/types";
import { computeRecentAverages } from "@/lib/parser";

/**
 * Three summary cards displaying average WPM, accuracy, lesson count,
 * and total practice time for All Time, Last 50, and Last 20 lessons.
 *
 * Each card is a flat block with the theme's beige / dark-warm palette
 * and no rounded corners.
 */
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
        <div key={r.label} className="border border-beige-dark p-4 bg-beige-light dark:bg-[#3D3226] dark:border-[#5A4A3A]">
          <h3 className="text-sm font-medium text-warm-gray mb-2">{r.label}</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-warm-gray-light">WPM:</span> <span className="font-semibold text-warm-brown dark:text-beige">{r.d.avgWpm}</span></p>
            <p><span className="text-warm-gray-light">Accuracy:</span> <span className="font-semibold text-warm-brown dark:text-beige">{r.d.avgAccuracy}%</span></p>
            <p><span className="text-warm-gray-light">Lessons:</span> <span className="text-warm-brown dark:text-beige">{r.d.lessonCount.toLocaleString()}</span></p>
            <p><span className="text-warm-gray-light">Time:</span> <span className="text-warm-brown dark:text-beige">{r.d.totalTimeMin}m</span></p>
          </div>
        </div>
      ))}
    </div>
  );
}
