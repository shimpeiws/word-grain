"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Bar as BarType } from "@/lib/types";

interface BarsMetricsChartProps {
  bars: BarType[];
}

interface ChartDatum {
  label: string;
  syllable_count: number;
  word_count: number;
  rhyme_density: number;
}

export default function BarsMetricsChart({ bars }: BarsMetricsChartProps) {
  const data = useMemo((): ChartDatum[] => {
    return bars
      .filter((b) => b.metrics)
      .map((b, i) => ({
        label: b.text.length > 25 ? b.text.slice(0, 25) + "..." : b.text,
        syllable_count: b.metrics?.syllable_count ?? 0,
        word_count: b.metrics?.word_count ?? 0,
        rhyme_density: b.metrics?.rhyme_density ?? 0,
      }));
  }, [bars]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-300 p-12 dark:border-zinc-600">
        <p className="text-sm text-zinc-500">
          No metrics data available for bars
        </p>
      </div>
    );
  }

  const chartHeight = Math.max(300, data.length * 40);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 140, right: 20, top: 10, bottom: 10 }}
        >
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11 }}
            width={140}
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
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar
            dataKey="syllable_count"
            name="Syllables"
            fill="#6366f1"
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="word_count"
            name="Words"
            fill="#059669"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
