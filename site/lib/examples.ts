const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/word-grain";

export const EXAMPLES = [
  { name: "Kendrick Lamar (Full)", path: `${BASE}/examples/kendrick-lamar.wg.json`, type: "word" as const },
  { name: "Minimal", path: `${BASE}/examples/minimal.wg.json`, type: "word" as const },
  { name: "KOHH - Bar", path: `${BASE}/examples/kohh-bar.wg.json`, type: "bar" as const },
] as const;

export async function loadExample(path: string): Promise<string> {
  const res = await fetch(path);
  return res.text();
}
