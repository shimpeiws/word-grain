const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/word-grain";

export const EXAMPLES = [
  { name: "Kendrick Lamar (Full)", path: `${BASE}/examples/kendrick-lamar.wg.json` },
  { name: "Minimal", path: `${BASE}/examples/minimal.wg.json` },
] as const;

export async function loadExample(path: string): Promise<string> {
  const res = await fetch(path);
  return res.text();
}
