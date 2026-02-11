"use client";

import type { ValidationResult as VResult } from "@/lib/validation";

export default function ValidationResult({ result }: { result: VResult | null }) {
  if (!result) return null;

  if (result.valid) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-center gap-2">
          <span className="text-green-600 dark:text-green-400 text-lg">&#10003;</span>
          <span className="font-medium text-green-800 dark:text-green-200">
            Valid WordGrain document
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-red-600 dark:text-red-400 text-lg">&#10007;</span>
        <span className="font-medium text-red-800 dark:text-red-200">
          Invalid ({result.errors.length} error{result.errors.length !== 1 ? "s" : ""})
        </span>
      </div>
      <ul className="space-y-1">
        {result.errors.map((err, i) => (
          <li key={i} className="text-sm text-red-700 dark:text-red-300">
            <code className="font-mono text-xs bg-red-100 dark:bg-red-800/40 px-1 rounded">
              {err.path}
            </code>{" "}
            {err.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
