"use client";

import { useState, useMemo } from "react";
import type { Grain } from "@/lib/types";

type SortField =
  | "word"
  | "pos"
  | "frequency"
  | "tfidf"
  | "sentiment"
  | "categories"
  | "is_slang";

type SortDirection = "asc" | "desc";

interface GrainDataTableProps {
  grains: Grain[];
}

function comparePrimitive(
  a: string | number | boolean | undefined,
  b: string | number | boolean | undefined,
  dir: SortDirection
): number {
  const aVal = a ?? "";
  const bVal = b ?? "";

  let result: number;
  if (typeof aVal === "number" && typeof bVal === "number") {
    result = aVal - bVal;
  } else {
    result = String(aVal).localeCompare(String(bVal));
  }

  return dir === "asc" ? result : -result;
}

export default function GrainDataTable({ grains }: GrainDataTableProps) {
  const [sortField, setSortField] = useState<SortField>("frequency");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const sorted = useMemo(() => {
    return [...grains].sort((a, b) => {
      switch (sortField) {
        case "word":
          return comparePrimitive(a.word, b.word, sortDir);
        case "pos":
          return comparePrimitive(a.pos, b.pos, sortDir);
        case "frequency":
          return comparePrimitive(a.frequency, b.frequency, sortDir);
        case "tfidf":
          return comparePrimitive(a.tfidf, b.tfidf, sortDir);
        case "sentiment":
          return comparePrimitive(a.sentiment, b.sentiment, sortDir);
        case "categories":
          return comparePrimitive(
            a.categories?.join(", "),
            b.categories?.join(", "),
            sortDir
          );
        case "is_slang":
          return comparePrimitive(
            a.is_slang ? 1 : 0,
            b.is_slang ? 1 : 0,
            sortDir
          );
        default:
          return 0;
      }
    });
  }, [grains, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "word" ? "asc" : "desc");
    }
  };

  const columns: { field: SortField; label: string }[] = [
    { field: "word", label: "Word" },
    { field: "pos", label: "POS" },
    { field: "frequency", label: "Frequency" },
    { field: "tfidf", label: "TF-IDF" },
    { field: "sentiment", label: "Sentiment" },
    { field: "categories", label: "Categories" },
    { field: "is_slang", label: "Slang" },
  ];

  if (grains.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-300 p-12 dark:border-zinc-600">
        <p className="text-sm text-zinc-500">
          Load and validate a WordGrain document to see the data table
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

  const sentimentBadge = (sentiment: string | undefined) => {
    const colors: Record<string, string> = {
      positive:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
      negative:
        "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
      neutral:
        "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
      mixed:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    };
    const cls = colors[sentiment ?? "neutral"] ?? colors.neutral;
    return (
      <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
        {sentiment ?? "n/a"}
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
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {sorted.map((grain, idx) => (
            <tr
              key={`${grain.word}-${idx}`}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
            >
              <td className="px-4 py-2 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                {grain.word}
              </td>
              <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                {grain.pos ?? "n/a"}
              </td>
              <td className="px-4 py-2 font-mono text-zinc-700 dark:text-zinc-300">
                {grain.frequency ?? "n/a"}
              </td>
              <td className="px-4 py-2 font-mono text-zinc-700 dark:text-zinc-300">
                {grain.tfidf != null ? grain.tfidf.toFixed(4) : "n/a"}
              </td>
              <td className="px-4 py-2">
                {sentimentBadge(grain.sentiment)}
              </td>
              <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                {grain.categories?.join(", ") || "n/a"}
              </td>
              <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                {grain.is_slang === true
                  ? "Yes"
                  : grain.is_slang === false
                    ? "No"
                    : "n/a"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
