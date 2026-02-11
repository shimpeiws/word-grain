"use client";

import { useMemo } from "react";
import {
  create as createDiffPatcher,
  type Delta,
  type AddedDelta,
  type ModifiedDelta,
  type DeletedDelta,
  type ArrayDelta,
  type ObjectDelta,
} from "jsondiffpatch";
import type { WordGrainDocument } from "@/lib/types";

interface DiffDisplayProps {
  left: WordGrainDocument;
  right: WordGrainDocument;
}

const diffpatcher = createDiffPatcher({
  objectHash: (obj: object) => {
    const o = obj as Record<string, unknown>;
    if (typeof o.word === "string") return o.word;
    return JSON.stringify(obj);
  },
  arrays: {
    detectMove: true,
    includeValueOnMove: false,
  },
});

function isAddedDelta(delta: Delta): delta is AddedDelta {
  return Array.isArray(delta) && delta.length === 1;
}

function isModifiedDelta(delta: Delta): delta is ModifiedDelta {
  return Array.isArray(delta) && delta.length === 2;
}

function isDeletedDelta(delta: Delta): delta is DeletedDelta {
  return (
    Array.isArray(delta) &&
    delta.length === 3 &&
    delta[1] === 0 &&
    delta[2] === 0
  );
}

function isMovedDelta(delta: Delta): delta is [unknown, number, 3] {
  return Array.isArray(delta) && delta.length === 3 && delta[2] === 3;
}

function isArrayDelta(delta: Delta): delta is ArrayDelta {
  return (
    typeof delta === "object" &&
    delta !== null &&
    !Array.isArray(delta) &&
    "_t" in delta &&
    (delta as ArrayDelta)._t === "a"
  );
}

function isObjectDelta(delta: Delta): delta is ObjectDelta {
  return (
    typeof delta === "object" &&
    delta !== null &&
    !Array.isArray(delta) &&
    !("_t" in delta)
  );
}

function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function truncateValue(value: unknown, maxLen = 80): string {
  const str = formatValue(value);
  if (str.length > maxLen) return str.slice(0, maxLen) + "...";
  return str;
}

function DeltaNode({
  name,
  delta,
  depth,
}: {
  name: string;
  delta: Delta;
  depth: number;
}) {
  if (delta === undefined) return null;

  const indent = depth * 16;

  if (isAddedDelta(delta)) {
    return (
      <div
        className="rounded px-2 py-1 bg-green-50 border-l-4 border-green-400 dark:bg-green-900/20 dark:border-green-600"
        style={{ marginLeft: indent }}
      >
        <span className="font-mono text-sm text-green-800 dark:text-green-300">
          <span className="font-semibold">+ {name}:</span>{" "}
          {truncateValue(delta[0])}
        </span>
      </div>
    );
  }

  if (isDeletedDelta(delta)) {
    return (
      <div
        className="rounded px-2 py-1 bg-red-50 border-l-4 border-red-400 dark:bg-red-900/20 dark:border-red-600"
        style={{ marginLeft: indent }}
      >
        <span className="font-mono text-sm text-red-800 dark:text-red-300">
          <span className="font-semibold">- {name}:</span>{" "}
          {truncateValue(delta[0])}
        </span>
      </div>
    );
  }

  if (isModifiedDelta(delta)) {
    return (
      <div
        className="rounded px-2 py-1 bg-amber-50 border-l-4 border-amber-400 dark:bg-amber-900/20 dark:border-amber-600"
        style={{ marginLeft: indent }}
      >
        <span className="font-mono text-sm text-amber-800 dark:text-amber-300">
          <span className="font-semibold">~ {name}:</span>{" "}
          <span className="line-through opacity-60">
            {truncateValue(delta[0])}
          </span>
          {" -> "}
          {truncateValue(delta[1])}
        </span>
      </div>
    );
  }

  if (isMovedDelta(delta)) {
    return (
      <div
        className="rounded px-2 py-1 bg-blue-50 border-l-4 border-blue-400 dark:bg-blue-900/20 dark:border-blue-600"
        style={{ marginLeft: indent }}
      >
        <span className="font-mono text-sm text-blue-800 dark:text-blue-300">
          <span className="font-semibold">&#8596; {name}:</span> moved to index{" "}
          {delta[1]}
        </span>
      </div>
    );
  }

  if (isArrayDelta(delta)) {
    const entries = Object.entries(delta).filter(([key]) => key !== "_t");
    return (
      <div style={{ marginLeft: indent }}>
        <div className="font-mono text-sm font-semibold text-zinc-700 dark:text-zinc-300 px-2 py-1">
          {name} (array)
        </div>
        <div className="space-y-0.5">
          {entries.map(([key, childDelta]) => {
            const displayKey = key.startsWith("_")
              ? `[${key.slice(1)}]`
              : `[${key}]`;
            return (
              <DeltaNode
                key={key}
                name={displayKey}
                delta={childDelta as Delta}
                depth={1}
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (isObjectDelta(delta)) {
    const entries = Object.entries(delta);
    return (
      <div style={{ marginLeft: indent }}>
        <div className="font-mono text-sm font-semibold text-zinc-700 dark:text-zinc-300 px-2 py-1">
          {name}
        </div>
        <div className="space-y-0.5">
          {entries.map(([key, childDelta]) => (
            <DeltaNode
              key={key}
              name={key}
              delta={childDelta as Delta}
              depth={1}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default function DiffDisplay({ left, right }: DiffDisplayProps) {
  const delta = useMemo(() => {
    try {
      return diffpatcher.diff(left, right);
    } catch (err) {
      console.error("Diff computation error:", err);
      return undefined;
    }
  }, [left, right]);

  if (delta === undefined) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
        <p className="text-sm font-medium text-green-800 dark:text-green-200">
          No differences found -- the documents are identical.
        </p>
      </div>
    );
  }

  const topLevelEntries = isObjectDelta(delta)
    ? Object.entries(delta)
    : [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
        Structural Diff
      </h2>
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-3 flex flex-wrap gap-4 border-b border-zinc-200 pb-3 dark:border-zinc-700">
          <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="inline-block h-3 w-3 rounded bg-green-400 dark:bg-green-600" />
            Added
          </span>
          <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="inline-block h-3 w-3 rounded bg-red-400 dark:bg-red-600" />
            Deleted
          </span>
          <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="inline-block h-3 w-3 rounded bg-amber-400 dark:bg-amber-600" />
            Modified
          </span>
          <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="inline-block h-3 w-3 rounded bg-blue-400 dark:bg-blue-600" />
            Moved
          </span>
        </div>
        <div className="space-y-1">
          {topLevelEntries.map(([key, childDelta]) => (
            <DeltaNode
              key={key}
              name={key}
              delta={childDelta as Delta}
              depth={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
