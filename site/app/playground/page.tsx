"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import ComparisonView from "@/components/playground/ComparisonView";
import DiffDisplay from "@/components/playground/DiffDisplay";
import StatsSummary from "@/components/playground/StatsSummary";
import {
  validate,
  type ValidationResult,
} from "@/lib/validation";
import type { WordGrainDocument } from "@/lib/types";

export default function PlaygroundPage() {
  const [schema, setSchema] = useState<Record<string, unknown> | null>(null);
  const [leftJson, setLeftJson] = useState("");
  const [rightJson, setRightJson] = useState("");
  const [leftResult, setLeftResult] = useState<ValidationResult | null>(null);
  const [rightResult, setRightResult] = useState<ValidationResult | null>(null);

  // Fetch schema on mount
  useEffect(() => {
    fetch("/word-grain/schema/v0.1.0/wordgrain.schema.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load schema");
        return res.json();
      })
      .then((data) => setSchema(data as Record<string, unknown>))
      .catch((err) => console.error("Schema load error:", err));
  }, []);

  // Validate left document when schema or leftJson changes
  useEffect(() => {
    if (!schema || !leftJson.trim()) {
      setLeftResult(null);
      return;
    }
    try {
      const parsed = JSON.parse(leftJson);
      setLeftResult(validate(schema, parsed));
    } catch {
      setLeftResult({
        valid: false,
        errors: [{ path: "/", message: "Invalid JSON syntax" }],
      });
    }
  }, [schema, leftJson]);

  // Validate right document when schema or rightJson changes
  useEffect(() => {
    if (!schema || !rightJson.trim()) {
      setRightResult(null);
      return;
    }
    try {
      const parsed = JSON.parse(rightJson);
      setRightResult(validate(schema, parsed));
    } catch {
      setRightResult({
        valid: false,
        errors: [{ path: "/", message: "Invalid JSON syntax" }],
      });
    }
  }, [schema, rightJson]);

  const handleLeftChange = useCallback((json: string) => {
    setLeftJson(json);
  }, []);

  const handleRightChange = useCallback((json: string) => {
    setRightJson(json);
  }, []);

  // Parse valid documents
  const leftDoc = useMemo((): WordGrainDocument | null => {
    if (!leftResult?.valid) return null;
    try {
      return JSON.parse(leftJson) as WordGrainDocument;
    } catch {
      return null;
    }
  }, [leftJson, leftResult]);

  const rightDoc = useMemo((): WordGrainDocument | null => {
    if (!rightResult?.valid) return null;
    try {
      return JSON.parse(rightJson) as WordGrainDocument;
    } catch {
      return null;
    }
  }, [rightJson, rightResult]);

  const bothValid = leftDoc !== null && rightDoc !== null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Playground
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Compare two WordGrain documents side-by-side. Load examples or drop
          your own files to see structural diffs and statistics.
        </p>
      </div>

      <section className="mb-10">
        <ComparisonView
          leftJson={leftJson}
          rightJson={rightJson}
          onLeftChange={handleLeftChange}
          onRightChange={handleRightChange}
          leftResult={leftResult}
          rightResult={rightResult}
        />
      </section>

      {bothValid && (
        <>
          <section className="mb-10">
            <DiffDisplay left={leftDoc} right={rightDoc} />
          </section>

          <section className="mb-10">
            <StatsSummary left={leftDoc} right={rightDoc} />
          </section>
        </>
      )}

      {!bothValid && (leftJson.trim() || rightJson.trim()) && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Load or paste valid WordGrain documents in both panels to see the
            diff and statistics.
          </p>
        </div>
      )}
    </div>
  );
}
