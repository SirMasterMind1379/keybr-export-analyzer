"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Light/dark mode toggle.
 *
 * Reads initial state from <html> class (set by an inline script in layout.tsx
 * to prevent flash-of-wrong-theme). Toggles the "dark" class on <html> and
 * persists preference to localStorage.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  }, []);

  return (
    <button
      onClick={toggle}
      className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}
