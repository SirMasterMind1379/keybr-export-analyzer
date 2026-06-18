"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { ProcessedLesson } from "@/lib/types";
import { linearRegression } from "@/lib/parser";

/**
 * Line chart of accuracy percentage over lesson index.
 *
 * Shows:
 * - Individual accuracy data points (green line, no dots for performance)
 * - Linear regression trend line (amber dashed) with slope annotation
 * - Average accuracy reference line (gray dashed) with label
 * - Y-axis locked to 80-100% range for readability
 */
export function AccuracyChart({ lessons }: { lessons: ProcessedLesson[] }) {
  const raw = lessons.map((l, i) => ({ x: i, y: l.accuracy }));
  const trend = linearRegression(raw);
  const avg = lessons.length > 0 ? Math.round(lessons.reduce((s, l) => s + l.accuracy, 0) / lessons.length * 10) / 10 : 0;
  const slopeLabel = trend
    ? `${trend.slope >= 0 ? "+" : ""}${(trend.slope * 100).toFixed(2)}%/100 lessons`
    : "";
  const data = raw.map((d) => ({
    i: d.x,
    accuracy: d.y,
    trend: trend ? Math.round(trend.fn(d.x) * 10) / 10 : null,
  }));

  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-lg font-semibold mb-1">Accuracy Over Time</h2>
      {slopeLabel && <p className="text-sm text-zinc-500 mb-3">{slopeLabel}</p>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="i" tick={false} label={{ value: "Lesson", position: "insideBottom", offset: -5 }} />
          <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} width={45} label={{ value: "%", angle: -90, position: "insideLeft", style: { fontSize: 12 } }} />
          <Tooltip />
          <ReferenceLine y={avg} stroke="#a1a1aa" strokeDasharray="4 4" label={{ value: `avg ${avg}%`, position: "right", fontSize: 11, fill: "#a1a1aa" }} />
          <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          {trend && <Line type="monotone" dataKey="trend" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
