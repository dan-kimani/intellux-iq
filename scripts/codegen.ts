#!/usr/bin/env bun
/**
 * Contract codegen scaffold.
 *
 * The final pipeline:
 * 1. Build the Hono app and export OpenAPI 3.1 to packages/contracts/generated/openapi.json.
 * 2. Export event JSON Schema to packages/contracts/generated/events.schema.json.
 * 3. Generate the TypeScript client and crates/contracts/src/generated.
 * 4. Fail with --check when generated files are stale.
 */
const check = process.argv.includes("--check");

console.log(
  check
    ? "codegen:check scaffold — no generated drift check is wired yet"
    : "codegen scaffold — wire OpenAPI/JSON Schema generators next",
);
