#!/usr/bin/env bun
/**
 * Bun launcher for the Native Shell (NSH) desktop UI prototype.
 *
 * NSH is not an npm dependency: it owns the native runtime that builds and
 * serves the TSX app. Resolve it from NSH_BIN, PATH, or a local development
 * install so the repo stays Bun-first without vendoring a 100 MB runtime.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const app = "apps/desktop-ui";

function findNsh(): string | null {
  const fromEnv = process.env.NSH_BIN;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const onPath = Bun.which("nsh");
  if (onPath) return onPath;

  const local = join(root, ".tools", "nsh", "bin", "nsh");
  return existsSync(local) ? local : null;
}

const nsh = findNsh();
if (!nsh) {
  console.error(
    [
      "Native Shell (nsh) is required for the desktop UI prototype.",
      "",
      "  curl -fsSL https://nsh.dev/install.sh | sh",
      "",
      "Or set NSH_BIN=/path/to/nsh. The prototype targets NSH 0.6.0.",
    ].join("\n"),
  );
  process.exit(1);
}

const hostTarget =
  process.platform === "darwin" ? "macos" : process.platform === "win32" ? "windows" : "linux";

const packageTarget = (target: string): string[] => [
  "package",
  app,
  "--target",
  target,
  "--out",
  join(app, ".nsh", "dist", target),
];

const commands: Record<string, string[]> = {
  run: ["run", app],
  "run:web": ["run", app, "--target", "web"],
  check: ["check", app],
  build: ["build", app],
  test: ["test", app],
  package: packageTarget(hostTarget),
  "package:linux": packageTarget("linux"),
  "package:windows": packageTarget("windows"),
  "package:macos": packageTarget("macos"),
  "package:web": packageTarget("web"),
};

const command = process.argv[2] ?? "run";
const args = commands[command];
if (!args) {
  console.error(`usage: bun scripts/desktop-ui.ts <${Object.keys(commands).join("|")}> [args]`);
  process.exit(1);
}

const child = Bun.spawn([nsh, ...args, ...process.argv.slice(3)], {
  cwd: root,
  stdio: ["inherit", "inherit", "inherit"],
  env: process.env,
});
process.exit(await child.exited);
