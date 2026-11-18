#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import { join } from "node:path";

type Json = Record<string, unknown>;

function flatten(value: Json, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" && !Array.isArray(child)
      ? flatten(child as Json, path)
      : [path];
  });
}

const root = join(import.meta.dir, "..");
const en = JSON.parse(readFileSync(join(root, "packages/i18n/messages/en.json"), "utf8")) as Json;
const es = JSON.parse(readFileSync(join(root, "packages/i18n/messages/es.json"), "utf8")) as Json;
const enKeys = new Set(flatten(en));
const esKeys = new Set(flatten(es));
const missing = [...enKeys].filter((key) => !esKeys.has(key));
const extra = [...esKeys].filter((key) => !enKeys.has(key));

if (missing.length === 0 && extra.length === 0) {
  console.log(`i18n: en/es parity OK (${enKeys.size} keys)`);
  process.exit(0);
}

console.error("i18n: en/es key mismatch");
if (missing.length > 0) console.error("missing in es:", missing.join(", "));
if (extra.length > 0) console.error("extra in es:", extra.join(", "));
process.exit(1);
