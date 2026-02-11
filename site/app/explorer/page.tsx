"use client";

import { useState, useEffect, useCallback } from "react";
import { loadSchema } from "@/lib/schema";
import ValidatorPanel from "@/components/explorer/ValidatorPanel";
import SchemaViewer from "@/components/explorer/SchemaViewer";
import WordCloudViz from "@/components/explorer/WordCloudViz";
import FrequencyChart from "@/components/explorer/FrequencyChart";
import GrainDataTable from "@/components/explorer/GrainDataTable";
import type { WordGrainDocument } from "@/lib/types";

type Tab = "validator" | "schema" | "visualization";

const TABS: { id: Tab; label: string }[] = [
  { id: "validator", label: "Validator" },
  { id: "schema", label: "Schema Viewer" },
  { id: "visualization", label: "Visualization" },
];

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<Tab>("validator");
  const [schema, setSchema] = useState<Record<string, unknown> | null>(null);
  const [validatedData, setValidatedData] =
    useState<WordGrainDocument | null>(null);

  useEffect(() => {
    loadSchema()
      .then(setSchema)
      .catch(() => {
        // Schema fetch failed - will show loading state in components
      });
  }, []);

  const handleDataValidated = useCallback(
    (data: WordGrainDocument | null) => {
      setValidatedData(data);
    },
    []
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Explorer
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Validate WordGrain documents, browse the schema, and visualize
          vocabulary data.
        </p>
      </div>

      <div className="border-b border-zinc-200 dark:border-zinc-700">
        <nav className="-mb-px flex gap-6" aria-label="Explorer tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "validator" && (
          <ValidatorPanel
            schema={schema}
            onDataValidated={handleDataValidated}
          />
        )}

        {activeTab === "schema" && <SchemaViewer schema={schema} />}

        {activeTab === "visualization" && (
          <div className="space-y-8">
            {!validatedData ? (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-600 dark:bg-zinc-800/50">
                <p className="text-sm text-zinc-500">
                  Validate a WordGrain document in the Validator tab first to
                  visualize the data.
                </p>
              </div>
            ) : (
              <>
                <section>
                  <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Word Cloud
                  </h2>
                  <WordCloudViz grains={validatedData.grains} />
                </section>

                <section>
                  <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Top Words by Frequency
                  </h2>
                  <FrequencyChart grains={validatedData.grains} />
                </section>

                <section>
                  <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Grain Data
                  </h2>
                  <GrainDataTable grains={validatedData.grains} />
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
