"use client";

import { useState, useMemo } from "react";
import type { Bar } from "@/lib/types";

type SortField = "text" | "track" | "mood" | "syllable_count" | "word_count" | "rhyme_density";
type SortDirection = "asc" | "desc";

interface BarDataTableProps {
  bars: Bar[];
}

const MOOD_COLORS: Record<string, string> = {
  aggressive: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  melancholic: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  triumphant: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  reflective: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  humorous: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  romantic: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  defiant: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  hopeful: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  dark: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
  celebratory: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

function moodBadge(mood: string | undefined) {
  if (!mood) return <span className="text-xs text-zinc-400">n/a</span>;
  const cls = MOOD_COLORS[mood] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300";
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
      {mood}
    </span>
  );
}

export default function BarDataTable({ bars }: BarDataTableProps) {
  const [sortField, setSortField] = useState<SortField>("text");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const sorted = useMemo(() => {
    return [...bars].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case "text":
          aVal = a.text;
          bVal = b.text;
          break;
        case "track":
          aVal = a.source.track;
          bVal = b.source.track;
          break;
        case "mood":
          aVal = a.semantics?.mood ?? "";
          bVal = b.semantics?.mood ?? "";
          break;
        case "syllable_count":
          aVal = a.metrics?.syllable_count ?? 0;
          bVal = b.metrics?.syllable_count ?? 0;
          break;
        case "word_count":
          aVal = a.metrics?.word_count ?? 0;
          bVal = b.metrics?.word_count ?? 0;
          break;
        case "rhyme_density":
          aVal = a.metrics?.rhyme_density ?? 0;
          bVal = b.metrics?.rhyme_density ?? 0;
          break;
        default:
          return 0;
      }

      let result: number;
      if (typeof aVal === "number" && typeof bVal === "number") {
        result = aVal - bVal;
      } else {
        result = String(aVal).localeCompare(String(bVal));
      }
      return sortDir === "asc" ? result : -result;
    });
  }, [bars, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "text" || field === "track" ? "asc" : "desc");
    }
  };

  const columns: { field: SortField; label: string }[] = [
    { field: "text", label: "Bar" },
    { field: "track", label: "Track" },
    { field: "mood", label: "Mood" },
    { field: "syllable_count", label: "Syllables" },
    { field: "word_count", label: "Words" },
    { field: "rhyme_density", label: "Rhyme" },
  ];

  if (bars.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-300 p-12 dark:border-zinc-600">
        <p className="text-sm text-zinc-500">
          No bars data in this document
        </p>
      </div>
    );
  }

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 text-blue-600 dark:text-blue-400">
        {sortDir === "asc" ? "\u2191" : "\u2193"}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
            {columns.map((col) => (
              <th
                key={col.field}
                className="cursor-pointer select-none px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                onClick={() => handleSort(col.field)}
              >
                {col.label}
                {sortIndicator(col.field)}
              </th>
            ))}
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              Themes
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              Techniques
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {sorted.map((bar, idx) => (
            <tr
              key={`${bar.text.slice(0, 20)}-${idx}`}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
            >
              <td className="max-w-xs px-4 py-2 font-mono text-zinc-900 dark:text-zinc-100">
                <span className="line-clamp-2">{bar.text}</span>
              </td>
              <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                <div>{bar.source.track}</div>
                {bar.source.album && (
                  <div className="text-xs text-zinc-400 dark:text-zinc-500">
                    {bar.source.album}
                    {bar.source.year ? ` (${bar.source.year})` : ""}
                  </div>
                )}
              </td>
              <td className="px-4 py-2">{moodBadge(bar.semantics?.mood)}</td>
              <td className="px-4 py-2 font-mono text-zinc-700 dark:text-zinc-300">
                {bar.metrics?.syllable_count ?? "n/a"}
              </td>
              <td className="px-4 py-2 font-mono text-zinc-700 dark:text-zinc-300">
                {bar.metrics?.word_count ?? "n/a"}
              </td>
              <td className="px-4 py-2 font-mono text-zinc-700 dark:text-zinc-300">
                {bar.metrics?.rhyme_density != null
                  ? bar.metrics.rhyme_density.toFixed(2)
                  : "n/a"}
              </td>
              <td className="px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {bar.semantics?.themes?.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {t}
                    </span>
                  )) ?? <span className="text-xs text-zinc-400">n/a</span>}
                </div>
              </td>
              <td className="px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {bar.semantics?.techniques?.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-violet-50 px-1.5 py-0.5 text-xs text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                    >
                      {t}
                    </span>
                  )) ?? <span className="text-xs text-zinc-400">n/a</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
