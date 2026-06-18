"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { KeyStats } from "@/lib/types";

/**
 * Bar chart showing error rate per key.
 *
 * Error rate = misses / (hits + misses) × 100
 * Space (codePoint 32) is excluded for readability.
 */
export function KeyErrorChart({ keyStats }: { keyStats: KeyStats[] }) {
  const data = keyStats
    .filter((k) => k.char !== "␣")
    .map((k) => ({
      char: k.char,
      errorRate: k.errorRate,
      misses: k.misses,
    }));

  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-lg font-semibold mb-4">Per-Key Error Rate</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="char" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={45} label={{ value: "%", angle: -90, position: "insideLeft", style: { fontSize: 12 } }} />
          <Tooltip />
          <Bar dataKey="errorRate" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
