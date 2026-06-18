"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProcessedLesson, KeyStats } from "@/lib/types";
import { parseLessons } from "@/lib/parser";
import { createParseWorker } from "@/lib/worker";
import { WPMChart } from "./WPMChart";
import { AccuracyChart } from "./AccuracyChart";
import { KeySpeedChart } from "./KeySpeedChart";
import { KeyErrorChart } from "./KeyErrorChart";
import { RecentAverages } from "./RecentAverages";
import { ThemeToggle } from "./ThemeToggle";
import { RangeSelect, type Range } from "./RangeSelect";

type Phase = "upload" | "parsing" | "done";

/** Slice lessons array to the last N (or return all) */
function filterLessons(lessons: ProcessedLesson[], range: Range) {
  if (range === "all") return lessons;
  return lessons.slice(-range);
}

/**
 * Top-level orchestrator.
 *
 * Manages three phases:
 *   1. upload — shows file picker
 *   2. parsing — shows spinner (uses Web Worker for files >5 MB)
 *   3. done   — renders all charts and stats
 */
export function Dashboard() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [lessons, setLessons] = useState<ProcessedLesson[] | null>(null);
  const [keyStats, setKeyStats] = useState<KeyStats[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseTime, setParseTime] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [range, setRange] = useState<Range>("all");
  const [fileKey, setFileKey] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  // Clean up worker on unmount
  useEffect(() => {
    return () => workerRef.current?.terminate();
  }, []);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setFileKey((k) => k + 1);
    setPhase("parsing");
    const reader = new FileReader();
    reader.onload = () => {
      const raw = reader.result as string;
      // Large files parsed off-thread to keep the UI responsive
      if (raw.length > 5_000_000) {
        const worker = createParseWorker();
        workerRef.current = worker;
        worker.onmessage = (e) => {
          const msg = e.data;
          worker.terminate();
          workerRef.current = null;
          if (msg.ok) {
            setLessons(msg.lessons);
            setKeyStats(msg.keyStats);
            setTotalLessons(msg.lessons.length);
            setPhase("done");
          } else {
            setError(msg.error);
            setPhase("upload");
          }
        };
        worker.onerror = (e) => {
          worker.terminate();
          workerRef.current = null;
          setError(`Worker crashed: ${e.message}`);
          setPhase("upload");
        };
        worker.postMessage(raw);
      } else {
        try {
          const result = parseLessons(raw);
          setLessons(result.lessons);
          setKeyStats(result.keyStats);
          setTotalLessons(result.lessons.length);
          setParseTime(result.totalTime);
          setPhase("done");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Parse failed");
          setPhase("upload");
        }
      }
    };
    reader.onerror = () => {
      setError("Failed to read file");
      setPhase("upload");
    };
    reader.readAsText(file);
  }, []);

  // Memoized to avoid re-filtering on every render
  const filteredLessons = useMemo(
    () => (lessons ? filterLessons(lessons, range) : null),
    [lessons, range],
  );

  if (phase === "upload" || phase === "parsing") {
    return (
      <div className="flex flex-1 items-center justify-center p-8 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="text-center max-w-md">
          {phase === "parsing" ? (
            <div className="space-y-4">
              <div className="mx-auto w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-500">Parsing export file...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">keybr Analyzer</h1>
              <p className="text-zinc-500 mb-6">
                Upload your keybr.com export JSON to see WPM trends, accuracy,
                per-key stats, and recent averages.
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                Choose export file
                <input
                  key={fileKey}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>
              {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">keybr Analyzer</h1>
          <p className="text-sm text-zinc-500">
            {totalLessons.toLocaleString()} lessons
            {parseTime > 0 && ` · parsed in ${parseTime}ms`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <RangeSelect range={range} onChange={setRange} />
          <ThemeToggle />
          <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Upload
            <input
              key={fileKey}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        </div>
      </div>

      <RecentAverages lessons={filteredLessons!} />
      <WPMChart lessons={filteredLessons!} />
      <AccuracyChart lessons={filteredLessons!} />
      {keyStats && <KeySpeedChart keyStats={keyStats} />}
      {keyStats && <KeyErrorChart keyStats={keyStats} />}
    </div>
  );
}
