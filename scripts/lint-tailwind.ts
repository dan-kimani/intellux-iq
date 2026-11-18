#!/usr/bin/env bun
/**
 * Fail when a Tailwind class has a canonical form.
 *
 * tailwind-lint exits 0 for warnings, so this wrapper treats the
 * suggestCanonicalClasses rule as an error for CI and pre-handoff checks.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const bin = join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tailwind-lint.cmd" : "tailwind-lint",
);
if (!existsSync(bin)) {
  console.error("tailwind-lint is not installed. Run `bun install` first.");
  process.exit(1);
}

const fix = process.argv.includes("--fix");
const checks = [
  {
    label: "apps/web",
    args: ["--config", "apps/web/src/app/globals.css", "apps/web/src/**/*.{tsx,ts}"],
  },
  {
    label: "apps/desktop-ui",
    args: ["apps/desktop-ui/**/*.{tsx,ts}"],
  },
];

let failed = false;
for (const check of checks) {
  const result = Bun.spawnSync({
    cmd: [bin, ...(fix ? ["--fix"] : []), ...check.args],
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = result.stdout.toString();
  const stderr = result.stderr.toString();
  process.stdout.write(stdout);
  process.stderr.write(stderr);
  if (result.exitCode !== 0 || /suggestCanonicalClasses/.test(`${stdout}\n${stderr}`)) {
    failed = true;
  }
}

if (failed) {
  console.error(
    "\nTailwind classes are not canonical. Run `bun run lint:tailwind -- --fix`, review the diff, then rerun.",
  );
  process.exit(1);
}
