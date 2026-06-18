/**
 * Factory for a Blob-backed Web Worker that parses keybr.com JSON
 * exports off the main thread.
 *
 * ## Why a Blob worker?
 * Inlining the parser code as a string → Blob → Worker URL avoids
 * needing a separate physical file, which keeps the bundler output
 * simple and avoids cross-origin / CSP issues with `new Worker(...)`.
 *
 * ## When is this used?
 * The worker is only instantiated for files larger than 5 MB.
 * Smaller files are parsed synchronously with `JSON.parse()` on the
 * main thread (which is measurably faster than the postMessage round
 * trip).
 *
 * ## Message protocol
 * The worker receives the raw JSON string via `postMessage` and
 * sends back either:
 * - `{ ok: true, lessons: ProcessedLesson[], keyStats: KeyStats[] }`
 * - `{ ok: false, error: string }`
 *
 * ## Limitations
 * - The worker code duplicates `parseLessons()` logic (it cannot
 *   import modules because `importScripts` in a Blob worker has
 *   restricted URL resolution). Keep the two implementations in sync.
 */
export function createParseWorker(): Worker {
  const code = `
self.onmessage = function(e) {
  try {
    const raw = e.data;
    const data = JSON.parse(raw);
    const len = data.length;
    const lessons = new Array(len);

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
      const accuracy = total > 0 ? Math.round((totalHits / total) * 1000) / 10 : 100;

      lessons[i] = {
        timeStamp: lesson.timeStamp,
        length: lesson.length,
        time: lesson.time,
        errors: lesson.errors,
        wpm: wpm,
        accuracy: accuracy,
        histogram: lesson.histogram,
      };
    }

    const keyMap = {};
    for (let i = 0; i < len; i++) {
      const hist = data[i].histogram;
      for (let j = 0; j < hist.length; j++) {
        const e = hist[j];
        var s = keyMap[e.codePoint];
        if (!s) {
          s = { hits: 0, misses: 0, totalTime: 0 };
          keyMap[e.codePoint] = s;
        }
        s.hits += e.hitCount;
        s.misses += e.missCount;
        s.totalTime += e.timeToType * e.hitCount;
      }
    }

    const keyStats = [];
    for (var codePoint in keyMap) {
      var s = keyMap[codePoint];
      var total = s.hits + s.misses;
      keyStats.push({
        char: Number(codePoint) === 32 ? "␣" : String.fromCodePoint(Number(codePoint)),
        hits: s.hits,
        misses: s.misses,
        avgTime: s.hits > 0 ? Math.round(s.totalTime / s.hits) : 0,
        errorRate: total > 0 ? Math.round((s.misses / total) * 1000) / 10 : 0,
      });
    }
    keyStats.sort(function(a, b) { return b.errorRate - a.errorRate; });

    var dayMap = {};
    for (var i = 0; i < len; i++) {
      var day = lessons[i].timeStamp.slice(0, 10);
      dayMap[day] = (dayMap[day] || 0) + lessons[i].time;
    }
    var days = Object.keys(dayMap).sort();
    var last = days.length - 1;
    var today = new Date().toISOString().slice(0, 10);
    var active = days[last] === today;
    var streak = 1;
    var thirtyMinStreak = dayMap[days[last]] >= 1800000 ? 1 : 0;
    for (var i = last - 1; i >= 0; i--) {
      var curr = new Date(days[i] + "T00:00:00Z");
      var next = new Date(days[i + 1] + "T00:00:00Z");
      var diff = Math.round((next.getTime() - curr.getTime()) / 86400000);
      if (diff !== 1) break;
      streak++;
      if (dayMap[days[i]] >= 1800000) thirtyMinStreak++;
    }

    self.postMessage({ ok: true, lessons: lessons, keyStats: keyStats, streak: streak, thirtyMinStreak: thirtyMinStreak, active: active });
  } catch (err) {
    self.postMessage({ ok: false, error: err.message });
  }
};
`;
  const blob = new Blob([code], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
}
