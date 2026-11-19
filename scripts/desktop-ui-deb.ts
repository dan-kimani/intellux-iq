#!/usr/bin/env bun
/**
 * Builds the Linux Debian package for the desktop UI prototype.
 *
 * `nsh package --target linux` produces a self-contained directory; this
 * places it in the FHS layout, computes the shared-library dependencies and
 * writes `intelluxiq_<version>_<arch>.deb` beside the raw bundle.
 */
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const app = "apps/desktop-ui";
const dist = join(root, app, ".nsh", "dist");
const linuxDir = join(dist, "linux");
const stage = join(dist, "deb-root");
const shlibdepsDir = join(dist, "deb-shlibdeps");
const installDir = "/opt/intelluxiq";
const binaryName = "IntelluxIQ";
const desktopId = "app.intelluxiq.desktop";
const iconName = `${desktopId}.png`;

function fail(message: string): never {
  console.error(`deb: ${message}`);
  process.exit(1);
}

function decode(value: Uint8Array | undefined): string {
  return value ? new TextDecoder().decode(value) : "";
}

function run(
  command: string[],
  options: { cwd?: string; capture?: boolean } = {},
): { code: number; stdout: string; stderr: string } {
  const result = Bun.spawnSync(command, {
    cwd: options.cwd ?? root,
    stdout: options.capture ? "pipe" : "inherit",
    stderr: options.capture ? "pipe" : "inherit",
    env: process.env,
  });
  return {
    code: result.exitCode ?? 1,
    stdout: decode(result.stdout),
    stderr: decode(result.stderr),
  };
}

function findNsh(): string | null {
  const fromEnv = process.env.NSH_BIN;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  const onPath = Bun.which("nsh");
  if (onPath) return onPath;
  const local = join(root, ".tools", "nsh", "bin", "nsh");
  return existsSync(local) ? local : null;
}

function chmodTree(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      chmodSync(path, 0o755);
      chmodTree(path);
    } else {
      chmodSync(path, 0o644);
    }
  }
}

function dependencies(binary: string): string {
  mkdirSync(join(shlibdepsDir, "debian"), { recursive: true });
  writeFileSync(
    join(shlibdepsDir, "debian", "control"),
    `Source: ${packageName}
Section: utils
Priority: optional
Maintainer: ${maintainer}
Standards-Version: 4.6.2
Package: ${packageName}
Architecture: ${arch}
Depends: \${shlibs:Depends}
Description: ${name} desktop CRM
 Local package.
`,
  );
  const result = run(["dpkg-shlibdeps", "-O", `-e${binary}`], {
    cwd: shlibdepsDir,
    capture: true,
  });
  if (result.code === 0) {
    const match = result.stdout.match(/^shlibs:Depends=(.+)$/m);
    if (match) return match[1].trim();
  }

  // `dpkg-shlibdeps` is in dpkg-dev. Fall back to the packages that own the
  // linked libraries, which keeps the package installable without it.
  const linked = run(["ldd", binary], { capture: true }).stdout;
  const packages = new Set(["libc6"]);
  for (const match of linked.matchAll(/=>\s+(\/[^\s]+)/g)) {
    const owned = run(["dpkg", "-S", match[1]], { capture: true });
    if (owned.code !== 0) continue;
    for (const line of owned.stdout.split("\n")) {
      const pkg = line.split(":")[0]?.trim();
      if (pkg && !pkg.endsWith("-dev") && !pkg.endsWith("-dbg")) packages.add(pkg);
    }
  }
  return Array.from(packages).toSorted().join(", ");
}

if (process.platform !== "linux") fail("Debian packages can only be built on Linux.");
if (!Bun.which("dpkg-deb") || !Bun.which("dpkg")) fail("install dpkg to build a .deb.");

const nsh = findNsh();
if (!nsh) fail("Native Shell (nsh) is required; set NSH_BIN or put nsh on PATH.");

const config = JSON.parse(readFileSync(join(root, app, "nsh.json"), "utf8")) as {
  name?: string;
  version?: string;
  build?: number;
};
const name = config.name ?? "IntelluxIQ";
const version = config.version ?? "0.1.0";
const build = config.build ?? 1;
const debVersion = `${version}-${build}`;
const packageName =
  name
    .toLowerCase()
    .replace(/[^a-z0-9+.-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "intelluxiq";
const arch =
  run(["dpkg", "--print-architecture"], { capture: true }).stdout.trim() ||
  (process.arch === "x64" ? "amd64" : process.arch);

const gitName = run(["git", "config", "user.name"], { capture: true }).stdout.trim();
const gitEmail = run(["git", "config", "user.email"], { capture: true }).stdout.trim();
const maintainer =
  process.env.DEB_MAINTAINER?.trim() ||
  (gitName && gitEmail ? `${gitName} <${gitEmail}>` : `${name} <noreply@intelluxiq.app>`);

rmSync(linuxDir, { recursive: true, force: true });
const packaged = run([nsh, "package", app, "--target", "linux", "--out", linuxDir]);
if (packaged.code !== 0) fail("nsh package failed.");
const bundleDir = join(linuxDir, binaryName);
const binary = join(bundleDir, binaryName);
if (!existsSync(binary)) fail(`nsh did not produce ${binary}.`);

rmSync(stage, { recursive: true, force: true });
mkdirSync(join(stage, "DEBIAN"), { recursive: true });
mkdirSync(join(stage, "opt", "intelluxiq"), { recursive: true });
mkdirSync(join(stage, "usr", "bin"), { recursive: true });
mkdirSync(join(stage, "usr", "share", "applications"), { recursive: true });
mkdirSync(join(stage, "usr", "share", "icons", "hicolor", "1024x1024", "apps"), {
  recursive: true,
});
mkdirSync(join(stage, "usr", "share", "pixmaps"), { recursive: true });

cpSync(binary, join(stage, "opt", "intelluxiq", binaryName));
cpSync(join(bundleDir, "nsh"), join(stage, "opt", "intelluxiq", "nsh"), {
  recursive: true,
});
cpSync(
  join(bundleDir, `${desktopId}.png`),
  join(stage, "usr", "share", "icons", "hicolor", "1024x1024", "apps", iconName),
);
cpSync(join(bundleDir, `${desktopId}.png`), join(stage, "usr", "share", "pixmaps", iconName));

const desktop = readFileSync(join(bundleDir, `${desktopId}.desktop`), "utf8")
  .replace(/^Exec=.*$/m, `Exec=${installDir}/${binaryName}`)
  .replace(/^Icon=.*$/m, `Icon=${desktopId}`);
writeFileSync(join(stage, "usr", "share", "applications", desktopId), desktop);
symlinkSync(`${installDir}/${binaryName}`, join(stage, "usr", "bin", packageName));

const postinst = `#!/bin/sh
set -e
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database -q /usr/share/applications || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache -q -t -f /usr/share/icons/hicolor || true
fi
exit 0
`;
const postrm = `#!/bin/sh
set -e
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database -q /usr/share/applications || true
fi
exit 0
`;
writeFileSync(join(stage, "DEBIAN", "postinst"), postinst);
writeFileSync(join(stage, "DEBIAN", "postrm"), postrm);

chmodTree(stage);
chmodSync(join(stage, "opt", "intelluxiq", binaryName), 0o755);
chmodSync(join(stage, "DEBIAN", "postinst"), 0o755);
chmodSync(join(stage, "DEBIAN", "postrm"), 0o755);

const installedKb =
  Number(run(["du", "-sk", stage], { capture: true }).stdout.split(/\s+/)[0]) || 0;
const depends = dependencies(binary);
rmSync(shlibdepsDir, { recursive: true, force: true });

writeFileSync(
  join(stage, "DEBIAN", "control"),
  `Package: ${packageName}
Version: ${debVersion}
Section: utils
Priority: optional
Architecture: ${arch}
Installed-Size: ${installedKb}
Maintainer: ${maintainer}
Depends: ${depends}
Description: ${name} desktop CRM
 ${name} is a native desktop CRM for conversations, contacts, opportunities,
 and quotations.
`,
);
chmodSync(join(stage, "DEBIAN", "control"), 0o644);

const deb = join(linuxDir, `${packageName}_${debVersion}_${arch}.deb`);
rmSync(deb, { force: true });
const built = run(["dpkg-deb", "--build", "--root-owner-group", stage, deb]);
if (built.code !== 0) fail("dpkg-deb failed.");
rmSync(stage, { recursive: true, force: true });
console.log(`✓ packaged ${deb}`);
