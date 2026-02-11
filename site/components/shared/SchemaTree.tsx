"use client";

import { useState } from "react";

interface SchemaNode {
  [key: string]: unknown;
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

function SchemaProperty({
  name,
  schema,
  root,
  depth,
  required,
}: {
  name: string;
  schema: SchemaNode;
  root: SchemaNode;
  depth: number;
  required: boolean;
}) {
  const [expanded, setExpanded] = useState(depth < 2);

  let resolved = schema;
  if (schema.$ref && typeof schema.$ref === "string") {
    resolved = resolveRef(schema.$ref, root) ?? schema;
  }

  const type = (resolved.type as string) ?? (resolved.$ref ? "ref" : "object");
  const hasChildren = Boolean(
    resolved.properties || (resolved.items && typeof resolved.items === "object")
  );

  return (
    <div className="ml-4 border-l border-zinc-200 pl-3 dark:border-zinc-700">
      <button
        type="button"
        className="flex items-center gap-2 py-0.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 w-full rounded px-1"
        onClick={() => setExpanded(!expanded)}
      >
        {hasChildren ? (
          <span className="w-4 text-zinc-400">{expanded ? "▾" : "▸"}</span>
        ) : (
          <span className="w-4" />
        )}
        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
          {name}
        </span>
        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {type}
        </span>
        {required && (
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-900/40 dark:text-red-300">
            required
          </span>
        )}
      </button>
      {typeof resolved.description === "string" && (
        <p className="ml-8 text-xs text-zinc-500 dark:text-zinc-400">
          {resolved.description}
        </p>
      )}
      {expanded && hasChildren && (
        <SchemaProperties schema={resolved} root={root} depth={depth + 1} />
      )}
    </div>
  );
}

function SchemaProperties({
  schema,
  root,
  depth,
}: {
  schema: SchemaNode;
  root: SchemaNode;
  depth: number;
}) {
  const requiredFields = (schema.required as string[]) ?? [];

  if (schema.properties && typeof schema.properties === "object") {
    const props = schema.properties as Record<string, SchemaNode>;
    return (
      <div>
        {Object.entries(props).map(([key, value]) => (
          <SchemaProperty
            key={key}
            name={key}
            schema={value}
            root={root}
            depth={depth}
            required={requiredFields.includes(key)}
          />
        ))}
      </div>
    );
  }

  if (schema.items && typeof schema.items === "object") {
    let items = schema.items as SchemaNode;
    if (items.$ref && typeof items.$ref === "string") {
      items = resolveRef(items.$ref, root) ?? items;
    }
    if (items.properties) {
      return <SchemaProperties schema={items} root={root} depth={depth} />;
    }
  }

  return null;
}

export default function SchemaTree({
  schema,
}: {
  schema: Record<string, unknown>;
}) {
  return (
    <div className="overflow-auto rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <SchemaProperties schema={schema} root={schema} depth={0} />
    </div>
  );
}
