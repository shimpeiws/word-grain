let cachedSchema: Record<string, unknown> | null = null;

export async function loadSchema(): Promise<Record<string, unknown>> {
  if (cachedSchema) return cachedSchema;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_PATH ?? "/word-grain"}/schema/v0.1.0/wordgrain.schema.json`
  );
  cachedSchema = (await res.json()) as Record<string, unknown>;
  return cachedSchema;
}

export function getSchemaSync(): Record<string, unknown> | null {
  return cachedSchema;
}
