/**
 * TypeScript interfaces matching the keybr.com export JSON schema and
 * the internal processed-data shapes used by the analyzer.
 *
 * ## Export format (flat array)
 * The keybr.com export is a JSON **array** of lesson objects (not
 * keyed by layout). Each lesson has a `histogram` property that is
 * also an **array** of per-key entries.
 *
 * ## Key fields
 * - `KeybrLesson.speed` — keybr's internal speed metric; do NOT use
 *   for WPM. Use the formula `(length × 12000) / time` instead.
 * - `time` is in milliseconds.
 * - `timeStamp` is ISO 8601 UTC.
 */

/** A single key-stat entry in a lesson's histogram array */
export interface HistogramEntry {
  /** Unicode code point of the key */
  codePoint: number;
  /** Number of correct keystrokes */
  hitCount: number;
  /** Number of incorrect keystrokes */
  missCount: number;
  /** Average time to type this key in milliseconds */
  timeToType: number;
}

/** A raw lesson as it appears in the keybr.com JSON export */
export interface KeybrLesson {
  layout: string;
  textType: string;
  /** ISO 8601 UTC timestamp */
  timeStamp: string;
  /** Total characters in the lesson text */
  length: number;
  /** Duration of the lesson in milliseconds */
  time: number;
  /** Number of error events */
  errors: number;
  /** keybr's internal speed metric — NOT the same as WPM */
  speed: number;
  /** Per-key performance data */
  histogram: HistogramEntry[];
}

/** A lesson after WPM and accuracy have been computed */
export interface ProcessedLesson {
  timeStamp: string;
  date: Date;
  length: number;
  time: number;
  errors: number;
  /** Calculated WPM = (length × 12000) / time */
  wpm: number;
  /** Calculated accuracy % = hits / (hits + misses) × 100 */
  accuracy: number;
  histogram: HistogramEntry[];
}

/** Aggregated statistics for a single key across all lessons */
export interface KeyStats {
  /** The character (␣ for space) */
  char: string;
  /** Total correct keystrokes across all lessons */
  hits: number;
  /** Total incorrect keystrokes across all lessons */
  misses: number;
  /** Average time to type this key in milliseconds */
  avgTime: number;
  /** Error rate percentage */
  errorRate: number;
}

/** Return type of parseLessons() */
export interface ParserResult {
  lessons: ProcessedLesson[];
  keyStats: KeyStats[];
  /** Total parse time in milliseconds */
  totalTime: number;
}

/** Consecutive-day streak data */
export interface StreakResult {
  /** Consecutive days with at least one lesson */
  streak: number;
  /** Consecutive days with at least 30 minutes of practice */
  thirtyMinStreak: number;
  /** Whether the most recent lesson day is today */
  active: boolean;
}
