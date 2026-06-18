"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { ProcessedLesson } from "@/lib/types";
import { linearRegression } from "@/lib/parser";

/**
 * Line chart of calculated WPM over lesson index.
 *
 * Chart elements:
 * - **Line** — per-lesson WPM in royal red (no dots for performance)
 * - **Trend line** — linear regression in amber dashed, annotated with slope
 * - **Reference line** — average WPM in warm-gray dashed
 *
 * WPM formula: (length × 12000) / time (the `speed` field from keybr is NOT used).
 */
export function WPMChart({ lessons }: { lessons: ProcessedLesson[] }) {
  const raw = lessons.map((l, i) => ({ x: i, y: l.wpm }));
  const trend = linearRegression(raw);
  const avg = lessons.length > 0
    ? Math.round(lessons.reduce((s, l) => s + l.wpm, 0) / lessons.length * 10) / 10
    : 0;
  const slopeLabel = trend
    ? `${trend.slope >= 0 ? "+" : ""}${(trend.slope * 100).toFixed(2)} wpm/100 lessons`
    : "";
  const data = raw.map((d) => ({
    i: d.x,
    wpm: d.y,
    trend: trend ? Math.round(trend.fn(d.x) * 10) / 10 : null,
  }));

  return (
    <div className="border border-beige-dark p-4 bg-beige-light dark:bg-[#3D3226] dark:border-[#5A4A3A]">
      <h2 className="text-lg font-semibold mb-1 text-warm-brown dark:text-beige">WPM Over Time</h2>
      {slopeLabel && <p className="text-sm text-warm-gray mb-3">{slopeLabel}</p>}
      <div className="h-[300px] lg:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D4C9B4" />
          <XAxis dataKey="i" tick={false} label={{ value: "Lesson", position: "insideBottom", offset: -5, fill: "#8B7D6B" }} />
          <YAxis tick={{ fontSize: 12, fill: "#8B7D6B" }} width={45} label={{ value: "WPM", angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "#8B7D6B" } }} />
          <Tooltip />
          <ReferenceLine y={avg} stroke="#A89A8A" strokeDasharray="4 4" label={{ value: `avg ${avg}`, position: "right", fontSize: 11, fill: "#A89A8A" }} />
          <Line type="monotone" dataKey="wpm" stroke="#C41E3A" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          {trend && <Line type="monotone" dataKey="trend" stroke="#D97706" strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />}
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
