"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Light / dark mode toggle button.
 *
 * Behaviour:
 * - Reads the initial theme from <html class="dark"> (set by an inline
 *   script in layout.tsx to avoid flash-of-wrong-theme on first paint).
 * - Toggles the "dark" class on <html> and persists the choice to localStorage.
 * - The moon (☾) / sun (☀) indicator reflects the current mode.
 *
 * This component is intentionally small and side-effect-driven so that
 * it can be rendered anywhere in the component tree without prop-drilling.
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
      className="text-sm text-warm-gray hover:text-warm-brown dark:text-warm-gray-light dark:hover:text-beige transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}
