"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/shared/FileDropZone";
import JsonEditor from "@/components/shared/JsonEditor";
import ValidationResult from "@/components/shared/ValidationResult";
import { validate } from "@/lib/validation";
import { EXAMPLES, loadExample } from "@/lib/examples";
import type { ValidationResult as VResult } from "@/lib/validation";
import type { WordGrainDocument } from "@/lib/types";

interface ValidatorPanelProps {
  schema: Record<string, unknown> | null;
  onDataValidated: (data: WordGrainDocument | null) => void;
}

export default function ValidatorPanel({
  schema,
  onDataValidated,
}: ValidatorPanelProps) {
  const [jsonContent, setJsonContent] = useState("");
  const [validationResult, setValidationResult] = useState<VResult | null>(
    null
  );
  const [exampleMenuOpen, setExampleMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const runValidation = useCallback(
    (content: string) => {
      if (!schema || !content.trim()) {
        setValidationResult(null);
        onDataValidated(null);
        return;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        setValidationResult({
          valid: false,
          errors: [{ path: "/", message: "Invalid JSON syntax" }],
        });
        onDataValidated(null);
        return;
      }

      const result = validate(schema, parsed);
      setValidationResult(result);

      if (result.valid) {
        onDataValidated(parsed as WordGrainDocument);
      } else {
        onDataValidated(null);
      }
    },
    [schema, onDataValidated]
  );

  const handleFileLoad = useCallback(
    (content: string, _filename: string) => {
      setJsonContent(content);
      runValidation(content);
    },
    [runValidation]
  );

  const handleLoadExample = useCallback(
    async (path: string) => {
      setLoading(true);
      setExampleMenuOpen(false);
      try {
        const content = await loadExample(path);
        setJsonContent(content);
        runValidation(content);
      } catch {
        setValidationResult({
          valid: false,
          errors: [{ path: "/", message: "Failed to load example file" }],
        });
      } finally {
        setLoading(false);
      }
    },
    [runValidation]
  );

  const handleValidateClick = useCallback(() => {
    runValidation(jsonContent);
  }, [jsonContent, runValidation]);

  return (
    <div className="space-y-4">
      <FileDropZone onFileLoad={handleFileLoad} />

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setExampleMenuOpen((prev) => !prev)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {loading ? "Loading..." : "Load Example"}
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
          {exampleMenuOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
              {EXAMPLES.map((example) => (
                <button
                  key={example.path}
                  type="button"
                  onClick={() => handleLoadExample(example.path)}
                  className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  {example.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleValidateClick}
          disabled={!schema || !jsonContent.trim()}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Validate
        </button>

        {!schema && (
          <span className="text-xs text-zinc-500">Loading schema...</span>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
        <JsonEditor
          value={jsonContent}
          onChange={(v) => setJsonContent(v)}
          height="400px"
        />
      </div>

      <ValidationResult result={validationResult} />
    </div>
  );
}
