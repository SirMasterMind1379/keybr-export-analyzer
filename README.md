# keybr Export Analyzer

A fully client-side web app that visualizes your [keybr.com](https://www.keybr.com) typing practice data. Upload your export JSON and get interactive WPM/accuracy charts, per-key breakdowns, trend analysis, and recent averages — all in your browser with no backend.

## Features

- **WPM & Accuracy Over Time** — line charts with average reference lines and linear regression trend
- **Per-Key Analysis** — speed (WPM equivalent) and error rate for every key, excluding space
- **Recent Averages** — summary cards for all-time, last 50, and last 20 lessons
- **Range Filter** — toggle between All / 1000 / 100 / 50 / 20 recent lessons
- **Dark Mode** — default dark theme, togglable from any page, persisted to localStorage
- **Large File Support** — exports over 5 MB are parsed in a Web Worker to keep the UI responsive
- **Trend Slope** — shows your rate of change in wpm/100 lessons or %/100 lessons

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** — React framework with App Router
- **[React 19](https://react.dev/)** — UI library
- **[TypeScript](https://www.typescriptlang.org/)** — type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility-first styling
- **[Recharts 3](https://recharts.org/)** — composable chart library
- **Web Worker (Blob-backed)** — off-thread JSON parsing for large files

No backend, no database, no API calls. Everything runs client-side.

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (port 1383)
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

Open [http://localhost:1383](http://localhost:1383), click **Choose export file**, and select your keybr.com export JSON.

## Export Format

The keybr.com export (available from Profile → scroll to bottom → Download Data) is a flat JSON array:

```json
[
  {
    "layout": "en-us",
    "textType": "generated",
    "timeStamp": "2022-12-27T21:23:43.000Z",
    "length": 124,
    "time": 49568,
    "errors": 3,
    "speed": 150.1,
    "histogram": [
      { "codePoint": 32, "hitCount": 24, "missCount": 1, "timeToType": 317 },
      { "codePoint": 101, "hitCount": 41, "missCount": 0, "timeToType": 263 }
    ]
  }
]
```

**Metrics:**

| Metric | Formula |
|---|---|
| WPM | `(length × 12000) / time` |
| Accuracy | `totalHits / (totalHits + totalMisses) × 100` |
| Key Speed (WPM) | `12000 / avgTimeToType` |
| Trend | Linear regression (least squares) over lessons |

**Note:** The `speed` field in the export uses a different unit and should not be confused with WPM.

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Tailwind v4 config, dark mode variant
│   ├── layout.tsx           # Root layout with theme inline script
│   └── page.tsx             # Entry point, renders Dashboard
├── components/
│   ├── Dashboard.tsx        # File upload, phase management, chart orchestration
│   ├── WPMChart.tsx         # WPM line chart with trend and average
│   ├── AccuracyChart.tsx    # Accuracy line chart with trend and average
│   ├── KeySpeedChart.tsx    # Per-key speed bar chart
│   ├── KeyErrorChart.tsx    # Per-key error rate bar chart
│   ├── RecentAverages.tsx   # Summary cards
│   ├── RangeSelect.tsx      # Lesson range filter buttons
│   └── ThemeToggle.tsx      # Light/dark mode toggle
└── lib/
    ├── parser.ts            # JSON parsing, WPM/accuracy computation, linear regression
    ├── types.ts             # TypeScript interfaces matching keybr.com schema
    └── worker.ts            # Blob-backed Web Worker factory
```

## Credits

Built with [OpenCode](https://opencode.ai) using the **DeepSeek V4 Flash Free** model on low mode.

- Keybr data schema documented from real exports and the [keybr.com source](https://github.com/aradzie/keybr.com)
- WPM formula reference from the [keybr-mwp-workspace project](https://github.com/alex-nyo/keybr-mwp-workspace)
- Charts powered by [Recharts](https://recharts.org/)

## License

MIT
