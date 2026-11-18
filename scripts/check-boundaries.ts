#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dir, "..");
const forbidden = ["lettre", "async-imap", "mail-parser", "imap", "smtp"];
const violations: string[] = [];

function walk(dir: string, predicate: (path: string) => boolean): string[] {
  return readdirSync(dir).flatMap((entry) => {
    if (entry === "node_modules" || entry === "target" || entry === ".git") return [];
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full, predicate);
    return predicate(full) ? [full] : [];
  });
}

const manifests = [
  ...walk(join(root, "crates"), (path) => path.endsWith("Cargo.toml")),
  ...walk(join(root, "apps"), (path) => path.endsWith("Cargo.toml")),
];

for (const file of manifests) {
  const text = readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([A-Za-z0-9_-]+)\s*=/);
    if (!match?.[1]) continue;
    if (forbidden.includes(match[1].toLowerCase())) {
      violations.push(`${relative(root, file)}: desktop crate depends on ${match[1]}`);
    }
  }
}

const desktopManifest = join(root, "apps/desktop/Cargo.toml");
if (!readFileSync(desktopManifest, "utf8").includes("intelluxiq-app")) {
  violations.push("apps/desktop/Cargo.toml: missing app composition dependency");
}

if (violations.length > 0) {
  console.error("boundaries: FAILED");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("boundaries: desktop has no SMTP/IMAP dependencies; email remains cloud-only");
