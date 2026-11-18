#!/usr/bin/env bun
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const cargo = Bun.which("cargo");

if (!cargo) {
  console.error("cargo was not found on PATH. Install Rust stable and retry.");
  process.exit(1);
}

const command = process.argv[2] ?? "run";
const extra = process.argv.slice(3).filter((arg) => arg !== "--");
const cargoArgs: Record<string, string[]> = {
  run: ["run", "-p", "intelluxiq-desktop", ...extra],
  build: ["build", "--release", "-p", "intelluxiq-desktop", ...extra],
  "cargo-check": ["check", "--workspace", "--all-targets", ...extra],
  test: ["test", "--workspace", ...extra],
  fmt: ["fmt", "--all", ...extra],
  clippy: ["clippy", "--workspace", "--all-targets", "--", "-D", "warnings", ...extra],
  clean: ["clean", ...extra],
};

const targetDir = process.env.CARGO_TARGET_DIR ?? join(root, "target");

function run(args: string[]): number {
  console.log(`$ cargo ${args.join(" ")}`);
  const result = Bun.spawnSync([cargo, ...args], {
    cwd: root,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
    env: {
      ...process.env,
      CARGO_TERM_COLOR: "always",
      CARGO_TARGET_DIR: targetDir,
    },
  });
  return result.exitCode ?? 1;
}

if (command === "check") {
  for (const args of [
    ["fmt", "--all", "--", "--check"],
    ["clippy", "--workspace", "--all-targets", "--", "-D", "warnings"],
    ["test", "--workspace"],
  ]) {
    const code = run(args);
    if (code !== 0) process.exit(code);
  }
  process.exit(0);
}

const args = cargoArgs[command];
if (!args) {
  console.error(
    "usage: bun scripts/desktop.ts <run|build|test|cargo-check|check|fmt|clippy|clean> [-- cargo args]",
  );
  process.exit(1);
}

process.exit(run(args));
