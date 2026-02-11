"use client";

import { useCallback } from "react";
import JsonEditor from "@/components/shared/JsonEditor";
import FileDropZone from "@/components/shared/FileDropZone";
import ValidationResultDisplay from "@/components/shared/ValidationResult";
import type { ValidationResult } from "@/lib/validation";

const EXAMPLES = [
  { label: "Kendrick Lamar", file: "kendrick-lamar.wg.json" },
  { label: "Minimal", file: "minimal.wg.json" },
] as const;

interface ComparisonViewProps {
  leftJson: string;
  rightJson: string;
  onLeftChange: (json: string) => void;
  onRightChange: (json: string) => void;
  leftResult: ValidationResult | null;
  rightResult: ValidationResult | null;
}

function EditorPanel({
  label,
  json,
  onChange,
  result,
}: {
  label: string;
  json: string;
  onChange: (json: string) => void;
  result: ValidationResult | null;
}) {
  const handleFileLoad = useCallback(
    (content: string, _filename: string) => {
      onChange(content);
    },
    [onChange]
  );

  const loadExample = useCallback(
    async (filename: string) => {
      try {
        const res = await fetch(`/word-grain/examples/${filename}`);
        if (!res.ok) throw new Error(`Failed to load ${filename}`);
        const text = await res.text();
        onChange(text);
      } catch (err) {
        console.error("Failed to load example:", err);
      }
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        {label}
      </h3>

      <FileDropZone onFileLoad={handleFileLoad} />

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.file}
            onClick={() => loadExample(ex.file)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
          >
            Load {ex.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
        <JsonEditor value={json} onChange={onChange} height="350px" />
      </div>

      <ValidationResultDisplay result={result} />
    </div>
  );
}

export default function ComparisonView({
  leftJson,
  rightJson,
  onLeftChange,
  onRightChange,
  leftResult,
  rightResult,
}: ComparisonViewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <EditorPanel
        label="Document A"
        json={leftJson}
        onChange={onLeftChange}
        result={leftResult}
      />
      <EditorPanel
        label="Document B"
        json={rightJson}
        onChange={onRightChange}
        result={rightResult}
      />
    </div>
  );
}
