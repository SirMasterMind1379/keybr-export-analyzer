"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { KeyStats } from "@/lib/types";

/**
 * Bar chart of error rate per key.
 *
 * Error rate = misses / (hits + misses) × 100
 *
 * Space (codePoint 32) is excluded to keep the chart readable.
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
    <div className="border border-beige-dark p-4 bg-beige-light dark:bg-[#3D3226] dark:border-[#5A4A3A]">
      <h2 className="text-lg font-semibold mb-4 text-warm-brown dark:text-beige">Per-Key Error Rate</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D4C9B4" />
          <XAxis dataKey="char" tick={{ fontSize: 12, fill: "#8B7D6B" }} />
          <YAxis tick={{ fontSize: 12, fill: "#8B7D6B" }} width={45} label={{ value: "%", angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "#8B7D6B" } }} />
          <Tooltip />
          <Bar dataKey="errorRate" fill="#9B111E" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
