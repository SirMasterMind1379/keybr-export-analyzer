"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProcessedLesson, KeyStats, StreakResult } from "@/lib/types";
import { parseLessons, computeStreaks } from "@/lib/parser";
import { createParseWorker } from "@/lib/worker";
import { WPMChart } from "./WPMChart";
import { AccuracyChart } from "./AccuracyChart";
import { KeySpeedChart } from "./KeySpeedChart";
import { KeyErrorChart } from "./KeyErrorChart";
import { RecentAverages } from "./RecentAverages";
import { ThemeToggle } from "./ThemeToggle";
import { RangeSelect, type Range } from "./RangeSelect";
import { StreakCard } from "./StreakCard";

type Phase = "upload" | "parsing" | "done";

/**
 * Slice lessons array to the last N entries (or return the whole array).
 */
function filterLessons(lessons: ProcessedLesson[], range: Range) {
  if (range === "all") return lessons;
  return lessons.slice(-range);
}

/**
 * Top-level orchestrator for the keybr analyzer UI.
 *
 * Lifecycle:
 *   1. upload  — shows a file-picker on a beige landing page
 *   2. parsing — displays a royal-red spinner; files >5 MB are parsed
 *                in a Web Worker to keep the main thread responsive
 *   3. done    — renders summary cards, WPM/accuracy charts, per-key
 *                speed and error-rate bar charts, plus range and theme toggles
 *
 * State is managed via useState / useRef; cleanup of the Web Worker
 * happens automatically on unmount via useEffect.
 */
export function Dashboard() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [lessons, setLessons] = useState<ProcessedLesson[] | null>(null);
  const [keyStats, setKeyStats] = useState<KeyStats[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseTime, setParseTime] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [streaks, setStreaks] = useState<StreakResult | null>(null);
  const [range, setRange] = useState<Range>("all");
  const [fileKey, setFileKey] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => workerRef.current?.terminate();
  }, []);

  /**
   * Called when the user selects a file.
   * Reads the file as text, dispatches to either the Web Worker
   * (files > 5 MB) or the synchronous parser, and updates state.
   */
  const handleFile = useCallback((file: File) => {
    setError(null);
    setFileKey((k) => k + 1);
    setPhase("parsing");
    const reader = new FileReader();
    reader.onload = () => {
      const raw = reader.result as string;
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
            setStreaks({ streak: msg.streak, thirtyMinStreak: msg.thirtyMinStreak, active: msg.active });
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
          setStreaks(computeStreaks(result.lessons));
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

  const filteredLessons = useMemo(
    () => (lessons ? filterLessons(lessons, range) : null),
    [lessons, range],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".json")) handleFile(file);
  }, [handleFile]);

  if (phase === "upload" || phase === "parsing") {
    return (
      <div
        className="flex flex-1 items-center justify-center p-8 relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="text-center max-w-md">
          {phase === "parsing" ? (
            <div className="space-y-4">
              <div className="flex gap-1 justify-center">
                <div className="w-3 h-3 bg-royal-red animate-[pulse_1.2s_ease-in-out_infinite]" />
                <div className="w-3 h-3 bg-royal-red animate-[pulse_1.2s_ease-in-out_0.15s_infinite]" />
                <div className="w-3 h-3 bg-royal-red animate-[pulse_1.2s_ease-in-out_0.3s_infinite]" />
                <div className="w-3 h-3 bg-royal-red animate-[pulse_1.2s_ease-in-out_0.45s_infinite]" />
              </div>
              <p className="text-warm-gray">Parsing export file...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2 text-warm-brown dark:text-beige">keybr Analyzer</h1>
              <p className="text-warm-gray mb-6">
                Upload your keybr.com export JSON to see WPM trends, accuracy,
                per-key stats, and recent averages.
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-royal-red px-5 py-3 text-sm font-medium text-beige hover:bg-royal-red-dark transition-colors">
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
              <p className={`mt-3 text-xs border border-dashed px-3 py-2 transition-colors ${dragOver ? "border-royal-red text-royal-red" : "border-warm-gray text-warm-gray"}`}>
                or drag & drop a .json file here
              </p>
              <button
                type="button"
                onClick={() => setShowGuide((v) => !v)}
                className="block mx-auto mt-4 text-sm text-royal-red hover:text-royal-red-dark underline underline-offset-2"
              >
                Guide to export
              </button>
              {showGuide && (
                <div className="mt-4 p-4 border border-royal-red text-sm text-left text-warm-brown dark:text-beige space-y-2">
                  <p>To export your keybr.com data:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Go to <a href="https://www.keybr.com/profile" target="_blank" rel="noopener noreferrer" className="underline text-royal-red">keybr.com/profile</a></li>
                    <li>Scroll all the way down</li>
                    <li>Press the <strong>Download Data</strong> button</li>
                  </ol>
                  <p className="text-warm-gray">Save the JSON file and upload it above.</p>
                </div>
              )}
              {error && <p className="mt-4 text-sm text-royal-red">{error}</p>}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-warm-brown dark:text-beige">keybr Analyzer</h1>
          <p className="text-sm text-warm-gray">
            {totalLessons.toLocaleString()} lessons
            {parseTime > 0 && ` · parsed in ${parseTime}ms`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <RangeSelect range={range} onChange={setRange} />
          <ThemeToggle />
          <label className="cursor-pointer text-sm text-royal-red hover:text-royal-red-dark">
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

      {streaks && <StreakCard streaks={streaks} />}
      <RecentAverages lessons={filteredLessons!} />
      <WPMChart lessons={filteredLessons!} />
      <AccuracyChart lessons={filteredLessons!} />
      {keyStats && <KeySpeedChart keyStats={keyStats} />}
      {keyStats && <KeyErrorChart keyStats={keyStats} />}
    </div>
  );
}
