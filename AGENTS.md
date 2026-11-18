# AGENTS.md

This file is the repository's hard rules for coding agents. It is not a second
specification: [`spec.md`](spec.md) is the source of truth for behavior, schemas,
and contracts, and the ADRs record accepted decisions. If a rule here conflicts
with the spec, stop and resolve the conflict instead of guessing.

## Start here

- Read the relevant `spec.md` section and ADRs before changing architecture,
  data keys, authentication, synchronization, or public contracts.
- There is **one spec**: `spec.md`. Do not create alternate specs, "v2" plans,
  or parallel architecture documents. An architecture change goes through an
  ADR, then updates the spec, README, tests, and code together.
- Do not create a second desktop UI stack. `apps/desktop` remains the gpui
  scaffold until [ADR 0006](docs/adr/0006-nsh-tsx-desktop-ui.md) is accepted;
  `apps/desktop-ui` is a prototype and must not become a place for production
  business logic.
- Do not commit, push, or rewrite history unless explicitly asked.

## Runtime and boundaries

- Use Bun for everything: installs, scripts, tests, builds, and the desktop
  wrappers. Do not introduce Node, npm, pnpm, yarn, or npx into production or
  repository scripts.
- Use **Oxlint** and **Oxfmt** for TypeScript/JavaScript linting and formatting.
  Do not add another formatter or linter without an ADR.
- The cloud is pure TypeScript/Bun: Next.js, Hono, sync, and workers. Rust is
  desktop-only; do not add a Rust cloud service.
- All provider I/O is cloud-only. The desktop must never contain SMTP/IMAP
  clients, provider sockets, OAuth refresh code, or provider credentials.
  `bun run boundaries` must pass; it guards the desktop dependency boundary.
- Next.js server components call Hono over HTTP. They must not query Postgres
  directly.
- HTTP and event shapes come from [`packages/contracts`](packages/contracts).
  Do not hand-write duplicate DTOs; regenerate clients when contracts change.
- Desktop UI calls a typed Rust native-module boundary. SQLCipher, keychain
  access, sync cursors, Typst rendering, audio capture, and device identity stay
  in Rust, not in TSX.

## Data and tenancy

- Every tenant-scoped table uses `(org_id, <entity>_id)` as its primary key or
  unique key, and every tenant foreign key is composite. Only `orgs`, `users`,
  and `plans` are global; tenant user references go through `memberships`.
  See [`spec.md`](spec.md) §7.1 and
  [ADR 0004](docs/adr/0004-tenant-keys-and-cloud-email.md).
- Never add an unscoped tenant query or a "find by id only" repository method.
  Every query for tenant data includes `org_id`.
- Conversations carry messages and channel identity only. Opportunities carry
  stage, value, owner, products, and quotations. Quotes belong to opportunities,
  not conversations. Never put deal stage or value back on `threads` /
  conversations. See [`spec.md`](spec.md) §6 and
  [ADR 0005](docs/adr/0005-opportunities-and-deterministic-intelligence.md).
- Migrations preserve isolation: composite foreign keys, `ON DELETE RESTRICT`,
  soft delete, and the `NOT VALID` → orphan audit → `VALIDATE` sequence. Do not
  hard-delete tenant records. See [`spec.md`](spec.md) §7.3.
- Sync events fan out to every linked device in the org. Do **not** filter events
  per device; device-specific caches are not an event-routing policy. All
  authorization remains server-side.
- CRM reads are org-wide. Messaging writes require conversation assignment;
  opportunity stage/value/quote writes require ownership or manager/admin rights.
  Do not widen a permission without a security review and tests.

## Security and secrets

- Provider credentials, OAuth refresh tokens, SMTP/IMAP passwords, SQLCipher
  keys, and raw database handles never reach the desktop UI or its logs.
- The desktop stores only the device key and refresh token as long-lived
  credentials. Never log secrets, PII, message bodies, or signing material.
- Preserve the cloud-only email boundary even when changing unrelated desktop
  code. Desktop email history arrives through sync, not a local mail client.
- AI is disabled by default. The AI provider stub returns `Disabled`, and no AI
  dependency is allowed on the core CRM path.

## Product semantics

- Lead recovery, conversation signals, pipeline conversion, and team reporting
  are deterministic. Do not replace a deterministic rule with an AI dependency.
- Measure outcomes, not activity: revenue, quotes accepted, deals won, and
  recovered leads are performance metrics. Message and activity counts are
  diagnostics.
- Do not add per-device filtering to compensate for a noisy event stream. Fix
  the event contract or authorization instead.

## UI

- The web console uses **shadcn/ui only**: generated components in
  [`apps/web/src/components/ui`](apps/web/src/components/ui), with app screens
  composing them. No custom primitives and no separate design-system package.
- The desktop prototype uses Native Shell/TSX with app-owned primitives in
  [`apps/desktop-ui/components/ui.tsx`](apps/desktop-ui/components/ui.tsx).
  Use shadcn design tokens; never import React, Radix, or shadcn React
  components into the desktop.
- Use semantic tokens (`bg-background`, `text-muted-foreground`,
  `border-border`, etc.), never raw hex values in components. Raw color belongs
  in theme definitions, and light and dark themes must both be checked.
- Production copy comes from locale files; `bun run i18n:check` must pass.
  Prototype fixture copy may be hard-coded until the screen is promoted.
- Accessibility is a release gate: keyboard paths and screen-reader/AccessKit
  checks must pass before a screen is called complete.
- Treat `.mocks/` as the visual reference, but keep changes on the token system
  rather than hard-coding mock values.

## File size

- No hand-written source file may exceed **300 lines**. Split by responsibility
  before crossing the cap; do not compress code or slice a file arbitrarily just
  to satisfy the count.
- Generated shadcn components under `apps/web/src/components/ui/**` are exempt
  because regeneration restores the generator's output. Documentation, lockfiles,
  and generated directories are outside the check.
- `bun run lint:loc` enforces the cap; it runs as part of `bun run lint`.

## Tailwind classes

- Use canonical Tailwind utilities in both `apps/web` and `apps/desktop-ui`
  (including NSH `class` strings). Do not introduce a class when a canonical
  utility produces the same CSS.
  - Examples: `w-[420px]` → `w-105`, `rounded-[2px]` → `rounded-xs`,
    `mt-[16px]` → `mt-4`, `flex-shrink-0` → `shrink-0`,
    `bg-[var(--chart-1)]` → `bg-(--chart-1)`, `[&_[data-slot=x]]:` →
    `**:data-[slot=x]:`.
- Run `bun run lint:tailwind` after any class change, or `bun run lint` before
  handing work off. It treats `suggestCanonicalClasses` warnings as failures.
- To apply safe fixes: `bun run lint:tailwind -- --fix`, then review the diff and
  rerun the linter.
- Do not suppress `suggestCanonicalClasses`, and do not replace a semantic token
  with a raw value just to satisfy the linter.
- Generated shadcn components in `apps/web/src/components/ui` are in scope. If
  you regenerate a component, rerun the Tailwind lint.
- Canonicalization must preserve the same spacing, color, radius, and layout
  behavior; it is not a substitute for semantic review.

## Verification and hygiene

- Required before handoff:
  - `bun run check` — lint, typecheck, codegen, i18n, Rust fmt/clippy/tests
  - `bun run test` — TypeScript apps and desktop
  - `bun run build` — web, apps, and desktop release
- If the desktop UI changed, also run:
  - `bun run desktop:ui:check`
  - `bun run desktop:ui:test`
  - `bun run desktop:ui:web` for visual review
- Add or update tests for every behavior change. New tenant tables need tenant
  isolation tests; new UI states need interaction tests.
- Do not skip, weaken, or delete a check to make a task pass. Fix the cause.
- Stop background servers after verification. Remove generated scratch/build
  artifacts (`node_modules`, `.next`, `.turbo`, `target`) before final handoff
  when they are not part of the deliverable. Keep `apps/desktop-ui/.nsh` when it
  exists: it carries the generated TS config and NSH declarations editors need.
  Remove only `.nsh/out` build output; regenerate editor files with
  `bun run desktop:ui:check` after a clone.
- Prefer existing dependencies. Pin any addition in `package.json`/`Cargo.toml`
  and the lockfile, and update the version table in `README.md`.

## Commands

- Install: `bun install`
- Lint: `bun run lint`
- Format: `bun run format`
- Format check: `bun run format:check`
- File length: `bun run lint:loc`
- Tailwind only: `bun run lint:tailwind`
- Full check: `bun run check`
- Tests: `bun run test`
- Build: `bun run build`
- Desktop UI prototype: `bun run desktop:ui:check`, `bun run desktop:ui:test`,
  `bun run desktop:ui:web`
