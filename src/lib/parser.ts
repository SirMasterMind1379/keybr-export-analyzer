import type { KeybrLesson, ProcessedLesson, KeyStats, ParserResult } from "./types";

/**
 * Parse a keybr.com export JSON string into processed lessons and key stats.
 *
 * Uses simple `for` loops instead of chained functional methods to avoid
 * unnecessary array allocations on large datasets (20 MB+ exports).
 *
 * WPM formula: (length × 12000) / time
 * Accuracy: totalHits / (totalHits + totalMisses) × 100
 */
export function parseLessons(raw: string): ParserResult {
  const t0 = performance.now();
  const data: KeybrLesson[] = JSON.parse(raw);
  const t1 = performance.now();

  const len = data.length;
  const lessons = new Array<ProcessedLesson>(len);

  for (let i = 0; i < len; i++) {
    const lesson = data[i];
    const hist = lesson.histogram;
    let totalHits = 0;
    let totalMisses = 0;
    for (let j = 0; j < hist.length; j++) {
      totalHits += hist[j].hitCount;
      totalMisses += hist[j].missCount;
    }
    const total = totalHits + totalMisses;
    const wpm = Math.round((lesson.length * 12000) / lesson.time * 10) / 10;
    const accuracy = total > 0
      ? Math.round((totalHits / total) * 1000) / 10
      : 100;

    lessons[i] = {
      timeStamp: lesson.timeStamp,
      date: new Date(lesson.timeStamp),
      length: lesson.length,
      time: lesson.time,
      errors: lesson.errors,
      wpm,
      accuracy,
      histogram: lesson.histogram,
    };
  }

  // Aggregate per-key stats in a single pass over all lesson histograms
  const keyMap = new Map<number, { hits: number; misses: number; totalTime: number }>();
  for (let i = 0; i < len; i++) {
    const hist = data[i].histogram;
    for (let j = 0; j < hist.length; j++) {
      const e = hist[j];
      let s = keyMap.get(e.codePoint);
      if (!s) {
        s = { hits: 0, misses: 0, totalTime: 0 };
        keyMap.set(e.codePoint, s);
      }
      s.hits += e.hitCount;
      s.misses += e.missCount;
      s.totalTime += e.timeToType * e.hitCount;
    }
  }

  const keyStats: KeyStats[] = [];
  for (const [codePoint, s] of keyMap) {
    const total = s.hits + s.misses;
    keyStats.push({
      char: codePoint === 32 ? "␣" : String.fromCodePoint(codePoint),
      hits: s.hits,
      misses: s.misses,
      avgTime: s.hits > 0 ? Math.round(s.totalTime / s.hits) : 0,
      errorRate: total > 0 ? Math.round((s.misses / total) * 1000) / 10 : 0,
    });
  }
  keyStats.sort((a, b) => b.errorRate - a.errorRate);

  const t2 = performance.now();

  return {
    lessons,
    keyStats,
    totalTime: Math.round(t2 - t0),
  };
}

/**
 * Simple linear regression (least squares).
 * Returns slope, intercept, and a reusable function.
 * Returns null when fewer than 2 data points exist or denominator is zero.
 */
export function linearRegression(data: { x: number; y: number }[]) {
  const n = data.length;
  if (n < 2) return null;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += data[i].x;
    sumY += data[i].y;
    sumXY += data[i].x * data[i].y;
    sumX2 += data[i].x * data[i].x;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept, fn: (x: number) => slope * x + intercept };
}

/**
 * Compute averages over the most recent N lessons.
 * Uses a reverse slice and single-pass loop for memory efficiency.
 */
export function computeRecentAverages(lessons: ProcessedLesson[], count: number) {
  const start = Math.max(0, lessons.length - count);
  let sumWpm = 0;
  let sumAcc = 0;
  let sumTime = 0;
  let sumChars = 0;
  for (let i = start; i < lessons.length; i++) {
    const l = lessons[i];
    sumWpm += l.wpm;
    sumAcc += l.accuracy;
    sumTime += l.time;
    sumChars += l.length;
  }
  const n = lessons.length - start;
  if (n === 0) return null;
  return {
    avgWpm: Math.round((sumWpm / n) * 10) / 10,
    avgAccuracy: Math.round((sumAcc / n) * 10) / 10,
    totalTimeMin: Math.round((sumTime / 60000) * 10) / 10,
    totalChars: sumChars,
    lessonCount: n,
  };
}
