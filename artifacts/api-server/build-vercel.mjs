import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(artifactDir, "../..");
const apiDir = path.resolve(rootDir, "api");

await esbuild({
  entryPoints: [path.resolve(artifactDir, "src/vercel.ts")],
  platform: "node",
  bundle: true,
  format: "esm",
  outfile: path.resolve(apiDir, "index.js"),
  logLevel: "info",
  sourcemap: false,
  // sql.js must stay external so initSqlJs() can load sql-wasm.wasm from node_modules at runtime.
  // Other native/unbundleable packages are externalized as a safety net.
  external: [
    "*.node",
    "sharp",
    "better-sqlite3",
    "sqlite3",
    "canvas",
    "bcrypt",
    "argon2",
    "fsevents",
    "re2",
    "bufferutil",
    "utf-8-validate",
    "pg-native",
    "@prisma/client",
    "sql.js",
  ],
  // Make sure packages that are cjs only (e.g. express) but are bundled continue to work in our esm output file
  banner: {
    js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
  },
});
