"use client";

import { useMemo } from "react";
import type { WordGrainDocument, Grain } from "@/lib/types";

interface StatsSummaryProps {
  left: WordGrainDocument;
  right: WordGrainDocument;
}

interface SentimentCounts {
  positive: number;
  negative: number;
  neutral: number;
  mixed: number;
}

interface DocumentStats {
  grainCount: number;
  avgFrequency: number | null;
  avgTfidf: number | null;
  sentiment: SentimentCounts;
}

interface CommonWord {
  word: string;
  leftFrequency: number | undefined;
  rightFrequency: number | undefined;
  leftTfidf: number | undefined;
  rightTfidf: number | undefined;
}

function computeStats(doc: WordGrainDocument): DocumentStats {
  const grains = doc.grains;
  const grainCount = grains.length;

  const withFreq = grains.filter(
    (g): g is Grain & { frequency: number } => g.frequency !== undefined
  );
  const avgFrequency =
    withFreq.length > 0
      ? withFreq.reduce((sum, g) => sum + g.frequency, 0) / withFreq.length
      : null;

  const withTfidf = grains.filter(
    (g): g is Grain & { tfidf: number } => g.tfidf !== undefined
  );
  const avgTfidf =
    withTfidf.length > 0
      ? withTfidf.reduce((sum, g) => sum + g.tfidf, 0) / withTfidf.length
      : null;

  const sentiment: SentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0,
    mixed: 0,
  };
  for (const g of grains) {
    if (g.sentiment && g.sentiment in sentiment) {
      sentiment[g.sentiment]++;
    }
  }

  return { grainCount, avgFrequency, avgTfidf, sentiment };
}

function findCommonWords(
  left: WordGrainDocument,
  right: WordGrainDocument
): CommonWord[] {
  const rightMap = new Map<string, Grain>();
  for (const g of right.grains) {
    const key = (g.normalized ?? g.word).toLowerCase();
    rightMap.set(key, g);
  }

  const common: CommonWord[] = [];
  for (const g of left.grains) {
    const key = (g.normalized ?? g.word).toLowerCase();
    const match = rightMap.get(key);
    if (match) {
      common.push({
        word: g.word,
        leftFrequency: g.frequency,
        rightFrequency: match.frequency,
        leftTfidf: g.tfidf,
        rightTfidf: match.tfidf,
      });
    }
  }

  return common.sort((a, b) => {
    const aFreq = (a.leftFrequency ?? 0) + (a.rightFrequency ?? 0);
    const bFreq = (b.leftFrequency ?? 0) + (b.rightFrequency ?? 0);
    return bFreq - aFreq;
  });
}

function formatNum(value: number | null | undefined): string {
  if (value === null || value === undefined) return "--";
  return value.toFixed(2);
}

function StatCard({
  label,
  leftValue,
  rightValue,
}: {
  label: string;
  leftValue: string;
  rightValue: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Doc A</p>
          <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            {leftValue}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Doc B</p>
          <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            {rightValue}
          </p>
        </div>
      </div>
    </div>
  );
}

function SentimentBar({
  label,
  leftCounts,
  rightCounts,
}: {
  label: string;
  leftCounts: SentimentCounts;
  rightCounts: SentimentCounts;
}) {
  const sentiments: (keyof SentimentCounts)[] = [
    "positive",
    "negative",
    "neutral",
    "mixed",
  ];
  const colors: Record<keyof SentimentCounts, string> = {
    positive:
      "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200",
    negative: "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200",
    neutral:
      "bg-zinc-200 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-200",
    mixed:
      "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200",
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <div className="space-y-2">
        {sentiments.map((s) => (
          <div key={s} className="flex items-center gap-3 text-sm">
            <span className="w-16 text-right font-medium capitalize text-zinc-600 dark:text-zinc-300">
              {s}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex min-w-[2rem] items-center justify-center rounded px-2 py-0.5 text-xs font-medium ${colors[s]}`}
              >
                {leftCounts[s]}
              </span>
              <span className="text-zinc-400">/</span>
              <span
                className={`inline-flex min-w-[2rem] items-center justify-center rounded px-2 py-0.5 text-xs font-medium ${colors[s]}`}
              >
                {rightCounts[s]}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
        Doc A / Doc B
      </p>
    </div>
  );
}

export default function StatsSummary({ left, right }: StatsSummaryProps) {
  const leftStats = useMemo(() => computeStats(left), [left]);
  const rightStats = useMemo(() => computeStats(right), [right]);
  const commonWords = useMemo(() => findCommonWords(left, right), [left, right]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
        Comparison Statistics
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Grain Count"
          leftValue={String(leftStats.grainCount)}
          rightValue={String(rightStats.grainCount)}
        />
        <StatCard
          label="Avg. Frequency"
          leftValue={formatNum(leftStats.avgFrequency)}
          rightValue={formatNum(rightStats.avgFrequency)}
        />
        <StatCard
          label="Avg. TF-IDF"
          leftValue={formatNum(leftStats.avgTfidf)}
          rightValue={formatNum(rightStats.avgTfidf)}
        />
        <SentimentBar
          label="Sentiment Distribution"
          leftCounts={leftStats.sentiment}
          rightCounts={rightStats.sentiment}
        />
      </div>

      {commonWords.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Common Words ({commonWords.length})
          </h3>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Word
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Freq (A)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Freq (B)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    TF-IDF (A)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    TF-IDF (B)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {commonWords.map((cw) => (
                  <tr
                    key={cw.word}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="whitespace-nowrap px-4 py-2 font-mono text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {cw.word}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-zinc-600 dark:text-zinc-400">
                      {cw.leftFrequency ?? "--"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-zinc-600 dark:text-zinc-400">
                      {cw.rightFrequency ?? "--"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-zinc-600 dark:text-zinc-400">
                      {formatNum(cw.leftTfidf)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-zinc-600 dark:text-zinc-400">
                      {formatNum(cw.rightTfidf)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {commonWords.length === 0 && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No common words found between the two documents.
          </p>
        </div>
      )}
    </div>
  );
}
