import { cpSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");
const pub = resolve(__dirname, "../public");

const dirs = [
  { src: "schema", dest: "schema" },
  { src: "spec", dest: "spec" },
  { src: "examples", dest: "examples" },
];

for (const { src, dest } of dirs) {
  const srcPath = resolve(root, src);
  const destPath = resolve(pub, dest);
  mkdirSync(destPath, { recursive: true });
  cpSync(srcPath, destPath, { recursive: true });
}

console.log("Assets copied to public/");
