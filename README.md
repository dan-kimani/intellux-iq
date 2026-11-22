# IntelluxIQ Monorepo

This repository is the scaffold for IntelluxIQ: a Rust desktop CRM and a pure
TypeScript/Bun cloud. The product and technical contract is [`spec.md`](./spec.md);
this README covers the repository layout and the first commands.

## Layout

```text
apps/
  desktop/     Rust + gpui-kit desktop CRM (current scaffold)
  desktop-ui/  Native Shell (NSH) TSX desktop UI prototype — decision pending
  web/         Next.js manager console on Bun
  api/         Hono public API on Bun (/api/v1)
  sync/        Bun WSS event stream (/sync)
  worker/      Bun egress, media, and email workers
crates/        Rust libraries and desktop feature modules
packages/      TypeScript libraries and cloud feature modules
infra/         local compose, Caddy, Dockerfiles, deploy notes
docs/          ADRs, architecture notes, feature docs, runbooks
scripts/       codegen, i18n parity, feature scaffolding, boundaries
```

`apps/` are deployables. `crates/` and `packages/` are libraries. Feature code is
mirrored under `crates/features/*` (desktop) and `packages/features/*` (cloud).
The full layout is in `spec.md` §14.4.

## Prerequisites

- Bun 1.x
- Rust stable (rustfmt, clippy)
- Docker (for local Postgres, Redis, MinIO, Mailpit)
- FFmpeg (media worker)
- Native Shell 0.6.0 only for the `apps/desktop-ui` prototype
  (`curl -fsSL https://nsh.dev/install.sh | sh`)

No Node runtime is used in production. Next.js and Hono run on Bun.

### Locked versions (as of 2026-11-17)

| Tool                                  | Version                |
| ------------------------------------- | ---------------------- |
| Bun                                   | 1.4.4                  |
| Next.js                               | 16.4.6                 |
| React / React DOM                     | 19.3.1                 |
| TypeScript                            | 7.0.2                  |
| Hono                                  | 4.13.19                |
| Zod                                   | 4.6.7                  |
| Drizzle ORM / Kit                     | 0.45.4 / 0.31.11       |
| postgres                              | 4.1.1                  |
| Oxlint                                | 1.94.0                 |
| Oxfmt                                 | 0.79.0                 |
| tailwind-lint                         | 0.17.0                 |
| Tailwind CSS                          | 4.3.5                  |
| shadcn CLI                            | 4.23.0                 |
| Recharts                              | 3.10.1                 |
| Turborepo                             | 2.11.11                |
| Native Shell (NSH)                    | 0.6.0 (prototype only) |
| Rust `tracing` / `tracing-subscriber` | 0.1.44 / 0.3.23        |

`bun.lock` and `Cargo.lock` pin the resolved trees.

## Data and channel boundaries

- Every tenant table is keyed by `(org_id, <entity>_id)` and every tenant FK is
  `(org_id, parent_id)`. Only `orgs`, `users`, and `plans` are global; tenant
  user references go through `memberships`. See `spec.md` §7.1.
- Contacts own **conversations** and **opportunities** separately. Conversations
  carry messages; opportunities carry stage, value, products, and quotations.
  A contact can have many of both. See `spec.md` §6–§7.
- Deterministic sales intelligence (lead recovery, pipeline conversion, outcome
  metrics) ships before AI; AI remains an optional stub.
- The desktop has no SMTP/IMAP implementation, sockets, or credentials. Email
  protocol work lives only in the cloud API and workers; the desktop composes
  drafts and receives history through sync events.
- Email account setup is web-console only. OAuth tokens and app passwords stay
  in the cloud vault; the desktop receives account status through sync and never
  prompts for provider credentials. Folder and label discovery is also
  cloud-only: Gmail labels, Microsoft Graph folders, Zoho folders/labels, and
  IMAP trees are normalized server-side. See
  [ADR 0007](docs/adr/0007-email-folder-discovery.md) and
  [ADR 0008](docs/adr/0008-email-provider-onboarding.md).
- Messaging onboarding is provider-native and web-console only: WhatsApp
  Embedded Signup v4, Facebook Pages, Instagram Login (with Page fallback), and
  gated TikTok Business Messaging. Meta/TikTok callbacks are app-level and are
  mapped to the tenant by asset ID; desktops receive channel-account status
  through sync and never load Meta/TikTok SDKs. WhatsApp is modelled as a
  connection → WABA → phone-number hierarchy; templates, tokens, permissions,
  webhooks, and account status are WABA-scoped, while registration, quality,
  throughput, and calling are number-scoped. Meta messaging/calling charges stay
  customer-owned and are never combined with IntelluxIQ subscription or usage
  invoices. See [ADR 0009](docs/adr/0009-messaging-channel-onboarding.md),
  [ADR 0010](docs/adr/0010-whatsapp-account-hierarchy-and-billing.md), and
  `spec.md` Appendix D.

## Web UI

The web console uses **shadcn/ui only** — Radix primitives generated into
`apps/web/src/components/ui` with the Nova preset, Geist, Tailwind CSS v4, and
Lucide icons. There is no custom design-system package. App screens are
compositions of shadcn components with a warm-stone shell, orange brand/active
accent, and blue/violet/green data colors (`apps/web/src/app/globals.css`).

![IntelluxIQ web console overview](docs/screenshots/web-overview.png)

| Pipeline                                       | Intelligence                                           |
| ---------------------------------------------- | ------------------------------------------------------ |
| ![Pipeline](docs/screenshots/web-pipeline.png) | ![Intelligence](docs/screenshots/web-intelligence.png) |

```sh
cd apps/web
bun x shadcn@latest add <component>
```

## Desktop UI prototype (NSH, proposed)

The desktop UI is being prototyped in **Native Shell** with TSX compositions
instead of gpui widgets. It uses the shadcn token model and an app-owned styled
layer, not React or a shadcn component package. The current normative desktop
stack is still gpui-kit; see [ADR 0006](docs/adr/0006-nsh-tsx-desktop-ui.md) and
the [prototype README](apps/desktop-ui/README.md). The prototype is not wired to
the API, auth, sync, SQLCipher, or provider egress.

![IntelluxIQ desktop inbox](docs/screenshots/desktop-dark.png)

```sh
curl -fsSL https://nsh.dev/install.sh | sh   # NSH 0.6.0, once
export PATH="$HOME/.local/bin:$PATH"
bun run desktop:ui        # native window
bun run desktop:ui:web    # browser preview of the same TSX
bun run desktop:ui:check  # also generates .nsh editor types
bun run desktop:ui:test   # headless interaction tests
```

The prototype lives in `apps/desktop-ui` and is deliberately outside the Turbo
build until the ADR is accepted. `apps/desktop` remains the Rust/gpui workspace
app.

| Light                                                | Intelligence                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| ![Desktop light](docs/screenshots/desktop-light.png) | ![Desktop intelligence](docs/screenshots/desktop-intelligence.png) |

## Quick start

```sh
bun install          # generates bun.lock; commit it
docker compose -f infra/compose.yml up -d
cp .env.example .env

bun run dev          # all apps, including desktop
bun run dev:cloud    # web/api/sync/worker only
bun run dev:api      # if you prefer per-app terminals
bun run dev:web
bun run dev:sync
bun run dev:worker
```

The local API is at `http://localhost:3001`; the web console at
`http://localhost:3000`; the sync WebSocket at `ws://localhost:3002/sync`.

The desktop is a Bun workspace app that wraps Cargo; the binary is still Rust.
It is a placeholder until the gpui-kit shell lands:

```sh
bun run desktop          # cargo run -p intelluxiq-desktop
bun run desktop:build    # cargo build --release -p intelluxiq-desktop
bun run desktop:test     # cargo test --workspace
bun run desktop:check    # fmt + clippy + test
bun run desktop:ui:web   # NSH TSX prototype, browser preview
```

`bun run build` and `bun run test` include the desktop app through Turbo, so
the whole repo builds and tests from Bun.

## Checks

```sh
bun run check        # lint, typecheck, codegen, i18n, Rust fmt/clippy/test
bun run test         # TS apps + desktop through Turbo
bun run build        # TS apps + desktop release through Turbo
bun run lint         # Oxfmt + Oxlint + file length + boundaries + Tailwind
bun run lint:tailwind # canonical Tailwind classes in web + desktop UI
```

`just check` / `just test` call the Bun-orchestrated commands.

## Contracts, i18n, and features

- `packages/contracts` is the source for HTTP/event schemas. `bun run codegen`
  is a scaffold placeholder; wire OpenAPI/JSON Schema generation next.
- `packages/i18n/messages/en.json` and `es.json` are the source locales;
  `bun run i18n:check` verifies key parity.
- `bun scripts/new-feature.ts <name>` creates a Rust and TypeScript feature
  skeleton. Wire the API/worker adapters, i18n keys, a11y labels, tests, and
  feature flag afterwards.

## Status

Scaffold only. The next milestones are:

1. Decide the desktop UI stack: gpui-kit or the NSH/TSX prototype in
   `apps/desktop-ui` (ADR 0006). Until then, `apps/desktop` remains the Rust
   scaffold.
2. Implement Hono identity/devices/billing/channels/templates/audit modules.
3. Implement the Bun sync WSS cursor/event loop.
4. Implement the Postgres `outbound_jobs` worker claim/dispatch loop.
5. Wire OpenAPI generation and generated Rust/TS clients.
6. Add shadcn web screens, contract tests, and CI artifacts.
