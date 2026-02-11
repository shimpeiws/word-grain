"use client";

import { useState, useMemo, useCallback } from "react";
import SchemaTree from "@/components/shared/SchemaTree";

interface SchemaNode {
  [key: string]: unknown;
}

interface PropertyDetail {
  name: string;
  type: string;
  description: string;
  required: boolean;
  constraints: { label: string; value: string }[];
}

function resolveRef(
  ref: string,
  root: SchemaNode
): SchemaNode | undefined {
  const parts = ref.replace(/^#\//, "").split("/");
  let current: unknown = root;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current as SchemaNode;
}

function collectPropertyNames(
  schema: SchemaNode,
  root: SchemaNode,
  prefix: string
): string[] {
  const names: string[] = [];

  let resolved = schema;
  if (schema.$ref && typeof schema.$ref === "string") {
    resolved = resolveRef(schema.$ref, root) ?? schema;
  }

  if (resolved.properties && typeof resolved.properties === "object") {
    const props = resolved.properties as Record<string, SchemaNode>;
    for (const key of Object.keys(props)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      names.push(fullKey);
      names.push(...collectPropertyNames(props[key], root, fullKey));
    }
  }

  if (resolved.items && typeof resolved.items === "object") {
    let items = resolved.items as SchemaNode;
    if (items.$ref && typeof items.$ref === "string") {
      items = resolveRef(items.$ref, root) ?? items;
    }
    names.push(...collectPropertyNames(items, root, prefix));
  }

  return names;
}

function extractDetail(
  name: string,
  schema: SchemaNode,
  root: SchemaNode,
  parentRequired: string[]
): PropertyDetail | null {
  let resolved = schema;
  if (schema.$ref && typeof schema.$ref === "string") {
    resolved = resolveRef(schema.$ref, root) ?? schema;
  }

  const type =
    (resolved.type as string) ?? (resolved.enum ? "enum" : "object");
  const description = (resolved.description as string) ?? "";
  const required = parentRequired.includes(name);

  const constraints: { label: string; value: string }[] = [];

  if (resolved.enum && Array.isArray(resolved.enum)) {
    constraints.push({
      label: "Allowed values",
      value: (resolved.enum as string[]).join(", "),
    });
  }
  if (typeof resolved.minLength === "number") {
    constraints.push({ label: "Min length", value: String(resolved.minLength) });
  }
  if (typeof resolved.maxLength === "number") {
    constraints.push({ label: "Max length", value: String(resolved.maxLength) });
  }
  if (typeof resolved.minimum === "number") {
    constraints.push({ label: "Minimum", value: String(resolved.minimum) });
  }
  if (typeof resolved.maximum === "number") {
    constraints.push({ label: "Maximum", value: String(resolved.maximum) });
  }
  if (typeof resolved.pattern === "string") {
    constraints.push({ label: "Pattern", value: resolved.pattern as string });
  }
  if (typeof resolved.format === "string") {
    constraints.push({ label: "Format", value: resolved.format as string });
  }
  if (typeof resolved.default !== "undefined") {
    constraints.push({
      label: "Default",
      value: JSON.stringify(resolved.default),
    });
  }
  if (resolved.items && typeof resolved.items === "object") {
    const itemSchema = resolved.items as SchemaNode;
    if (itemSchema.$ref && typeof itemSchema.$ref === "string") {
      const refName = (itemSchema.$ref as string).split("/").pop() ?? "object";
      constraints.push({ label: "Items", value: refName });
    } else if (itemSchema.type) {
      constraints.push({ label: "Items", value: itemSchema.type as string });
    }
  }

  return { name, type, description, required, constraints };
}

function findPropertyInSchema(
  path: string,
  schema: SchemaNode,
  root: SchemaNode
): { propSchema: SchemaNode; parentRequired: string[] } | null {
  const parts = path.split(".");

  let current = schema;
  let parentRequired: string[] = [];

  for (const part of parts) {
    let resolved = current;
    if (resolved.$ref && typeof resolved.$ref === "string") {
      resolved = resolveRef(resolved.$ref, root) ?? resolved;
    }

    parentRequired = (resolved.required as string[]) ?? [];

    if (resolved.properties && typeof resolved.properties === "object") {
      const props = resolved.properties as Record<string, SchemaNode>;
      if (props[part]) {
        current = props[part];
        continue;
      }
    }

    if (resolved.items && typeof resolved.items === "object") {
      let items = resolved.items as SchemaNode;
      if (items.$ref && typeof items.$ref === "string") {
        items = resolveRef(items.$ref, root) ?? items;
      }
      const itemRequired = (items.required as string[]) ?? [];
      if (
        items.properties &&
        typeof items.properties === "object" &&
        (items.properties as Record<string, SchemaNode>)[part]
      ) {
        parentRequired = itemRequired;
        current = (items.properties as Record<string, SchemaNode>)[part];
        continue;
      }
    }

    return null;
  }

  return { propSchema: current, parentRequired };
}

interface SchemaViewerProps {
  schema: Record<string, unknown> | null;
}

export default function SchemaViewer({ schema }: SchemaViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyDetail | null>(null);

  const allProperties = useMemo(() => {
    if (!schema) return [];
    return collectPropertyNames(schema as SchemaNode, schema as SchemaNode, "");
  }, [schema]);

  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return allProperties.filter((p) => p.toLowerCase().includes(term));
  }, [searchTerm, allProperties]);

  const handlePropertyClick = useCallback(
    (propPath: string) => {
      if (!schema) return;
      const result = findPropertyInSchema(
        propPath,
        schema as SchemaNode,
        schema as SchemaNode
      );
      if (result) {
        const name = propPath.split(".").pop() ?? propPath;
        const detail = extractDetail(
          name,
          result.propSchema,
          schema as SchemaNode,
          result.parentRequired
        );
        setSelectedProperty(detail);
      }
    },
    [schema]
  );

  if (!schema) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-12 dark:border-zinc-700 dark:bg-zinc-800">
        <span className="text-sm text-zinc-500">Loading schema...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pl-9 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>

      {searchTerm.trim() && filteredProperties.length > 0 && (
        <div className="rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <div className="max-h-48 overflow-y-auto p-2">
            {filteredProperties.map((prop) => (
              <button
                key={prop}
                type="button"
                onClick={() => {
                  handlePropertyClick(prop);
                  setSearchTerm("");
                }}
                className="block w-full rounded px-3 py-1.5 text-left text-sm font-mono text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {prop}
              </button>
            ))}
          </div>
        </div>
      )}

      {searchTerm.trim() && filteredProperties.length === 0 && (
        <p className="text-sm text-zinc-500">
          No properties match &quot;{searchTerm}&quot;
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SchemaTree schema={schema} />
        </div>

        <div className="lg:col-span-1">
          {selectedProperty ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Property Detail
              </h3>
              <div className="mt-3 space-y-3">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Name
                  </span>
                  <p className="mt-0.5 font-mono text-sm text-zinc-900 dark:text-zinc-100">
                    {selectedProperty.name}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Type
                  </span>
                  <p className="mt-0.5">
                    <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {selectedProperty.type}
                    </span>
                  </p>
                </div>
                {selectedProperty.required && (
                  <div>
                    <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/40 dark:text-red-300">
                      required
                    </span>
                  </div>
                )}
                {selectedProperty.description && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Description
                    </span>
                    <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">
                      {selectedProperty.description}
                    </p>
                  </div>
                )}
                {selectedProperty.constraints.length > 0 && (
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Constraints
                    </span>
                    <dl className="mt-1 space-y-1">
                      {selectedProperty.constraints.map((c) => (
                        <div key={c.label} className="flex gap-2 text-sm">
                          <dt className="font-medium text-zinc-600 dark:text-zinc-400">
                            {c.label}:
                          </dt>
                          <dd className="font-mono text-zinc-800 dark:text-zinc-200">
                            {c.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-300 p-8 dark:border-zinc-600">
              <p className="text-sm text-zinc-500">
                Search and select a property to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
