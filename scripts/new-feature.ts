#!/usr/bin/env bun
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error("usage: bun scripts/new-feature.ts <kebab-case-name>");
  process.exit(1);
}

const root = join(import.meta.dir, "..");
const title = name
  .replace(/(^|-)([a-z])/g, (_m: string, _sep: string, ch: string) => ` ${ch.toUpperCase()}`)
  .trim();
const tsDir = join(root, "packages/features", name);
const rustDir = join(root, "crates/features", name);

if (existsSync(tsDir) || existsSync(rustDir)) {
  console.error(`feature already exists: ${name}`);
  process.exit(1);
}

mkdirSync(join(tsDir, "src"), { recursive: true });
writeFileSync(
  join(tsDir, "package.json"),
  `${JSON.stringify(
    {
      name: `@intelluxiq/feature-${name}`,
      private: true,
      type: "module",
      exports: { ".": "./src/index.ts" },
      scripts: { typecheck: "tsc --noEmit", test: "bun test" },
      devDependencies: { typescript: "^5.7.0" },
    },
    null,
    2,
  )}\n`,
);
writeFileSync(
  join(tsDir, "tsconfig.json"),
  `${JSON.stringify({ extends: "../../../tsconfig.base.json", include: ["src"] }, null, 2)}\n`,
);
writeFileSync(
  join(tsDir, "src/index.ts"),
  `export const FEATURE_ID = "${name}" as const;\n\n/** ${title}. */\nexport function register(): void {}\n`,
);

mkdirSync(join(rustDir, "src"), { recursive: true });
writeFileSync(
  join(rustDir, "Cargo.toml"),
  `[package]
name = "intelluxiq-feature-${name}"
version.workspace = true
edition.workspace = true
license.workspace = true
publish = false

[dependencies]
intelluxiq-domain = { path = "../../domain" }
`,
);
writeFileSync(
  join(rustDir, "src/lib.rs"),
  `use intelluxiq_domain::FeatureDescriptor;

pub const FEATURE: FeatureDescriptor = FeatureDescriptor {
    id: "${name}",
    title: "${title}",
};

pub fn register() {}
`,
);

console.log(`created packages/features/${name} and crates/features/${name}`);
console.log(
  "next: add workspace members, API/worker adapters, i18n keys, a11y labels, tests, and a flag",
);
