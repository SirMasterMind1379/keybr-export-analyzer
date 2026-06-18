"use client";

import type { StreakResult } from "@/lib/types";

const THRESHOLDS = [365, 100, 50, 20, 10, 5, 1, 0] as const;
const LABELS = ["Legendary", "Century", "Golden", "Blazing", "Fired Up", "Getting Warm", "Lit", "Off"];
const SIZES = ["text-4xl", "text-3xl", "text-3xl", "text-2xl", "text-2xl", "text-xl", "text-lg", "text-base"];

function getLevel(count: number) {
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (count >= THRESHOLDS[i]) return { level: THRESHOLDS.length - 1 - i, label: LABELS[i], size: SIZES[i] };
  }
  return { level: 0, label: "Off", size: "text-base" };
}

function FlameIcon({ count, blue, dim }: { count: number; blue?: boolean; dim?: boolean }) {
  const { level, label, size } = getLevel(count);
  const color = dim
    ? "text-warm-gray"
    : blue
      ? "text-sky-500 drop-shadow-[0_0_6px_rgba(14,165,233,0.6)]"
      : "text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]";
  return (
    <span className={`${size} ${color} transition-all`} title={label}>
      {level === 0 ? "○" : "🔥"}
    </span>
  );
}

export function StreakCard({ streaks }: { streaks: StreakResult }) {
  return (
    <div className="flex gap-6 justify-center">
      <div className="flex items-center gap-3 px-5 py-3 border border-royal-red">
        <FlameIcon count={streaks.streak} dim={!streaks.active} />
        <div>
          <p className={`text-2xl font-bold ${streaks.active ? "text-warm-brown dark:text-beige" : "text-warm-gray"}`}>{streaks.streak}</p>
          <p className="text-xs text-warm-gray">day streak</p>
          {!streaks.active && <p className="text-xs text-royal-red mt-1">Not practiced today</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 px-5 py-3 border border-sky-500">
        <FlameIcon count={streaks.thirtyMinStreak} blue dim={!streaks.active} />
        <div>
          <p className={`text-2xl font-bold ${streaks.active ? "text-warm-brown dark:text-beige" : "text-warm-gray"}`}>{streaks.thirtyMinStreak}</p>
          <p className="text-xs text-warm-gray">30min day streak</p>
          {!streaks.active && <p className="text-xs text-royal-red mt-1">Not practiced today</p>}
        </div>
      </div>
    </div>
  );
}
