# Changelog

## v1.1.1 (2026-06-18) — Guide to Export & SSR Fixes

### Added
- "Guide to export" button on upload screen with 3-step instructions linking to keybr.com/profile

### Fixed
- ThemeToggle SSR crash: `document is not defined` during server-side rendering (reverted to useEffect with eslint-disable)
- Removed unused `t1` variable in parser.ts
- ESLint config now ignores `release/` and `.zip` build artifacts

## v1.1.0 (2026-06-18) — Theme Revamp & Documentation

### Added
- Favicon SVG: royal-red "K" on beige keycap (`public/favicon.svg`)
- JSDoc documentation on every source file for multi-agent collaboration
- Each component now in its own file with purpose, props, and lifecycle docs

### Changed
- **Theme revamp**: beige background (`#F5F0E1`), royal-red accents (`#C41E3A`), warm-brown text (`#5C4A3A`), warm-gray muted (`#8B7D72`)
- **Zero rounded corners** — all cards, buttons, and containers use flat borders
- Custom colors available via `@theme` in `globals.css` (`bg-beige`, `text-royal-red`, etc.)
- Dark mode uses warm-dark (`#2C2416`) with beige text
- Royal-red spinner, upload button, chart lines
- Enhanced `Dashboard.tsx`: added `worker.onerror` handler for worker crash recovery; added `fileKey` state to allow re-selecting the same file
- Release ZIP rebuilt with updated styles and assets

### Fixed
- Worker crash now shows user-visible error instead of silent failure
- Re-selecting the same file now triggers re-parse (was no-op due to React key)

## v1.0.0 (2026-06-18) — Initial Release

### Added
- Next.js 16 app with TypeScript, Tailwind CSS 4, Recharts 3
- File upload (JSON) with Web Worker offload for files >5 MB
- WPM chart (royal-red line, amber trend line with slope label, average reference line)
- Accuracy chart (green line, amber trend, Y-axis 80–100 domain)
- Per-key speed bar chart (royal-red) and error rate bar chart (dark-red)
- Recent averages summary cards (All Time / Last 50 / Last 20)
- Range filter (All / 1000 / 100 / 50 / 20)
- Dark/light theme toggle (dark mode default)
- Standalone Node.js server (port 1383, auto-fallback) with start scripts
- GitHub Pages deployment workflow
- README, AGENTS.md for developer collaboration
