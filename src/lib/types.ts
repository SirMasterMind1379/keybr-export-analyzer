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
  /** Calculated WPM = (length * 12000) / time */
  wpm: number;
  /** Calculated accuracy % = hits / (hits + misses) * 100 */
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
