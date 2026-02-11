"use client";

import { useEffect, useState, useMemo } from "react";
import type { Grain } from "@/lib/types";

interface CloudWord {
  text: string;
  size: number;
  sentiment: string;
  x?: number;
  y?: number;
  rotate?: number;
  font?: string;
}

interface CloudLayout {
  size(s: [number, number]): CloudLayout;
  words(w: Record<string, unknown>[]): CloudLayout;
  padding(p: number): CloudLayout;
  rotate(r: () => number): CloudLayout;
  font(f: string): CloudLayout;
  fontSize(fn: (d: Record<string, unknown>) => number): CloudLayout;
  on(event: string, fn: (tags: CloudWord[]) => void): CloudLayout;
  start(): CloudLayout;
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#16a34a",
  negative: "#dc2626",
  neutral: "#71717a",
  mixed: "#2563eb",
};

function getSentimentColor(sentiment: string | undefined): string {
  return SENTIMENT_COLORS[sentiment ?? "neutral"] ?? SENTIMENT_COLORS.neutral;
}

interface WordCloudVizProps {
  grains: Grain[];
}

export default function WordCloudViz({ grains }: WordCloudVizProps) {
  const [words, setWords] = useState<CloudWord[]>([]);
  const [layoutReady, setLayoutReady] = useState(false);

  const cloudWords = useMemo(() => {
    if (grains.length === 0) return [];

    const maxFreq = Math.max(
      ...grains.map((g) => g.frequency ?? g.tfidf ?? 1)
    );
    const minSize = 12;
    const maxSize = 64;

    return grains
      .filter((g) => g.word)
      .slice(0, 100)
      .map((g): CloudWord => {
        const raw = g.frequency ?? g.tfidf ?? 1;
        const normalized = maxFreq > 0 ? raw / maxFreq : 0;
        const size = minSize + normalized * (maxSize - minSize);
        return {
          text: g.word,
          size: Math.round(size),
          sentiment: g.sentiment ?? "neutral",
        };
      });
  }, [grains]);

  useEffect(() => {
    if (cloudWords.length === 0) {
      setWords([]);
      setLayoutReady(false);
      return;
    }

    let cancelled = false;

    async function runLayout() {
      // d3-cloud is a CJS module (module.exports = function() {...})
      // Dynamic import yields { default: cloudFactory }
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const cloudModule = await import(
        /* webpackChunkName: "d3-cloud" */ "d3-cloud"
      );
      const cloudFactory = (
        "default" in cloudModule ? cloudModule.default : cloudModule
      ) as unknown as () => CloudLayout;

      if (cancelled) return;

      const width = 600;
      const height = 400;

      cloudFactory()
        .size([width, height])
        .words(
          cloudWords.map((w) => ({
            text: w.text,
            size: w.size,
            sentiment: w.sentiment,
          }))
        )
        .padding(4)
        .rotate(() => 0)
        .font("sans-serif")
        .fontSize((d: Record<string, unknown>) => (d.size as number) ?? 16)
        .on("end", (tags: CloudWord[]) => {
          if (!cancelled) {
            setWords(tags);
            setLayoutReady(true);
          }
        })
        .start();
    }

    setLayoutReady(false);
    runLayout();

    return () => {
      cancelled = true;
    };
  }, [cloudWords]);

  if (grains.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-300 p-12 dark:border-zinc-600">
        <p className="text-sm text-zinc-500">
          Load and validate a WordGrain document to see the word cloud
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="font-medium">Sentiment:</span>
        {Object.entries(SENTIMENT_COLORS).map(([label, color]) => (
          <span key={label} className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        {!layoutReady ? (
          <div className="flex h-[400px] items-center justify-center">
            <span className="text-sm text-zinc-500">
              Computing layout...
            </span>
          </div>
        ) : (
          <svg
            viewBox="0 0 600 400"
            className="h-auto w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <g transform="translate(300,200)">
              {words.map((w, i) => (
                <text
                  key={`${w.text}-${i}`}
                  textAnchor="middle"
                  transform={`translate(${w.x ?? 0},${w.y ?? 0})rotate(${w.rotate ?? 0})`}
                  style={{
                    fontSize: `${w.size}px`,
                    fontFamily: w.font ?? "sans-serif",
                    fill: getSentimentColor(w.sentiment),
                    cursor: "default",
                  }}
                >
                  {w.text}
                </text>
              ))}
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}
