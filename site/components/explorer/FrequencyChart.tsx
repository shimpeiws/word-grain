"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Grain } from "@/lib/types";

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#16a34a",
  negative: "#dc2626",
  neutral: "#71717a",
  mixed: "#2563eb",
};

function getSentimentColor(sentiment: string | undefined): string {
  return SENTIMENT_COLORS[sentiment ?? "neutral"] ?? SENTIMENT_COLORS.neutral;
}

interface FrequencyChartProps {
  grains: Grain[];
}

interface ChartDatum {
  word: string;
  frequency: number;
  sentiment: string;
}

export default function FrequencyChart({ grains }: FrequencyChartProps) {
  const data = useMemo((): ChartDatum[] => {
    return [...grains]
      .sort((a, b) => (b.frequency ?? 0) - (a.frequency ?? 0))
      .slice(0, 20)
      .map((g) => ({
        word: g.word,
        frequency: g.frequency ?? 0,
        sentiment: g.sentiment ?? "neutral",
      }));
  }, [grains]);

  if (grains.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-300 p-12 dark:border-zinc-600">
        <p className="text-sm text-zinc-500">
          Load and validate a WordGrain document to see the frequency chart
        </p>
      </div>
    );
  }

  const chartHeight = Math.max(300, data.length * 32);

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

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20, top: 10, bottom: 10 }}>
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="word"
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#fafafa",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getSentimentColor(entry.sentiment)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
