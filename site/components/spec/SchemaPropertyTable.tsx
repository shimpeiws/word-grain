"use client";

import { useState } from "react";
import SchemaTree from "@/components/shared/SchemaTree";

interface SchemaJson {
  $defs?: Record<string, DefObject>;
  [key: string]: unknown;
}

interface DefObject {
  type?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, PropertyObject>;
  [key: string]: unknown;
}

interface PropertyObject {
  type?: string;
  description?: string;
  format?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  pattern?: string;
  items?: { type?: string; $ref?: string };
  $ref?: string;
  default?: unknown;
  [key: string]: unknown;
}

interface SchemaPropertyTableProps {
  schema: Record<string, unknown>;
}

function resolveTypeName(prop: PropertyObject): string {
  if (prop.$ref) {
    const refName = prop.$ref.replace("#/$defs/", "");
    return refName;
  }

  let base = prop.type ?? "any";

  if (base === "array" && prop.items) {
    if (prop.items.$ref) {
      const refName = prop.items.$ref.replace("#/$defs/", "");
      return `${refName}[]`;
    }
    return `${prop.items.type ?? "any"}[]`;
  }

  if (prop.format) {
    base = `${base} (${prop.format})`;
  }

  if (prop.enum) {
    base = `enum`;
  }

  return base;
}

function constraintText(prop: PropertyObject): string {
  const parts: string[] = [];

  if (prop.minimum !== undefined) parts.push(`min: ${prop.minimum}`);
  if (prop.maximum !== undefined) parts.push(`max: ${prop.maximum}`);
  if (prop.minLength !== undefined) parts.push(`minLength: ${prop.minLength}`);
  if (prop.pattern) parts.push(`pattern: ${prop.pattern}`);
  if (prop.enum) parts.push(prop.enum.join(", "));
  if (prop.default !== undefined) parts.push(`default: ${JSON.stringify(prop.default)}`);

  return parts.join("; ");
}

function DefinitionSection({
  name,
  def,
}: {
  name: string;
  def: DefObject;
}) {
  const [expanded, setExpanded] = useState(true);

  if (!def.properties) return null;

  const requiredFields = def.required ?? [];
  const entries = Object.entries(def.properties);

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between bg-zinc-50 px-4 py-3 text-left transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {name}
          </span>
          {def.description && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {def.description}
            </span>
          )}
        </div>
        <span className="text-zinc-400 transition-transform duration-200">
          {expanded ? "\u25BE" : "\u25B8"}
        </span>
      </button>

      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/30">
                <th className="px-4 py-2.5 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                  Field
                </th>
                <th className="px-4 py-2.5 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                  Type
                </th>
                <th className="px-4 py-2.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                  Required
                </th>
                <th className="px-4 py-2.5 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([field, prop], idx) => {
                const isRequired = requiredFields.includes(field);
                const typeName = resolveTypeName(prop);
                const constraints = constraintText(prop);
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={field}
                    className={`border-b border-zinc-100 transition-colors hover:bg-blue-50/50 dark:border-zinc-800 dark:hover:bg-blue-900/10 ${
                      isEven
                        ? "bg-white dark:bg-zinc-900"
                        : "bg-zinc-50/50 dark:bg-zinc-800/20"
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        {field}
                      </code>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {typeName}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {isRequired ? (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/40 dark:text-red-300">
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                      {prop.description ?? ""}
                      {constraints && (
                        <span className="ml-1 text-xs text-zinc-400 dark:text-zinc-500">
                          ({constraints})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function SchemaPropertyTable({ schema }: SchemaPropertyTableProps) {
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");

  const typedSchema = schema as SchemaJson;
  const defs = typedSchema.$defs ?? {};
  const defEntries = Object.entries(defs);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          View:
        </span>
        <button
          type="button"
          onClick={() => setViewMode("table")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "table"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          Table
        </button>
        <button
          type="button"
          onClick={() => setViewMode("tree")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "tree"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          Tree
        </button>
      </div>

      {viewMode === "table" ? (
        <div>
          {defEntries.map(([name, def]) => (
            <DefinitionSection key={name} name={name} def={def} />
          ))}
        </div>
      ) : (
        <SchemaTree schema={schema} />
      )}
    </div>
  );
}
