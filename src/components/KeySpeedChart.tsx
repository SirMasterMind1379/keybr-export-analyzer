"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { KeyStats } from "@/lib/types";

/**
 * Bar chart of estimated WPM per key.
 *
 * WPM per key is derived from the average time-to-type:
 *   keyWPM = 12000 / avgTimeToType_ms
 *
 * Space (codePoint 32) is excluded to keep the chart readable.
 */
export function KeySpeedChart({ keyStats }: { keyStats: KeyStats[] }) {
  const data = keyStats
    .filter((k) => k.char !== "␣")
    .map((k) => ({
      char: k.char,
      wpm: k.avgTime > 0 ? Math.round(12000 / k.avgTime * 10) / 10 : 0,
    }));

  return (
    <div className="border border-beige-dark p-4 bg-beige-light dark:bg-[#3D3226] dark:border-[#5A4A3A]">
      <h2 className="text-lg font-semibold mb-4 text-warm-brown dark:text-beige">Per-Key Speed</h2>
      <div className="h-[300px] lg:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D4C9B4" />
          <XAxis dataKey="char" tick={{ fontSize: 12, fill: "#8B7D6B" }} />
          <YAxis tick={{ fontSize: 12, fill: "#8B7D6B" }} width={45} label={{ value: "WPM", angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "#8B7D6B" } }} />
          <Tooltip />
          <Bar dataKey="wpm" fill="#C41E3A" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
