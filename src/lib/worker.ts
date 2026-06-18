/**
 * Creates a Blob-backed Web Worker for off-thread JSON parsing.
 *
 * For large exports (>5 MB) the parser runs in a Web Worker so the
 * main thread stays responsive. The worker code is inlined as a string,
 * wrapped in a Blob, and loaded as a Worker — no separate file needed.
 *
 * The worker receives the raw JSON string and posts back:
 *   { ok: true, lessons, keyStats }
 *   { ok: false, error }
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

    self.postMessage({ ok: true, lessons: lessons, keyStats: keyStats });
  } catch (err) {
    self.postMessage({ ok: false, error: err.message });
  }
};
`;
  const blob = new Blob([code], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
}
