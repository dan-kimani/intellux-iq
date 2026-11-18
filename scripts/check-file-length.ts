#!/usr/bin/env bun
/**
 * Enforce the 300-line cap for hand-written source files.
 *
 * Generated shadcn components are exempt because regenerating them would
 * restore whatever the generator emits. Documentation, fixtures outside the
 * code roots, and lockfiles are not scanned.
 */
import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const MAX_LINES = 300;
const root = join(import.meta.dir, "..");
const roots = ["apps", "packages", "scripts", "crates"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".rs", ".css"]);
const ignoredDirs = new Set([
  ".git",
  ".next",
  ".nsh",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
  "target",
]);
const generatedPrefixes = ["apps/web/src/components/ui/"];

const files: string[] = [];
function walk(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && ignoredDirs.has(entry.name)) continue;
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(path);
    } else if (entry.isFile() && extensions.has(extname(entry.name))) {
      files.push(path);
    }
  }
}

for (const dir of roots) {
  const path = join(root, dir);
  try {
    walk(path);
  } catch {
    // A root may not exist in a partial checkout.
  }
}

const violations = files
  .map((path) => {
    const file = relative(root, path);
    const content = readFileSync(path, "utf8");
    const lines = content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
    return { file, lines };
  })
  .filter(
    ({ file, lines }) =>
      lines > MAX_LINES && !generatedPrefixes.some((prefix) => file.startsWith(prefix)),
  )
  .toSorted((a, b) => b.lines - a.lines);

if (violations.length > 0) {
  console.error(`Source files exceed ${MAX_LINES} lines:`);
  for (const { file, lines } of violations) console.error(`  ${file}: ${lines}`);
  console.error("\nSplit by responsibility, not by slicing a file arbitrarily.");
  process.exit(1);
}

console.log(`file length: all hand-written source files are <= ${MAX_LINES} lines`);
