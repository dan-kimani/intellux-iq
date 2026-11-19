#!/usr/bin/env bun
/** Packages the desktop UI for the host; Linux gets the Debian package. */
import { join } from "node:path";

const root = join(import.meta.dir, "..");

if (process.platform === "linux") {
  await import("./desktop-ui-deb.ts");
} else {
  const child = Bun.spawn([process.execPath, join(import.meta.dir, "desktop-ui.ts"), "package"], {
    cwd: root,
    stdio: ["inherit", "inherit", "inherit"],
    env: process.env,
  });
  process.exit(await child.exited);
}
