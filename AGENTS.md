# keybr Analyzer — Project 3

## Tech stack
- Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts 3
- No backend — fully client-side. The user uploads a keybr.com export JSON and everything runs in-browser.

## Key commands
- `npm run dev` — start dev server
- `npm run build` — typecheck + production build
- `npm run lint` — ESLint check

## Architecture
- `src/app/page.tsx` — entrypoint, renders `<Dashboard />`
- `src/components/Dashboard.tsx` — file upload (uses Web Worker for files >5MB), orchestrates all charts
- `src/lib/parser.ts` — `parseLessons()` (JSON → `ParserResult { lessons, keyStats, totalTime }`), `computeRecentAverages()`
- `src/lib/worker.ts` — `createParseWorker()` returns a Blob-backed Web Worker for off-thread parsing
- `src/lib/types.ts` — all TypeScript interfaces matching the keybr.com export schema

## keybr.com export format
The export is a **flat JSON array** (not object keyed by layout). Each lesson:
```
{ layout, textType, timeStamp (ISO 8601), length, time (ms), errors, speed, histogram[] }
```
Histogram is an **array** of:
```
{ codePoint (number), hitCount, missCount, timeToType (ms) }
```

## WPM & accuracy formulas
- WPM = (length × 12000) / time (do **not** use `speed` field — different unit)
- accuracy = totalHits / (totalHits + totalMisses) × 100

## Performance notes
- Large exports (20MB+) are parsed in a Web Worker to avoid blocking the UI
- Charts disable animations and dots for large datasets (`isAnimationActive={false}`, `dot={false}`)
- Parser uses `for` loops (not `reduce`/`map` chains) for memory efficiency on large arrays
- `computeRecentAverages` uses a reverse slice + single-pass loop

## Key detail
- All components under `src/components/` are `"use client"` (Recharts + file reader require DOM)
- Filter out codePoint 32 (space) for per-key charts
