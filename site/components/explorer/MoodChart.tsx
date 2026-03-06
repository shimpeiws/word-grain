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
import type { Bar as BarType } from "@/lib/types";

const MOOD_COLORS: Record<string, string> = {
  aggressive: "#dc2626",
  melancholic: "#6366f1",
  triumphant: "#d97706",
  reflective: "#0284c7",
  humorous: "#ca8a04",
  romantic: "#ec4899",
  defiant: "#ea580c",
  hopeful: "#059669",
  dark: "#52525b",
  celebratory: "#9333ea",
};

interface MoodChartProps {
  bars: BarType[];
}

export default function MoodChart({ bars }: MoodChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const bar of bars) {
      const mood = bar.semantics?.mood ?? "unknown";
      counts[mood] = (counts[mood] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  }, [bars]);

  if (bars.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-300 p-12 dark:border-zinc-600">
        <p className="text-sm text-zinc-500">No bars data in this document</p>
      </div>
    );
  }

  if (data.length === 0) return null;

  const chartHeight = Math.max(200, data.length * 36);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
        <span className="font-medium">Mood:</span>
        {data.map(({ mood }) => (
          <span key={mood} className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: MOOD_COLORS[mood] ?? "#71717a" }}
            />
            {mood}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 90, right: 20, top: 10, bottom: 10 }}
          >
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="mood"
              tick={{ fontSize: 12 }}
              width={90}
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
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.mood}
                  fill={MOOD_COLORS[entry.mood] ?? "#71717a"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
