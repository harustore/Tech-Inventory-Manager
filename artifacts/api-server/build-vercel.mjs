import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(artifactDir, "../..");
const apiDir = path.resolve(rootDir, "api");

await esbuild({
  entryPoints: [path.resolve(artifactDir, "src/vercel.ts")],
  platform: "node",
  bundle: true,
  format: "cjs",
  outfile: path.resolve(apiDir, "index.cjs"),
  logLevel: "info",
  sourcemap: false,
});
