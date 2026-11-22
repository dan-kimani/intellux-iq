# Product & Technical Specification: IntelluxIQ

**Version:** 2.0.0

**Status:** Draft for engineering review

**Date:** 2026-11-20

**Architecture:** Multi-tenant cloud control plane + offline-capable (local-cache) desktop CRM

**Target Domain:** High-volume multi-agent WhatsApp, Messenger, Instagram, TikTok, email, and voice sales intelligence

## Contents

- Executive Summary & Product Vision

1. System Architecture — topology, tenancy, devices, sync, offline behavior, cloud egress, console, users/sessions, idle lock, stack, catalog, routing
2. WhatsApp templates
3. WhatsApp media limits and conversion
4. Quoting math, including the Brand and Template Studio
5. Email completeness and mailbox discovery
6. Sales intelligence and AI
7. Data Model and Schema
8. Protocol and events
9. Security, compliance, entitlements
10. Roadmap and open decisions
11. Voice (Phase 3)
12. Engineering Contract and Release
13. Audio Handling
14. Web Console, Accessibility, Internationalization, and Modularity

- Appendices A–D: WhatsApp error codes, quoting examples, email statuses, messaging onboarding

## Executive Summary & Product Vision

### The problem

When retail, manufacturing, wholesale, and high-ticket B2B/B2C businesses scale beyond a handful of salespeople handling hundreds of daily inquiries across WhatsApp, social messaging, email, and phone, the standard workflow breaks:

1. **Response collisions and channel fragmentation.** Multiple reps reply to the same lead while email, social, and phone history sit disconnected from each other.
2. **Product lookup and quoting friction.** Reps hunt through drives, phones, and spreadsheets for photos, videos, current prices, and branded quote templates; buyers move to faster competitors.
3. **Zero manager visibility.** Managers cannot see why quoted deals fail across chat, email, and voice, or which reps are bottlenecked.
4. **Per-seat SaaS bloat and browser lag.** Web CRMs charge per seat and degrade once an agent manages hundreds of threads, high-resolution media, and live audio.

### The product

**IntelluxIQ** is a native, GPU-accelerated omnichannel sales platform written in **Rust** using **`gpui-kit` (`gpui-fast`)**. It separates the product into two parts:

- **Cloud control plane (`app.intelluxiq.com`).** Multi-tenant SaaS for identity, users, devices, subscription, channel connections, provider ingress/egress, the event log, media, audit, deterministic sales intelligence, and the AI stub. It is **not** a web CRM: no inbox, composer, or quote builder.
- **Desktop CRM.** The `gpui-fast` application with an encrypted local SQLite cache, catalog, quote builder, Typst PDF generation, offline outbox, and (Phase 3) softphone. Desktops never store provider secrets.

All external provider I/O goes through the cloud. The cloud is authoritative for shared state — users, devices, conversation assignments, opportunity ownership/stage, quote numbers, and provider sends — while every desktop keeps a local cache. All CRM events are delivered to every linked device in the org; write access is constrained by conversation assignment for messaging and opportunity ownership for deal/quote changes. A sales user can view every conversation and opportunity but can write messages only in conversations assigned to them; opportunity changes require ownership or manager/admin rights. Unassigned conversations are read-only until a manager or the routing engine assigns them.

This gives the customer the responsiveness of a native app and the offline tolerance of a local cache, without asking a manager's laptop to be the server. It also removes per-seat pricing: the subscription scales by organisation, channel connections, and usage rather than by salesperson.

### Scope and non-goals (2.0.0)

**In scope:** cloud control plane and egress, org-wide event sync, WhatsApp messaging/templates/media, Messenger/Instagram/TikTok social messaging where provider access is approved, email outbound/inbound, catalog and media sync, branded PDF quotations, quoting math, user/device/session management, idle lock and local wipe, deterministic sales intelligence (opportunities, lead recovery, pipeline/outcome metrics), and an AI stub.

**Deferred:** native voice and video (Phase 3), real AI transcription/autopsy (post-2.0), a web CRM inbox, and the `meet.intelluxiq.app` video-demo product. Voice remains in the architecture as a cloud-signaling/desktop-media module; it is not part of the 2.0.0 core.

## 1. System Architecture

### 1.1 Decision

All external provider I/O goes through the cloud. The desktop never contains SMTP/IMAP protocol code or stores Meta tokens, SMTP/IMAP credentials, or Twilio/Africa's Talking keys. The cloud is a multi-tenant SaaS control plane and egress gateway; the desktop remains the CRM with its own encrypted SQLite database.

The cloud is **not** a web CRM. `app.intelluxiq.com` has no inbox, composer, or quote builder. It provides identity, device management, subscription, channel connections, event sync, provider egress/ingress, media, audit, pipeline/intelligence dashboards, and the AI stub.

Because ingress/egress and shared state live in the cloud, no desktop—including the manager's—needs to be online for another desktop to keep working; only the cloud must be available. If the cloud is down, desktops fall back to local read/draft/quote behavior (§1.8).

### 1.2 Topology

```text
+--------------------------- Providers ---------------------------+
| WhatsApp | Messenger | Instagram | TikTok | Email | Voice      |
+-----------------------------------------------------------------+
                              | webhooks / API
                              v
+--------------------------- Cloud Control Plane -------------------+
| Console/API | Identity & Devices | Subscription & Entitlements    |
| Ingress | Event Log & Sync | Provider Egress | Media Service       |
| Routing & Assignment | Quote Sequences | Audit | Intelligence    |
+------------------------------+-----------------------------------+
                               | WSS events + HTTPS commands
                 +-------------+-------------+
                 v                           v
        Desktop #1 (SQLite)          Desktop #N (SQLite)
        Conversations / Pipeline     Conversations / Pipeline
        Local cache / Outbox         Local cache / Outbox
```

The web console (Next.js) and public API/BFF (Hono) are separate from the Bun sync/egress plane: `/api/*` is HTTP and `/sync` is WSS. Rust is desktop-only.

### 1.3 Cloud components

| Component           | Responsibility                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web console         | Next.js App Router manager console on Bun for orgs, users, devices, subscription, channels, audit, support. No inbox.                                               |
| Public API/BFF      | Hono on Bun for web API activities: auth/session, orgs/users/roles, devices/sessions, subscription/billing, channels, templates, audit, support, signed media URLs. |
| Identity & devices  | OIDC/MFA, link codes, device certificates, sessions, revocation, remote wipe, posture.                                                                              |
| Subscription        | Plans, entitlements, usage metering, invoices, payment methods, device caps, grace.                                                                                 |
| Channel connections | WhatsApp connection → WABA → phone hierarchy, Messenger Pages, Instagram accounts, TikTok Business accounts, email accounts, voice trunks; encrypted secrets; health. |
| Ingress             | App-level Meta/TikTok webhooks; signature verification; asset-to-tenant mapping; dedupe; raw event store.                                                           |
| Egress              | Bun provider gateway: outbound job queue; WhatsApp/Meta/TikTok/email/voice adapters; retries, rate limits, idempotency, status callbacks.                            |
| Event log & sync    | Bun sync plane: per-org monotonic sequence; commands; events; per-device cursors; snapshots; tombstones.                                                            |
| Coordination        | Conversation routing/assignment, opportunity ownership/stage, presence, typing, quote sequences, approvals, SLA timers.                                             |
| Media               | Object storage; BLAKE3; thumbnails; WhatsApp/Meta/TikTok/email variants; signed URLs; quotas.                                                                       |
| Sales intelligence  | Deterministic signals, recovery queue, pipeline, outcome metrics; no AI dependency.                                                                                 |
| Audit/observability | Immutable audit, metrics, tracing, tenant health.                                                                                                                   |

### 1.4 Desktop components

| Component       | Responsibility                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------- |
| gpui client     | Conversations, pipeline, lead recovery, composer, catalog drawer, quote builder, brand studio, settings. |
| Local SQLite    | Encrypted cache of contacts, conversations, opportunities, signals, catalog/quotes; FTS5; outbox; cursors; blocks. |
| Sync client     | Commands to cloud; events from cloud; resume cursor; conflict handling.                           |
| Media cache     | Thumbnails, originals, WhatsApp/Meta/TikTok/email variants; LRU/quota.                            |
| Quote compiler  | Typst PDF generation; local preview.                                                              |
| Audio service   | Capture/playback, Opus/AAC/MP3 decode, resampling, device hot-plug; call audio in Phase 3.        |
| Local security  | Argon2id unlock password, wrapped DEK, idle timer, failed-attempt counter.                        |
| Softphone       | Phase 3; media via str0m; signaling via cloud.                                                    |
| Device identity | Ed25519 key; device cert; local encryption key; remote wipe.                                      |

### 1.5 Tenancy and device lifecycle

- Every cloud row carries `org_id`; Postgres RLS enforces isolation; composite tenant keys/FKs reject cross-org references; per-tenant KMS data keys; per-tenant object prefixes; per-tenant rate limits and quotas.
- Desktop keeps one SQLite database per org/device, encrypted with SQLCipher; key in OS keychain; wipe on unlink.
- LAN mDNS/iroh pairing is no longer required; cloud device linking replaces it. An optional LAN media cache can be added later for bandwidth, but it is not an authority.
- **Device link:** manager opens Devices → Link device and gets a one-time code/QR (short TTL); the desktop enters/scans it, generates an Ed25519 keypair, and sends the public key; the cloud binds the device to the org/user, issues a certificate and device-bound refresh token, and the desktop receives an authorized bootstrap snapshot.
- **Device unlink:** revoke certificate and sessions immediately; stop event delivery; enqueue wipe; if offline, set `wipe_status = pending` and wipe on next connection; audit.
- **Reassign:** wipe local cache, issue new credentials, bootstrap as the new user.
- **Device limits:** plan cap enforced at link; posture checks (OS version, app version, disk encryption); forced minimum version.
- **Lost device:** unlink, wipe, rotate local encryption key; audit.

**Console device list:** device name, assigned user/role, OS, app version, last seen, online state, sync cursor lag, local storage, health, channel assignments. Actions: link (code/QR), unlink, remote wipe, force sync, collect logs, reassign user, disable, force update. The plan device count and upgrade prompt are shown here; every action is audited.

### 1.6 Authority matrix

| State/action                           | Authority                                     |
| -------------------------------------- | --------------------------------------------- |
| Orgs, users, roles, devices            | Cloud web console                             |
| Subscription, entitlements, usage      | Cloud                                         |
| Channel connections and secrets        | Cloud                                         |
| Inbound provider events                | Cloud                                         |
| Outbound WhatsApp/social/email/voice   | Cloud egress                                  |
| WhatsApp templates, 24h window, opt-in | Cloud policy                                  |
| Conversation assignment/routing        | Cloud routing or manager                      |
| Opportunity owner/stage/value          | Cloud: owner or manager/admin                  |
| Sales intelligence signals/outcomes    | Cloud deterministic rules and aggregates       |
| Presence/typing                        | Ephemeral, informational only                 |
| Event visibility                       | All linked org devices (org-wide stream)      |
| Write authorization                    | Cloud: assigned sales user or manager         |
| Quote numbers                          | Cloud sequence blocks                         |
| Catalog/template/quote state           | Cloud source of truth; desktop cache          |
| Catalog/brand editing                  | Manager desktop (2.0); cloud stores/publishes |
| Quote compilation/PDF                  | Desktop                                       |
| Local search                           | Desktop                                       |
| Call signaling/routing                 | Cloud; media on desktop (Phase 3)             |
| CRM UI/inbox                           | Desktop only                                  |
| Sessions/termination                   | Cloud: refresh, revoke, wipe                  |
| Security policy / idle lock            | Cloud policy + local enforcement              |
| Unlock / local wipe                    | Desktop, policy-bound                         |
| AI                                     | Cloud stub (§6.8)                              |

### 1.7 Sync model

- **Commands** (desktop → cloud): `client_command_id`, `idempotency_key`, `expected_version`; cloud authorizes, applies business rules, emits events.
- **Events** (cloud → desktop): `event_id`, `org_id`, `seq`, `type`, `entity_type`, `entity_id`, `schema_version`, `payload`, `actor`, `created_at`.
- Per-org monotonic `seq`; per-device cursor; WebSocket for live; HTTPS catch-up; snapshot if the cursor is older than retention.
- Tombstones for deletes; idempotent apply; at-least-once delivery; client dedupe; ordered per entity.
- **Org-wide fan-out:** every linked device in the org receives every CRM event; there is no per-device event filtering.
- **Read-only by conversation assignment:** all `sales` users can view all conversations and opportunities, but a conversation not assigned to them is read-only for messaging (composer disabled, server rejects writes). Unassigned conversations are read-only for sales until routing or a manager assigns them. Opportunity ownership separately governs stage, value, products, and quotes — see §8.5.
- Media never over WebSocket; `MediaReady` carries a signed URL and BLAKE3 hash.
- Schema/event versioning; minimum client version; rolling upgrade compatibility.

### 1.8 Offline behavior

| Action                      | Offline/cloud-down behavior                                     | Reconnect                           |
| --------------------------- | --------------------------------------------------------------- | ----------------------------------- |
| Read threads/catalog/search | Local SQLite/FTS5                                               | No change                           |
| Compose/send any channel | Queue in outbox; status `queued`                                    | Cloud egress sends; idempotent      |
| Create quote/PDF            | Local Typst; consume reserved quote number block                | Report block usage; sync quote      |
| Conversation edit           | Read-only unless assigned to the actor; drafts local            | Reassignment conflict; send blocked |
| Opportunity stage/quotes    | Owner/manager only; online stage change                         | Conflict if stale; quote sync       |
| Assign/reassign             | Online only                                                     | Conflict if stale                   |
| Catalog/brand edit          | Online publish only; drafts local                               | Publish on reconnect                |
| Calls                       | Unavailable offline; inbound routes to online devices/voicemail | Re-register                         |
| Subscription                | Cached entitlement lease; grace period                          | Refresh entitlements                |
| Session refresh             | Access token expires; offline grace; refresh on reconnect       | Refresh or lock                     |
| Idle lock                   | Local timer; cached policy; password unlock                     | Same                                |
| Failed unlock (3)           | Local cryptographic wipe; report on reconnect                   | Re-link                             |
| Termination                 | Wipe pending; local data encrypted                              | Wipe and exit                       |
| Device unlink               | Cloud; wipe on next connection                                  | Wipe                                |

### 1.9 Catalog and media origin

- Cloud object storage is the origin; manager desktop publishes catalog/template changes via commands; cloud stores and fans out.
- BLAKE3 content addressing; thumbnails synced first; full media on demand with LRU, not full replication by default (fixes the 25k-SKU storage blow-up).
- Desktop SQLite caches metadata, thumbnails, and requested media; quote templates and brand assets cached locally for offline PDFs.
- Cloud media service produces variants: `original`, `thumb_webp`, `wa_image`, `wa_video`, `email_image`, `quote_pdf` (§3).

### 1.10 Provider ingress and egress

**Ingress:**

- Endpoints: `GET|POST /v1/webhooks/meta` for WhatsApp, Messenger, and Instagram; `POST /v1/webhooks/tiktok`; `/v1/webhooks/email/{org}/{account}`; `/v1/webhooks/voice/{provider}/{org}`. Meta/TikTok callbacks are app-level, not per-org.
- Authenticity: Meta `X-Hub-Signature-256` HMAC; TikTok `TikTok-Signature` HMAC-SHA256; Twilio `X-Twilio-Signature`; Africa's Talking shared secret plus IP allowlist (verify current docs); email provider signature/shared secret. Verify against the raw body.
- Tenant mapping: resolve `org_id` from the WhatsApp phone number ID or WABA ID through the explicit WhatsApp hierarchy (§1.10.1, §7.1), Page ID, Instagram account ID, TikTok open ID, email account, or voice number; reject unknown or ambiguous assets. The client never supplies the tenant. A WABA is never treated as a sendable asset.
- WhatsApp uses the `account_update` webhook for lifecycle changes, including restrictions, revocation, and disconnection; presence of a token alone is not complete onboarding. Phone-number events resolve through `whatsapp_phone_numbers`; WABA-level events resolve through `whatsapp_business_accounts`.
- Dedupe: `webhook_events` unique on `(org_id, provider, external_id, event_type)`; store raw payload; normalize; enqueue. Meta/TikTok retries and out-of-order delivery are expected.
- Return HTTP 200 within five seconds; process asynchronously. Status callbacks are normalized into `message.status_updated`, `email.status_updated`, `call.updated`.

**Egress:**

- `outbound_jobs` queue per tenant/channel; idempotency key; retries with jitter; dead-letter after max attempts.
- Provider adapters: WhatsApp Cloud API, Messenger Send API, Instagram Messaging, TikTok Business Messaging, email (SMTP/API), voice (signaling/tokens). Provider policy/window checks run before enqueue.
- Per-tenant and per-channel rate limits; backoff on 429/131056; provider error mapping to user-visible codes.
- Cloud uploads media to the provider and caches `media_id` per number/expiry; desktop never calls providers.
- Success/failure metrics per provider, channel, and tenant; alert on error-rate spikes.

Messaging onboarding, token exchange, and app-level callback routing are normative in Appendix D. Direct Embedded Signup v4 is the default WhatsApp path. A BSP/Solution Partner is an optional adapter for unusual onboarding or commercial/billing arrangements; no BSP-specific field, service, or token is required by the core WhatsApp hierarchy, and one BSP must never be the only path.

### 1.10.1 WhatsApp account hierarchy

WhatsApp is not a flat channel account. The cloud models three tenant-scoped levels:

```text
Organisation
  └── WhatsApp channel connection       (onboarding, Meta business portfolio, lifecycle)
        └── WABA                         (token, permissions, templates, webhook, account status)
              ├── Phone number 1  ──1:1── channel_accounts (send target)
              ├── Phone number 2  ──1:1── channel_accounts
              └── Phone number 3  ──1:1── channel_accounts
                    (registration, verification, quality, throughput, calling)
```

- The **connection** records how the customer onboarded, the Meta business portfolio ID, granted permissions, onboarding completion/failure, and revocation/disconnection. It is the lifecycle and audit anchor, not a sendable asset.
- The **WABA** is the unit for templates, token reference, permissions, webhook subscription, account/review status, and the Meta billing relationship. One connection may contain more than one WABA.
- The **phone number** is the unit for registration, verification, quality, messaging limit, throughput, calling capability, and the send target. One WABA may contain several numbers.
- `channel_accounts` is a cross-channel routing projection, one row per WhatsApp phone number. It is not the WhatsApp account model and never stores WABA IDs, token references, or number registration state. See §7.1 and Appendix D.7.

Tokens live only in the cloud vault and are referenced by a `token_ref`; they never appear in an event, log, or desktop cache. Meta messaging/calling charges are customer-owned and never mixed into an IntelluxIQ invoice; see §9.5 and §12.6.

### 1.11 Manager console scope

`app.intelluxiq.com` is a Next.js App Router manager console on Bun, not an inbox. It calls the Hono `/api` surface and never queries Postgres directly. It provides:

| Area            | Capabilities                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Organization    | Org profile, base currency, timezone, data region, branding.                                                                               |
| Users and roles | Add/invite, remove/deactivate, role assignment (`owner`, `admin`, `manager`, `sales`, `finance`, `viewer`), MFA/SSO.                       |
| Devices         | Link (code/QR), list, health/version/last seen, unlink, terminate, remote wipe, force sync, collect logs, reassign, disable, force update. |
| Sessions        | Active sessions per user/device, last refresh, revoke session, terminate device.                                                           |
| Security        | Idle-timeout default/max, password requirement, per-user pin, force lock, 3-attempt local wipe, audit.                                     |
| Subscription    | Plan, usage, device/channel counts, invoices, payment method, upgrade/cancel, grace state.                                                 |
| Channels        | WhatsApp connection/WABA/phone hierarchy with Embedded Signup v4, Messenger Pages, Instagram professional accounts, TikTok Business Messaging (provider-gated), templates, email accounts (provider auth, folder preview, owner/default), voice numbers; health and quality. |
| Audit           | User add/remove, role changes, device link/unlink/terminate/wipe, session revoke, billing, exports, support access.                        |
| Pipeline        | Read-only opportunity funnel, stage conversion, aging, win/loss, and revenue outcomes.                                                     |
| Intelligence    | Lead-recovery queue, conversation health, follow-up compliance, team outcomes, and signal drill-down.                                      |
| Support         | Time-bound support access with customer consent and full audit; diagnostics bundle.                                                        |

No inbox, composer, catalog editor, or quote builder in 2.0. Manager pipeline/intelligence dashboards are read-only views; sales work remains desktop-first. Moving catalog/brand admin to the web is an open decision (§10.2). Email account setup is a settings surface, not an inbox; a sales user sees only their own accounts there.

### 1.12 Users, sessions, and termination

**Users and roles**

- The manager account manages users in `app.intelluxiq.com`; the desktop has no user admin.
- Roles: `owner`, `admin`, `manager`, `sales`, `finance`, `viewer`. A `sales` user can read all CRM data in the org but can send only in conversations assigned to them; opportunity stage/value/quotes require ownership or manager/admin rights. A `sales` user can reach only the web email-account setup page for an account they own, not manager/admin console pages. `finance` and `viewer` are console roles in 2.0 and do not link CRM desktops.
- Managers can add/invite and remove/deactivate `sales` users; owners/admins can manage managers.
- Removing a user: revoke sessions, terminate all their devices, unassign their conversations (return to the assignment queue), reassign or queue their opportunities, retain audit/data per org policy.
- Invitations are email-based, expire, and are audit-logged.

**Sessions**

- Desktop login uses a device-code flow in the web auth service; the device receives a device-bound refresh token and a short-lived access token (15 minutes).
- The desktop refreshes the access token via `POST /v1/auth/refresh`. Refresh checks user status, device status, and entitlement; the refresh token rotates.
- The only long-lived credential stored locally is the refresh token (the device key also lives in the OS keychain). Passwords and provider secrets are never stored on the desktop.
- If refresh fails with `DEVICE_TERMINATED`, `USER_DISABLED`, or `SESSION_REVOKED`, the desktop locks and wipes local content. Transient network/5xx errors retry with backoff and never trigger a wipe.
- Offline lease: the desktop may operate offline for a configurable window (default 7 days) since the last successful refresh; after that it locks until it can refresh. This bounds exposure for a device that never reconnects; it is not a remote wipe.

**Termination and wipe**

- A manager terminates a device from the web console. The cloud revokes the device certificate and all sessions, marks the device `terminated`, emits `device.terminated`, and enqueues a wipe.
- If the device is online, it wipes immediately on the termination event and returns to the link screen.
- If the device is offline, the wipe is `pending`; on the next refresh or WebSocket connection, the refresh is denied and the device wipes. A powered-off or permanently offline device cannot be wiped remotely; its local database remains encrypted, and OS-level MDM/remote wipe is the fallback.
- Wipe scope: the SQLCipher database and WAL/SHM files, media cache, generated PDFs, attachments, logs, keychain tokens, and the device key. Destroying the SQLCipher key makes the database unreadable; file deletion is best-effort on SSDs.
- The device acknowledges the wipe; the console shows `pending`, `sent`, `acked`, or `failed`, with an audit trail.
- `unlink` and `terminate` both revoke and wipe; `terminate` is the explicit security action for a lost or compromised device.

**Session/termination API**

| Endpoint                                     | Purpose                                                                     |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| `POST /v1/orgs/{org}/users/invite`           | Invite a user with a role.                                                  |
| `PATCH /v1/orgs/{org}/users/{id}`            | Change role/status; disable user.                                           |
| `DELETE /v1/orgs/{org}/users/{id}`           | Deactivate/remove user; revoke sessions and terminate devices.              |
| `POST /v1/orgs/{org}/devices/{id}/terminate` | Revoke and wipe a device.                                                   |
| `POST /v1/auth/refresh`                      | Rotate access/refresh tokens; denied for disabled users/terminated devices. |
| `POST /v1/auth/revoke`                       | Revoke the current session.                                                 |

### 1.13 Idle lock and local wipe

**Policy**

- Every desktop has an idle-lock timeout. Default 10 minutes; allowed values are 1, 5, 10, 15, 30, and 60 minutes; hard minimum 1 minute.
- The manager sets the org default and maximum in `app.intelluxiq.com`. A user may choose any allowed value up to the maximum; the user cannot exceed the maximum or disable the lock.
- A manager may pin a per-user timeout; the user cannot change a pinned value. The manager can force-lock a device from the console.
- Policy changes sync via `security.policy_updated`; the desktop applies them immediately and locks if the new timeout is already exceeded.
- The three-attempt limit and wipe-on-third-failure are mandatory and cannot be disabled by the user.

**Idle detection**

- Activity means keyboard, mouse/touch, and app focus. Background sync/events do not count as activity.
- Lock on idle timeout, OS session lock, sleep/resume, or manual lock. A 30-second warning is shown before the timeout.
- The lock screen hides message content, previews, and customer data.
- Active call: the idle timer pauses until the call ends by default; strict mode can lock during a call (open decision).
- Locking zeroizes the in-memory data-encryption key and hides the UI. It does not sign the user out or revoke the session.
- While locked, the desktop stops applying events and media downloads; on unlock it resumes from its sync cursor.

**Unlock credential**

- A device-local unlock password (minimum 8 characters) is set at device link. It is independent of the account password and is never sent to the cloud.
- Argon2id hash and salt live in OS keychain/secure storage; the data-encryption key (DEK) is wrapped by a key derived from the unlock password.
- On lock, the unwrapped DEK is zeroized. On unlock, it is re-derived and unwrapped; verification is constant-time and passwords are never logged.
- The user can change the unlock password after a successful unlock; changing it rewraps the DEK. A manager cannot see or recover it.
- **Why local:** the desktop must unlock offline and never stores account credentials. If you require the account password specifically, that needs online verification or a cached account-password verifier — open decision.
- Implementation: `argon2` (Argon2id), `chacha20poly1305` or `aes-gcm` for DEK wrapping, `zeroize`, OS keychain.

**Failed attempts and wipe**

- Three consecutive failures. The counter is persisted in secure storage, survives restart, and is not reset by relaunching. A short delay is applied between attempts.
- The setup flow and lock screen warn that three failures erase local data; after the second failure, the UI shows one attempt remaining.
- A successful unlock resets the counter; missing or tampered counter data is treated as a wipe condition.
- On the third failure: cryptographic erasure (destroy the wrapped DEK) plus deletion of the SQLCipher database and WAL/SHM, media cache, generated PDFs, attachments, logs, cache, refresh/access tokens, and the data-encryption key.
- A minimal device identity and wipe receipt remain (`device_id`, timestamp, reason) with no customer data: the device identity key/cert is retained only to report the wipe and allow re-linking, and is rotated on re-link. Refresh tokens, data keys, and all customer data are destroyed. The device returns to the link screen.
- If online, the device emits `device.local_wipe`; if offline, it reports on the next connection. The wipe is irreversible; there is no password recovery — the manager must terminate and re-link.
- Deletion is best-effort on SSDs; forensic copies and backups are outside the local-wipe guarantee. Argon2id makes offline brute force expensive, and the three-attempt wipe removes the device's copy.

**Policy API**

| Endpoint                                   | Purpose                                                   |
| ------------------------------------------ | --------------------------------------------------------- |
| `GET /v1/orgs/{org}/security-policy`       | Read org default/max and required controls.               |
| `PATCH /v1/orgs/{org}/security-policy`     | Manager sets default/max and force-lock policy.           |
| `GET /v1/me/security`                      | Effective policy for the current user/device.             |
| `PATCH /v1/me/security`                    | User sets an allowed timeout; rejected if manager-pinned. |
| `PATCH /v1/orgs/{org}/users/{id}/security` | Manager pins a per-user timeout.                          |
| `POST /v1/orgs/{org}/devices/{id}/lock`    | Force-lock a device now.                                  |

### 1.14 Technology stack and performance

**Web and public API**

- Next.js App Router, React, and TypeScript for `app.intelluxiq.com`, running on Bun; Hono on Bun for the public `/api`; PostgreSQL with RLS, Redis, S3-compatible object storage, KMS, and WAF.
- Locked baseline (2026-11-17): Bun 1.4.4, Next.js 16.4.6, React 19.3.1, TypeScript 7.0.2, Hono 4.13.19, Zod 4.6.7, Drizzle ORM/Kit 0.45.4/0.31.11, postgres 4.1.1, Tailwind CSS 4.3.5, shadcn 4.23.0, Recharts 3.10.1, Oxlint 1.94.0/Oxfmt 0.79.0, Turborepo 2.11.11; Rust `tracing`/`tracing-subscriber` 0.1.44/0.3.23.
- Auth.js/OIDC session for the web console; device-code + short-lived tokens for desktop; shared Zod/OpenAPI contracts, `next-intl`, shadcn/ui (Radix), axe-core, and Playwright.
- Stripe/Paddle plus an M-PESA-capable provider for Kenya; billing and entitlement enforcement live in Hono.

**Sync and egress**

- Bun/TypeScript services for the event log/WSS, provider ingress/egress, media/audio workers, and WebSocket fan-out; Hono authorizes and enqueues, but does not duplicate their business rules.
- Durable Postgres `outbound_jobs` queue; provider adapters for WhatsApp, Meta social messaging, TikTok, email, and voice; FFmpeg child processes for media/audio; OpenTelemetry across the Hono/Bun-service boundary.
- No tenant data in shared caches without a tenant key; every table carries `org_id`.

**Desktop**

- `gpui-kit` with the `gpui-fast` backend (Metal, Vulkan, DirectX 12), dockable panes, virtualized lists, GPU image cache, GPU charts, AccessKit accessibility, and headless UI tests.
- `sqlx` + SQLCipher SQLite in WAL mode with FTS5; `blake3` and `image` for content-addressed media; `typst` for PDFs.
- No SMTP/IMAP libraries or sockets on the desktop; email protocol work is cloud-only (§5). `cpal`, `opus`, `rubato`, and a decoder for 2.0 voice notes; `str0m` for Phase 3 calls.
- `argon2` (Argon2id), `chacha20poly1305`/`aes-gcm`, `zeroize`, and OS keychain for the unlock password and wrapped data key; `fluent`/ICU for desktop i18n.
- The desktop never receives provider credentials; all sends are commands to cloud egress.

**Performance targets**

| Area                  | Target                                                  | Notes                                                                                                       |
| --------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Desktop frame rate    | 120 FPS target, p95                                     | Reference hardware and 120 Hz display; not a hard "locked" guarantee on 60 Hz panels.                       |
| Input latency         | ≤1 frame (8.33 ms at 120 Hz)                            | Measured input-to-render-submit; a 2 ms keystroke-to-photon target is physically inconsistent with 120 FPS. |
| Local search          | ≤3 ms p95 for prefix search over 25k products           | FTS5 prefix; fuzzy/trigram search has a separate, larger budget.                                            |
| Event propagation     | ≤500 ms p95 for a single small event on the same region | Bulk catalog imports and media are batched; not a per-item guarantee.                                       |
| PDF compilation       | ≤50 ms p95 warm for a 1–2 page quote                    | Cold start, fonts, and large images may exceed.                                                             |
| Cloud send acceptance | p95 API acceptance ≤300 ms                              | Provider delivery is outside this budget.                                                                   |
| Voice                 | ≤150 ms target (Phase 3)                                | Glass-to-glass; 120 ms is LAN/headset territory, not mobile.                                                |
| Memory                | Measured per workload, not a single headline number     | Local AI is out of scope; Whisper/LLM memory is not part of 2.0.0.                                          |

### 1.15 Catalog and media synchronization

The catalog is the product data every sales desktop needs for search, dispatch, and quoting. The cloud is the origin; the manager desktop publishes changes; every linked desktop caches metadata and thumbnails locally.

**Catalog records**

- `sku`, `name`, `category`, `sub_category`, `description`, `specs_json`, `unit_of_measure` (pcs, kg, m, hours, days), `unit_price_minor`, `wholesale_price_minor`, `currency`, `tax_bps`, `stock_qty`, `is_active`.
- Bulk import from CSV/Excel or an ERP webhook; validation, dedupe by SKU, and an import report. Manager/administrator permissions apply.
- Price and stock changes are audited; quotes snapshot the values used at creation.

**Media**

- Content-addressed by BLAKE3; identical assets are stored once per org.
- Variants: `original`, `thumb_webp` (≤40 KB), `wa_image` (JPEG/PNG), `wa_video` (H.264/AAC), `wa_audio` (OGG/Opus), `email_image`, and `quote_pdf`; calls add `call_recording` in Phase 3.
- Media lives in cloud object storage; desktops receive signed URLs and cache locally. Full media is **on demand**, not fully replicated by default, to avoid hundreds of gigabytes per laptop.
- Thumbnails and metadata sync first; full photos/videos are fetched when a rep opens or sends them. A local LRU cache has a configurable quota.

**Two-tier sync**

1. **Tier 1 — metadata and thumbnails.** A catalog change is appended to the org event log and delivered to every linked device. The device upserts product metadata, thumbnails, and quote-template configuration into SQLite/FTS5 within the propagation target.
2. **Tier 2 — full media on demand.** The desktop requests the BLAKE3 blob; the cloud issues a signed URL or streams chunks. Transfers are rate-limited during active calls.

**Search and dispatch**

- The catalog drawer queries local FTS5 for SKU, name, category, and spec keywords; prefix search is the 3 ms path.
- Clicking **Send Photo/Video** renders the cached preview immediately and sends `DispatchCatalogMedia { thread_id, product_id, media_id, blake3_hash, caption }`.
- Cloud egress resolves the hash, reuses a cached WhatsApp `media_id` for the same `phone_number_id` when unexpired, or uploads and caches a new one. The desktop never re-uploads a full asset to the cloud for a send.
- Offline: metadata and previously cached media remain available; uncached media is unavailable until the device reconnects. The quote PDF can still be generated from cached template assets.

### 1.16 Routing, assignment, and presence

**Contact resolution**

- Customers are unified by E.164 phone and/or email. WhatsApp, Messenger, Instagram, TikTok, email, and calls appear on one timeline with channel badges.
- A customer with both phone and email is linked to one contact; merge conflicts are resolved by the manager. A contact can have many conversations across channels and many opportunities over time; conversations are never globally limited to one open per contact. External conversations are unique per channel account/provider thread key, and identities are unique per org by kind/value.

**Routing**

- **Capacity-capped round-robin:** new inbound conversations go to online sales users below `max_active_chats`.
- **VIP sticky routing:** returning phone numbers or email domains route to their historical conversation owner.
- **Keyword/subject routing:** terms such as "bulk", "tender", or "wholesale" route to senior closers.
- **Manual assignment:** a manager can assign or reassign any conversation; opportunity ownership is assigned separately.
- Every conversation assignment records `assigned_user_id`, `assigned_at`, `assigned_by`, and `assignment_source` (`round_robin`, `vip`, `keyword`, `manual`, `unassigned`).

**Read-only and write access**

- All linked CRM devices receive all CRM events. All `sales` users can view all conversations and opportunities; 2.0 read visibility is org-wide, and per-conversation privacy is post-2.0.
- A conversation not assigned to the actor is read-only; the composer is disabled and the server rejects writes.
- Unassigned conversations are read-only for sales users until routing or a manager assigns them. There is no self-claim by sending.
- If a manager sends on an unassigned conversation, the cloud assigns it to that manager (audited) so ownership stays consistent.
- If a conversation is reassigned while a rep is composing, the send is rejected, the draft is preserved, and the UI updates to the new owner.
- Opportunity write access is separate: the opportunity owner or a manager/admin can change stage, value, products, links, and quotes. Conversation assignment controls messaging; opportunity ownership controls the deal.

**Presence and SLA**

- Presence (`online`, `idle`, `in_call`, `offline`) is heartbeat-based and ephemeral. Typing indicators are ephemeral and informational, not locks.
- Conversation assignment is the messaging lock; opportunity ownership is the deal lock. There are no conversation or opportunity leases.
- `threads.sla_deadline_at` is set by the routing policy; default first-response SLA is 4 business hours. A missed first response surfaces to the manager; the manager can reassign the conversation. Reminders are scheduled per conversation or opportunity.

**Rep workflow and manager coaching**

- `Cmd/Ctrl + K` command palette, `/` slash commands, tags (`#BulkOrder`, `#PricePushback`, `#VIP`), and native OS follow-up reminders.
- Manager notes are stored as `messages` with `sender_type = 'whisper'` and are never customer-visible. In 2.0 they are team-visible to all sales users; private manager-only coaching is post-2.0. Do not describe them as private in 2.0.
- AI lost-deal autopsy and forecasting are post-2.0. Deterministic lead recovery, pipeline conversion, and team outcome reporting ship in 2.0. The AI stub exposes the interface but returns `Disabled`; no AI data leaves the cloud or desktop.

## 2. WhatsApp templates

### 2.1 Scope

Every outbound WhatsApp message outside the 24-hour customer service window must use an approved template. Templates are owned by the WABA and are WABA-scoped in 2.0: a template can be used by every phone number in that WABA. Number-scoped templates are not implemented. The cloud is the source of truth; the desktop provides the template picker and preview. A WABA must first complete the WhatsApp Embedded Signup v4 onboarding in Appendix D and be represented by an explicit `whatsapp_business_accounts` row (§7.1).

### 2.2 Template model

| Field                      | Type       | Notes                                                            |
| -------------------------- | ---------- | ---------------------------------------------------------------- |
| `template_id`              | UUID       | Local ID                                                         |
| `org_id`                   | UUID       | Tenant                                                           |
| `waba_id`                  | UUID       | Internal WABA ID; Meta WABA ID is on `whatsapp_business_accounts` |
| `meta_template_id`         | text       | Meta ID                                                          |
| `name`                     | text       | Lowercase, underscores, unique per WABA/language                 |
| `language`                 | BCP-47     | e.g., `en`, `sw`                                                 |
| `category`                 | enum       | `MARKETING`, `UTILITY`, `AUTHENTICATION`                         |
| `status`                   | enum       | `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `PAUSED`, `DISABLED` |
| `components`               | JSON       | Header/body/footer/buttons                                       |
| `quality_score`            | text       | Meta quality                                                     |
| `rejection_reason`         | text       | Meta reason                                                      |
| `version`                  | int        | Immutable versions                                               |
| `created_at`, `updated_at` | timestamps |                                                                  |

### 2.3 Components and variables

| Component      | Rules                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header         | Optional; `TEXT` (≤60 chars), `IMAGE`, `VIDEO`, `DOCUMENT`, `LOCATION`; media sample required.                                                                                        |
| Body           | Required; ≤1024 chars; variables `{{1}}`..`{{n}}`; no newlines/tabs/4+ spaces in parameter values.                                                                                    |
| Footer         | Optional; ≤60 chars; no variables.                                                                                                                                                    |
| Buttons        | Quick reply (≤25 chars), URL (static/dynamic), phone number, copy code, flow, call permission (`voice_call_request`). Max 10 buttons total; per-type limits apply (verify Meta docs). |
| Authentication | OTP delivery; copy-code/one-tap buttons; security recommendations.                                                                                                                    |

- Variables are positional; each has a sample value; the desktop maps CRM fields or manual values and previews the rendered text.
- Validate lengths, forbidden characters, URL suffixes, media type/size before submission and before send.
- Localizations: one template per language; the UI groups them as a family.

### 2.4 Lifecycle

1. `DRAFT` — created in desktop/console; local validation.
2. `PENDING` — submitted to Meta; sync status via webhook/poll.
3. `APPROVED` / `REJECTED` — approved is sendable; rejected shows reason and allows edit/resubmit as a new version.
4. `PAUSED` / `DISABLED` — Meta quality/policy; not sendable; alert.
5. Edits create a new version; approved versions are immutable.
6. Status events stored in `wa_template_status_events`; audit.

### 2.5 Sending and policy

- Inside the 24-hour window: free-form allowed; templates optional.
- Outside the window: only `APPROVED` templates; marketing requires opt-in; utility/authentication per Meta policy.
- Cloud checks: template status, language, variable count/types, number-scoped opt-in, window, number quality/limit, rate limit, media limits.
- Render preview locally; send command with `template_id`, `version`, `language`, `parameters`, `media_id`/URL; cloud egress uploads/uses media and sends.
- Store rendered text, template version, parameters, and Meta message ID for audit.
- On failure, map Meta error codes to actionable messages (Appendix A).

### 2.6 Management UI

- List/filter by WABA, category, status, language. Templates are WABA-scoped; the send target is chosen by the conversation.
- Create/edit wizard with component builder, variable samples, live preview.
- Submit, sync status, view rejection reason, duplicate, add localization, test send (to an approved test number).
- Permissions: manager/admin can create/submit; reps can use approved templates only.
- Template picker in composer: search, preview, fill variables, auto-select based on window/category.

**API surface:**

| Endpoint                                          | Purpose                                              |
| ------------------------------------------------- | ---------------------------------------------------- |
| `GET /v1/orgs/{org}/wa/templates`                 | List/filter by WABA, status, language, category.     |
| `POST /v1/orgs/{org}/wa/templates`                | Create draft.                                        |
| `PATCH /v1/orgs/{org}/wa/templates/{id}`          | Create a new version from a draft/rejected template. |
| `POST /v1/orgs/{org}/wa/templates/{id}/submit`    | Submit to Meta.                                      |
| `POST /v1/orgs/{org}/wa/templates/{id}/sync`      | Pull status/quality from Meta.                       |
| `POST /v1/orgs/{org}/wa/templates/{id}/test-send` | Send to an approved test number.                     |
| `DELETE /v1/orgs/{org}/wa/templates/{id}`         | Delete draft/unused template only.                   |

### 2.7 24-hour window, opt-in, quality

| Control | Behavior                                                                                                                                |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Window  | `thread.wa_window_expires_at` set on inbound customer message; free-form only before expiry; UI shows countdown.                        |
| Opt-in  | `wa_opt_ins` records the sending WhatsApp number, phone, category, source, timestamp, evidence; STOP/START keywords update status per number; marketing is blocked without opt-in for that number. |
| Quality | Per-number `quality_rating` (green/yellow/red), `messaging_limit`, `throughput`; sync from Meta; throttle and alert.                    |
| Limits  | Per-number rate limits; backoff on 429/131056; no retry storms.                                                                         |

### 2.8 Data model

```sql
CREATE TABLE wa_templates (
  template_id UUID NOT NULL,
  org_id UUID NOT NULL,
  waba_id UUID NOT NULL,
  meta_template_id TEXT,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  components JSONB NOT NULL,
  quality_score TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, template_id),
  UNIQUE (org_id, waba_id, name, language),
  FOREIGN KEY (org_id, waba_id)
    REFERENCES whatsapp_business_accounts (org_id, waba_id)
);
CREATE TABLE wa_template_versions (
  org_id UUID NOT NULL,
  template_id UUID NOT NULL,
  version INT NOT NULL,
  components JSONB NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, template_id, version),
  FOREIGN KEY (org_id, template_id) REFERENCES wa_templates (org_id, template_id)
);
CREATE TABLE wa_template_status_events (
  id UUID NOT NULL,
  org_id UUID NOT NULL,
  template_id UUID NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, id),
  FOREIGN KEY (org_id, template_id) REFERENCES wa_templates (org_id, template_id)
);
CREATE TABLE wa_opt_ins (
  org_id UUID NOT NULL,
  wa_phone_number_id UUID NOT NULL,
  phone_e164 TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL, -- opted_in | opted_out
  source TEXT NOT NULL,
  evidence JSONB,
  captured_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, wa_phone_number_id, phone_e164, category),
  FOREIGN KEY (org_id, wa_phone_number_id)
    REFERENCES whatsapp_phone_numbers (org_id, wa_phone_number_id)
);
```

The `whatsapp_business_accounts` and `whatsapp_phone_numbers` parent tables are defined in §7.1; apply them before these foreign keys in a migration.

## 3. WhatsApp media limits and conversion

### 3.1 Limits

| Media    | Max size | Accepted formats                 | Notes                                                        |
| -------- | -------- | -------------------------------- | ------------------------------------------------------------ |
| Image    | 5 MB     | JPEG, PNG                        | WebP is **not** accepted for image messages; 8-bit RGB/RGBA. |
| Video    | 16 MB    | MP4, 3GPP                        | H.264 video, AAC audio; single audio stream.                 |
| Audio    | 16 MB    | AAC, MP4, MP3, AMR, OGG          | Opus for OGG.                                                |
| Document | 100 MB   | PDF, DOCX, XLSX, PPTX, TXT, etc. |                                                              |
| Sticker  | 100 KB   | WebP, 512×512                    | If enabled; not core.                                        |
| Media ID | —        | —                                | Expires after 30 days; scoped to the uploading phone number. |

Caption ≤1024 chars; text body ≤4096 chars; audio ≤16 MB (OGG/Opus preferred); template limits per Meta docs. Audio capture/playback is specified in §13.

### 3.2 Desktop preflight

Before send, the desktop validates format, size, dimensions, duration, and codec. It offers **Optimize for WhatsApp** or blocks with a clear error. The original file is preserved locally; the delivery variant is separate.

### 3.3 Image pipeline

1. Decode; apply EXIF orientation; convert to sRGB; strip EXIF/GPS/metadata (privacy).
2. Resize longest edge to ≤4096 px (or 2048 px for smaller payloads).
3. Generate:
   - `thumb_webp`: ≤40 KB, for catalog sync/UI.
   - `wa_image`: JPEG quality 85–90, or PNG if transparency/logo and ≤5 MB.
   - `email_image`: JPEG/PNG per attachment policy.
4. Validate `wa_image` ≤5 MB and format JPEG/PNG.
5. Cache variants by BLAKE3 + profile; upload on demand.

**Important:** WebP is for local thumbnails/cache, not WhatsApp delivery. "Without losing quality" means visually lossless at q85–90; WhatsApp recompresses images anyway. Do not claim mathematically lossless.

### 3.4 Video pipeline

- Use a bundled FFmpeg sidecar (LGPL build) or platform encoder.
- Transcode to MP4, H.264, AAC, `faststart`, ≤1080p, target ≤16 MB.
- Two-pass bitrate if needed; if still >16 MB, lower resolution/bitrate or send as document (≤100 MB) with a warning.
- Show progress and preserve original; no silent quality loss.

### 3.5 Cloud egress validation

- Revalidate every upload; transcode if the desktop variant is invalid.
- Virus scan; cache variants; upload to Meta; store `media_id` per `wa_phone_number_id` with `expires_at` (30 days); refresh on expiry; dedupe by BLAKE3 + number.
- Never trust the desktop as the final gate.

### 3.6 Data model

```sql
CREATE TABLE media_variants (
  variant_id UUID NOT NULL,
  org_id UUID NOT NULL,
  blake3_hash TEXT NOT NULL,
  profile TEXT NOT NULL, -- original, thumb_webp, wa_image, wa_video, wa_audio, email_image, quote_pdf, call_recording
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  width INT, height INT, duration_ms INT,
  storage_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, variant_id),
  UNIQUE (org_id, blake3_hash, profile)
);
CREATE TABLE wa_media_cache (
  org_id UUID NOT NULL,
  wa_phone_number_id UUID NOT NULL,
  blake3_hash TEXT NOT NULL,
  media_id TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, wa_phone_number_id, blake3_hash),
  FOREIGN KEY (org_id, wa_phone_number_id)
    REFERENCES whatsapp_phone_numbers (org_id, wa_phone_number_id)
);
```

The `whatsapp_phone_numbers` parent table is defined in §7.1; apply it before this foreign key in a migration.

## 4. Quoting math

### 4.1 Conventions

- Money: integer minor units (`*_minor`), with `currency` and `currency_exponent`.
- Quantity: integer milli-units (`quantity_milli`), i.e., 2.5 kg = 2500.
- Rates: basis points (`bps`), 1 bps = 0.01%.
- FX: `fx_rate_micros` (quote currency per 1 base currency, 6 decimals); no floats.
- Rounding: HALF_UP at line level; `rounding_mode` configurable (`line` default, `total` optional).
- No floating-point money anywhere.

### 4.2 Definitions

For line `i`:

- `q_i` = quantity_milli
- `p_i` = unit price in quote currency minor units
- `d_i` = line discount bps
- `D` = global discount bps
- `t_i` = tax bps
- `inc_i` = tax-inclusive flag

### 4.3 Calculation order

1. `subtotal_i = round(q_i * p_i / 1000)`
2. `line_discount_i = round(subtotal_i * d_i / 10000)`
3. `net_i = subtotal_i - line_discount_i`
4. `global_discount_i = round(net_i * D / 10000)`, then adjust the remainder so `sum(global_discount_i) = round(sum(net_i) * D / 10000)`; assign remainder to the largest line.
5. `net_after_i = net_i - global_discount_i`
6. Tax:
   - Exclusive: `tax_i = round(net_after_i * t_i / 10000)`; `total_i = net_after_i + tax_i`.
   - Inclusive: `total_i = net_after_i`; `tax_i = round(total_i * t_i / (10000 + t_i))`; `net_ex_tax_i = total_i - tax_i`.
7. Totals:
   - `subtotal = sum(subtotal_i)`
   - `line_discount = sum(line_discount_i)`
   - `global_discount = sum(global_discount_i)`
   - `tax = sum(tax_i)`
   - `total = sum(total_i)`

**Implementation note:** compute intermediate products in `i128`; implement `round` as explicit HALF_UP integer division (numerator/denominator with remainder), never floating point. Validate overflow at the API boundary.

### 4.4 Tax summary

Group by `tax_code`/`t_i`:

- Exclusive: taxable base = `sum(net_after_i)`; tax = `sum(tax_i)`.
- Inclusive: taxable base = `sum(net_ex_tax_i)`; tax = `sum(tax_i)`.
- Zero-rated/exempt lines have `t_i = 0` and still appear in the summary.
- For tax-inclusive lines, `subtotal_i`/`net_after_i` are gross; `net_ex_tax_i` is the taxable base. Do not sum gross and net amounts together in reports.

### 4.5 Discounts and approvals

- Line discount and global discount are separate; global applies after line discounts.
- Approval threshold (bps or amount) per org/role; above threshold → `PENDING_APPROVAL`; manager approves/rejects; audit.
- Discounts cannot make a line negative; validate.

### 4.6 FX

- Product prices have `price_currency`. If it differs from quote currency, convert at a locked rate:
  `p_quote = round(p_price * fx_rate_micros / 1_000_000)`.
- Store `fx_rate`, `fx_rate_at`, `fx_source`; store base-currency totals for reporting.
- Rate is locked at quote creation; revisions preserve it by default; a new revision may re-lock explicitly.
- No implicit double conversion.

### 4.7 Quantity and UoM

| UoM   | Precision | Example |
| ----- | --------- | ------- |
| pcs   | 0         | 3       |
| kg    | 3         | 2.500   |
| m     | 3         | 12.750  |
| hours | 2         | 1.50    |
| days  | 1         | 2.5     |

Validate precision; reject more decimals than allowed.

### 4.8 Quote numbering

- Format: `{PREFIX}-{YYYY}-{SEQ}`; optional `{BRANCH}`; `SEQ` zero-padded.
- Online: cloud allocates atomically (`SELECT ... FOR UPDATE` / sequence).
- Offline: the cloud atomically reserves a block (`quote_number_blocks`), size 50; the device consumes offline and reports used numbers on reconnect; unused numbers expire; gaps allowed.
- If a block is exhausted offline: drafts can exist without a number; finalize/send is blocked until online or a new block is available.
- `UNIQUE (org_id, quote_number)`; never reuse.
- Audit allocation, consumption, expiry.

### 4.9 Lifecycle, validity, revisions

- Draft → preview → pending approval (if needed) → sent → accepted/expired.
- `valid_until` is a date in org timezone; default 7/14/30 days; expiry job.
- Quote language resolves from quote override → opportunity/contact locale → org default; PDF labels, terms, and payment block are localized.
- Every edit creates an immutable `quote_version`; sent versions are frozen.
- Store `template_snapshot_json` and PDF hash for reproducibility.
- `status = viewed` only if tracking is explicitly enabled; otherwise omit.

### 4.10 Worked example

Product A: 2.5 kg × KES 1,200.00/kg, 5% line discount, VAT 16% exclusive.
Product B: 1 pc × KES 10,000.00, VAT 0% (zero-rated).
Global discount 2%.

| Step             | A        | B         |
| ---------------- | -------- | --------- |
| Subtotal         | 3,000.00 | 10,000.00 |
| Line discount 5% | 150.00   | 0.00      |
| Net              | 2,850.00 | 10,000.00 |
| Global 2%        | 57.00    | 200.00    |
| Net after global | 2,793.00 | 9,800.00  |
| Tax              | 446.88   | 0.00      |
| Total            | 3,239.88 | 9,800.00  |

Quote: subtotal 13,000.00; line discount 150.00; global discount 257.00; tax 446.88; total 13,039.88.

### 4.11 Schema changes

```sql
ALTER TABLE quote_items
  ADD COLUMN quantity_milli BIGINT NOT NULL,
  ADD COLUMN unit_price_minor BIGINT NOT NULL,
  ADD COLUMN line_discount_bps INT NOT NULL DEFAULT 0,
  ADD COLUMN tax_bps INT NOT NULL DEFAULT 0,
  ADD COLUMN tax_inclusive BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN tax_code TEXT,
  ADD COLUMN line_subtotal_minor BIGINT NOT NULL,
  ADD COLUMN line_discount_minor BIGINT NOT NULL,
  ADD COLUMN global_discount_minor BIGINT NOT NULL,
  ADD COLUMN line_net_minor BIGINT NOT NULL,
  ADD COLUMN line_tax_minor BIGINT NOT NULL,
  ADD COLUMN line_total_minor BIGINT NOT NULL;
```

Add `quote_versions`, `quote_tax_lines`, `quote_number_blocks`, `fx_rates`, `approvals`, and `quotations.opportunity_id`. A quotation must belong to an opportunity; `thread_id` remains the optional source conversation. Replace `quantity INTEGER`; remove the single global `tax_bps` from `quotations` (keep only as a default).

**Migration note:** the `ALTER TABLE ... ADD COLUMN ... NOT NULL` statements above require a backfill. Add the columns as nullable, backfill from `quantity`/`unit_price_cents` (and recompute line totals), then enforce `NOT NULL`; alternatively build a new `quote_items_v2` table and copy. Do not run the DDL as written against a populated table.

```sql
CREATE TABLE quote_versions (
  org_id UUID NOT NULL,
  quote_id UUID NOT NULL,
  version INT NOT NULL,
  snapshot_json JSONB NOT NULL,
  template_snapshot_json JSONB NOT NULL,
  pdf_hash TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, quote_id, version),
  FOREIGN KEY (org_id, quote_id) REFERENCES quotations (org_id, quote_id),
  FOREIGN KEY (org_id, created_by) REFERENCES memberships (org_id, user_id)
);
CREATE TABLE quote_tax_lines (
  org_id UUID NOT NULL,
  quote_id UUID NOT NULL,
  version INT NOT NULL,
  tax_code TEXT NOT NULL,
  tax_bps INT NOT NULL,
  taxable_minor BIGINT NOT NULL,
  tax_minor BIGINT NOT NULL,
  PRIMARY KEY (org_id, quote_id, version, tax_code, tax_bps),
  FOREIGN KEY (org_id, quote_id, version) REFERENCES quote_versions (org_id, quote_id, version)
);
CREATE TABLE fx_rates (
  org_id UUID NOT NULL,
  base_currency TEXT NOT NULL,
  quote_currency TEXT NOT NULL,
  rate_micros BIGINT NOT NULL,
  source TEXT,
  fetched_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, base_currency, quote_currency, fetched_at)
);
CREATE TABLE approvals (
  approval_id UUID NOT NULL,
  org_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  requested_by UUID NOT NULL,
  approved_by UUID,
  status TEXT NOT NULL, -- pending | approved | rejected
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  decided_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, approval_id),
  FOREIGN KEY (org_id, requested_by) REFERENCES memberships (org_id, user_id),
  FOREIGN KEY (org_id, approved_by) REFERENCES memberships (org_id, user_id)
);
```

### 4.12 Tests

- 2.5 kg, 1.5 hours, 12.75 m.
- Mixed 16%/0%/exempt lines.
- Tax-inclusive and exclusive in one quote.
- 100% discount, zero-price lines, rounding edge cases.
- FX conversion and base totals.
- Offline quote block exhaustion/collision.
- Approval thresholds.
- PDF totals equal stored totals.

### 4.13 Brand and Template Studio

The Brand & Template Studio lets managers define the company's quotation look, legal/payment blocks, and layout presets. Templates are stored in the cloud, cached on every desktop, and compiled locally with Typst so a rep can generate a branded PDF offline.

**Visual identity**

- Company logo upload (PNG/SVG/WebP), placement (`top_left`, `top_center`, `top_right`), and scale.
- Primary brand color (headers, banner, borders), accent color (subtotal, badges), and neutral text tone via hex/RGB with contrast warnings.
- Font pairings: Inter/Plus Jakarta Sans, IBM Plex Sans/JetBrains Mono, Merriweather/Source Sans; bundled OFL fonts only.
- Optional transparent PNG company stamp and authorized signatory image, with a per-quote toggle.

**Layout and columns**

- Four presets: Clean Modern, Industrial Spec Grid, Compact Retail, and Formal Proforma Invoice.
- Optional custom Typst layout for enterprise templates.
- Per-template column toggles: product thumbnail, SKU, unit of measure, line discount, tax/VAT.
- Header, footer, terms, delivery notes, and a payment block with bank details, SWIFT/branch, M-PESA Paybill/Till, or payment link.

**Business identity**

- Legal entity name, address, phone, sales email, website, and tax registration (`tax_pin_label`/`tax_pin_value`, e.g. KRA PIN or VAT number).
- Default validity (7/14/30 days), quote-number prefix (e.g. `QT-{YYYY}-`), and default terms.
- Multiple templates per org, one default, and per-template permissions.
- Templates carry a `locale`; English is the default, Spanish is the second locale; a per-quote override selects the localized template.

**Lifecycle and sync**

- Template edits are commands from the manager desktop; the cloud validates, stores a new version, and appends `template.updated` to the org event log. Every linked desktop caches the new configuration and assets.
- Sent quotes store a `template_snapshot_json` and the PDF hash, so a later template edit cannot change a historical quote.
- Quote numbers use the org sequence with offline blocks (§4.8); the template prefix is applied at compile time.

**Compilation and safety**

- Local Typst compilation targets ≤50 ms p95 warm; the PDF is saved to the desktop and uploaded to cloud media as `quote_pdf`.
- Custom Typst is treated as untrusted code: virtual filesystem, no network, font allowlist, time/memory caps, and no absolute paths. Manager-authored templates are versioned and audited.
- `quote_templates` stores layout, colors, fonts, logo/stamp hashes, company/tax/payment fields, column config, and `custom_typst_source`; the cloud keeps the authoritative version.

## 5. Email completeness and mailbox discovery

**Cloud-only boundary.** SMTP/IMAP clients, provider folder discovery, OAuth refresh, MIME construction and parsing, Sent-folder APPEND, IDLE, credential storage, address validation, and deliverability live only in the cloud API and workers. The desktop has no SMTP/IMAP libraries, sockets, ports, or credentials; it composes drafts, sends commands, and receives email history through sync events.

### 5.1 Accounts and OAuth

| Capability                | Requirement                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Multiple accounts per org | `email_accounts`; one default; per-rep aliases/signatures.                                                         |
| Provider types            | Cloud direct SMTP/IMAP; Gmail API; Microsoft Graph; Zoho Mail API; inbound webhook (Postmark/SendGrid/Cloudflare). |
| Folder discovery          | Cloud-only, account-scoped, and API-first; see §5.4. Desktop receives the normalized tree through sync.             |
| Account identity          | Provider account ID plus email; duplicate or mismatched identities must reconnect, not create a second account.     |
| Setup ownership           | Managers/admins manage org accounts; a mailbox owner can connect or reauthenticate their own account.              |
| Reauthentication          | Preserve account, folder, and message identity; resume sync without re-linking the device.                         |
| OAuth2                    | Google/Microsoft/Zoho scopes, consent, token refresh, revocation; app verification/admin consent before launch.     |
| Auth modes                | OAuth2, provider app password, mailbox password, or API key; the mode is stored and the secret stays in the vault.  |
| Secrets                   | Cloud vault only; desktop never sees SMTP/IMAP/OAuth credentials.                                                  |
| Deliverability            | Per-tenant SPF/DKIM/DMARC guidance; provider API recommended for reputation; direct SMTP supported.                |
| Health                    | Connection status, last sync, auth errors, rate limits, folder discovery state surfaced in console.                |

#### 5.1.1 Provider authentication

| Provider | Authentication | Console action | Provider app prerequisites | Secret and reauthentication |
| --- | --- | --- | --- | --- |
| Gmail | OAuth 2.0 authorization code with PKCE | Continue with Google | Google Cloud project, OAuth client, consent screen, Gmail API, restricted-scope verification; Workspace admin may need to allow the app; test users during pilot | Refresh token in vault; re-run Google consent after revocation, scope change, or password reset |
| Microsoft 365 / Outlook.com | OAuth 2.0 against Microsoft Graph | Continue with Microsoft | Entra multi-tenant app registration, fixed redirect URI, delegated mail permissions, tenant admin consent where required, publisher verification if required | Refresh token in vault; re-run Microsoft consent |
| Zoho Mail | OAuth 2.0 | Continue with Zoho | Zoho API Console app registered in the mailbox's data centre, fixed redirect, folder/label/message scopes | Refresh token in vault; re-run Zoho consent |
| Yahoo Mail | App password for 2.0; optional OAuth2/XOAUTH2 after approval | Use Yahoo app password | Yahoo account with an app password; OAuth app registration only if Yahoo access is approved | App password in vault; replace the password or re-consent |
| iCloud Mail | Apple app-specific password | Use iCloud app-specific password | Apple ID with two-factor authentication | App-specific password in vault; create a new one and replace |
| cPanel-hosted | IMAP/SMTP mailbox password or host app password | Connect IMAP/SMTP | Mailbox hostname, TLS certificate, mailbox username; no cPanel control-panel login | Mailbox/app password in vault; replace the password |
| Generic IMAP | Password or provider-supported OAuth | Connect IMAP/SMTP | Host, port, TLS, username; no app registration | Password or refresh token in vault; replace credentials |
| Postmark / SendGrid | API key | Add sending provider | Provider account, verified sending domain, inbound webhook; no mailbox tree | API key in vault; rotate the key |
| SMTP-only | SMTP username/password | Add sending account | SMTP host, port, TLS; no receive-side mailbox | Password in vault; replace credentials |

Provider scopes and discovery behavior are defined in §5.4. Gmail, Microsoft, and
Zoho use OAuth; Yahoo, iCloud, cPanel, and generic IMAP use IMAP/SMTP where no
approved mailbox API is available. API-first does not mean "OAuth everywhere."
Gmail setup uses per-mailbox OAuth; service-account/domain-wide delegation and
delegated-mailbox merging are not part of 2.0.

#### 5.1.2 Setup flow

The web console is the only place an email account is connected. The desktop
never presents an OAuth window, password prompt, or provider SDK.

1. **Choose provider.** Show the provider name, authentication mode, prerequisites, and what data the connection can read and send. Do not show a password field for OAuth providers.
2. **Authenticate.**
   - OAuth: the web API creates a single-use setup session, PKCE verifier, and state bound to `org_id`, user, provider, and return path; redirect to the provider; validate and exchange the code server-side.
   - App password: collect the provider-specific fields over HTTPS, test IMAP/SMTP authentication without sending a message, then encrypt the secret in the vault. Never echo the secret back.
3. **Verify identity.** Resolve the provider account ID, email, and tenant where applicable. Reject a mismatch between the mailbox the user selected and the mailbox the provider returned. Detect duplicates by provider account ID and email and offer reconnect instead of a second account.
4. **Create the account.** Persist the account in `discovering` state with `auth_method`, `provider_preset`, `api_base_url`, capabilities, and the secret reference. Do not expose the secret in the response; the owner is assigned in step 6.
5. **Discover and preview.** Run folder discovery; show the normalized tree, provider folders/labels, counts, detected roles, and capability flags. IMAP/cPanel roles may be overridden; Gmail/Graph/Zoho roles are provider-derived.
6. **Configure.** Choose the account owner, default-account flag, from name, reply-to, signature, and any role overrides. Reject duplicate canonical roles such as two `sent` mappings. Setting a new default unsets the previous one atomically.
7. **Activate.** Move the account to `ready`, publish the account and folder events, and let linked desktops switch to it. A failed discovery leaves the account in `error` with retry, not a false `ready`.
8. **Reconnect later.** Reauthentication starts from the account detail page, keeps the same `account_id`, and resumes folder/message sync. A successful reconnect emits `email.account_updated` without duplicating folders or messages.

The web API exposes provider catalog, OAuth start/callback, credential connect,
verify/discover, activate/update, reauthorize, refresh-folders, and disconnect
operations. These are account-management endpoints, not desktop commands.

#### 5.1.3 Account states

Setup sessions are short-lived and are not synced as accounts. The account state
machine starts after provider identity verification:

| State | Meaning | Desktop behavior |
| --- | --- | --- |
| `discovering` | Account exists; initial folder discovery is running or awaiting activation. | Account visible as "Setting up"; folder tree may be partial; no compose/send. |
| `ready` | Credentials valid, folder discovery succeeded, and sync is active. | Normal account; folders, views, read, and send per capabilities. |
| `reauth_required` | OAuth revoked/expired or an app password is invalid. | Cached mail remains readable; sync/send paused; "Reconnect in web console" banner. |
| `error` | Retryable setup, TLS, discovery, or provider failure. | Cached mail readable if it exists; health banner; retry from console. |
| `disabled` | Manager/admin paused the account. | Cached mail readable if allowed; sync/send paused; no auth prompt. |
| `disconnected` | Soft-deleted account; provider token revoked where possible. | Hidden from the account switcher and compose; cached messages remain searchable per retention; no writes. |

Allowed transitions: `discovering` → `ready` / `error`; `ready` → `reauth_required` / `disabled` / `disconnected`; `reauth_required` → `discovering` / `ready`; `error` → `discovering` / `disabled` / `disconnected`; `disabled` → `discovering` / `disconnected`; `disconnected` is terminal for that account. A reconnect must reuse the account row and identity; it must not create a parallel account.

An account that never reaches `ready` is soft-deleted by the setup cleanup after 24 hours unless a manager retries it. Disconnecting the current default requires another default or leaves the org with no default; it never silently promotes a different mailbox.

#### 5.1.4 Permissions and ownership

| Action | owner/admin/manager | sales | finance/viewer |
| --- | --- | --- | --- |
| Connect a shared/org mailbox | Yes | No | No |
| Connect or reauthenticate own mailbox | Yes | Yes | No |
| Assign account owner or default | Yes | No | No |
| Disconnect own mailbox | Yes | Yes | No |
| Disable an account | Yes | No | No |
| Disconnect another user's or shared account | Yes | No | No |
| View account health and folder capabilities | All | Own | No |
| Complete OAuth consent for a mailbox | Mailbox owner; a manager may send a one-time setup link | Mailbox owner | No |

The mailbox owner must complete OAuth consent because a manager cannot consent
to another person's provider account. A manager may create a one-time setup link
for the owner; the link is bound to the org, intended user, provider, and expiry.
A sales-created account is owned by that user; the sales user cannot reassign
ownership or set the org default.
Ownership transfer by a manager changes the owner without changing credentials
or account IDs. Sales users can reach the email-account setup surface, not the
inbox, in the web console.

#### 5.1.5 Credentials and OAuth security

- Client IDs and client secrets are cloud application configuration in the
  secret manager, not tenant data. Per-account refresh tokens and app passwords
  are encrypted in the vault and referenced only by `secret_ref`.
- OAuth uses a fixed registered HTTPS redirect URI, a single-use state nonce,
  PKCE, and a short TTL. State is bound to the org, user, provider, callback, and
  setup session. Reject missing, expired, replayed, or mismatched state.
- Authorization codes are exchanged server-side. No access token, refresh token,
  authorization code, client secret, or app password is returned to the browser,
  written to localStorage, placed in a URL after callback, or sent to the
  desktop.
- Access tokens live only in worker memory. Refresh runs under a per-account
  lock; a successful refresh updates `last_verified_at`; if the provider rotates
  the refresh token, the new secret replaces the old one atomically; `invalid_grant`,
  revoked access, or missing scopes move the account to `reauth_required`.
- Scope minimization is mandatory. Gmail read scopes require Google restricted
  scope verification; Microsoft requires the delegated permissions in §5.4.1
  and tenant admin consent where policy requires it; Zoho scopes are limited to
  the account's data centre and required mail operations.
- App passwords are one-time secrets: the console may replace them, never
  display them again. Password forms disable autocomplete where appropriate,
  clear the field after submit, and never log the value.
- TLS certificate validation is mandatory. Do not offer an "ignore certificate"
  switch; cPanel users must use a hostname covered by the server certificate.
- Setup attempts, OAuth starts, reconnect attempts, and credential replacement
  are rate-limited and audited. Audit records contain the actor, account,
  provider, action, and outcome; never the secret. `status_detail` is a bounded
  code/UI message, not a raw provider response or mailbox content.
- Disconnect revokes the provider token where the provider supports revocation,
  stops sync and send jobs, and soft-deletes the account. Revocation failure is
  recorded but does not block the local disconnect.
- Duplicate detection uses provider account ID first and email second. A
  provider identity mismatch or duplicate account is an error with a reconnect
  path, not an automatic merge.

#### 5.1.6 Web-console setup UI

- **Channels → Email accounts** lists provider, email, owner, default state,
  status, last sync, folder count, and capabilities. Connected accounts have
  Reconnect, Refresh folders, Change owner, Set default, Disable, and Disconnect
  actions as permitted.
- **Connect email account** opens a provider picker with the auth mode and
  prerequisites visible before the user commits. Gmail, Microsoft, and Zoho show
  an OAuth button; Yahoo and iCloud show app-password instructions; cPanel and
  generic IMAP show host/port/TLS/username/password fields.
- The Apple entry is labeled **iCloud Mail**, with help text that Apple Mail's
  local "On My Mac" folders are not server data. Yahoo help links to its app
  password page. cPanel help says to use the mailbox password, not the cPanel
  control-panel login.
- After authentication, the preview shows the folder tree and detected roles.
  Generic IMAP/cPanel setup may correct Sent, Drafts, Archive, Junk, or Trash
  roles; the correction is stored with `role_source=manual` and preserved on
  later discovery. Duplicate role assignments are rejected.
- The account detail page shows auth method, owner, default, capabilities,
  discovery status, folder tree, last successful sync, and a redacted health
  message. It never shows a token or an app password.
- Sales users see **My email accounts** only. Managers/admins see all accounts.
  A manager can generate a one-time owner-consent link for a personal mailbox.
- Postmark and SendGrid appear under **Sending providers**, not mailbox
  accounts; they have no folder tree.
- A `reauth_required` or `error` account gets a persistent banner and a single
  Reconnect action. A successful reconnect clears the banner through sync.

#### 5.1.7 Desktop sync contract

- The sync snapshot contains account metadata: email, provider, display name,
  owner, default flag, capabilities, status, status detail, and last verified
  time. It contains no credentials.
- `email.account_updated` carries a created or changed account (including status,
  status detail, owner, default, signature, capabilities, and `last_verified_at`).
  `email.account_removed` marks a soft-disconnected account. Both are org-scoped
  and fan out to every linked device.
- The desktop never displays provider authentication UI. A `reauth_required` or
  `error` account shows a banner and an "Open web console" action; the console
  opens the correct account/setup page. It never renders an OAuth callback.
- `discovering` shows a setup state with a skeleton and no send action. `ready`
  enables the account. A successful reconnect preserves the same account ID,
  folder IDs, compose drafts, and cached messages.
- While `reauth_required` or `disabled`, the account stays visible and cached
  reads remain available; `disconnected` hides it from the switcher but cached
  messages remain searchable per retention. In all three states the desktop
  disables sync and send actions and does not enqueue new provider work.
  Existing queued sends fail with an actionable auth error rather than retrying
  forever.
- Default-account changes and owner changes arrive as account events, so the
  account switcher and composer update without a device re-link.
- Folder events continue independently (§5.4.10); an account update does not
  force the desktop to discard its folder cache.

#### 5.1.8 Acceptance tests

- Gmail, Microsoft, and Zoho happy-path OAuth; missing/replayed state; PKCE
  mismatch; denied consent; admin-consent failure; missing scope; duplicate
  account; provider identity mismatch.
- Yahoo and iCloud app-password setup, invalid password, expired password, and
  re-entry without secret disclosure.
- cPanel/generic IMAP valid and invalid TLS, IMAP/SMTP split failures, and no
  "ignore certificate" path.
- Sales user can connect/reconnect only their own account; manager can assign
  owner/default and generate a one-time consent link; finance/viewer cannot.
- Reauthentication preserves account, folder, and message identity; desktop
  banner clears through `email.account_updated`; owner/default changes sync; no
  duplicate account/device re-link.
- Disconnect revokes or reports revocation, hides the account from compose, and
  retains cached mail per policy.
- No secret appears in API responses, logs, browser storage, desktop cache, or
  event payloads.
- `discovering`/`error` states are visible and retryable; a failed discovery
  never marks the account `ready`.

### 5.2 Outbound

| Capability    | Requirement                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| Compose       | To, CC, BCC; subject; Markdown/HTML body; plain-text alternative; signature; attachments; inline images.      |
| Language      | Compose UI follows the user locale; the customer body/template may follow the thread/contact locale.          |
| Reply/forward | Reply, reply-all, forward; quoted body; threading headers preserved.                                          |
| Drafts        | Autosave to the cloud draft; desktop caches it. Optional IMAP Drafts APPEND is cloud-only; cross-device sync.  |
| Send later    | Scheduled send; cancel before dispatch.                                                                       |
| Attachments   | Multiple; provider/account size limit (default 25 MB); virus scan; object storage; signed URLs.               |
| MIME          | Cloud MIME builder (`lettre`) or provider API; desktop never builds or sends MIME.                            |
| Idempotency   | `client_msg_id`; cloud dedupe; retries return the same result.                                                |
| Retries       | Exponential backoff on 429/5xx; permanent 4xx goes to `failed`; dead-letter after max attempts.               |
| Sent folder   | Cloud IMAP APPEND to Sent or provider equivalent; retry; `sent_folder_synced` flag.                           |
| Bounces       | Parse DSN; hard/soft; suppression list; notify rep.                                                           |
| Statuses      | `queued`, `sending`, `sent`, `delivered` (if provider supports), `failed`, `bounced`; no `opened` by default. |
| Headers       | No header injection; validate addresses and subjects; CRLF stripping.                                         |

### 5.3 Inbound

| Capability     | Requirement                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| Modes          | Cloud IMAP IDLE; provider inbound webhook; optional Gmail/Graph push.                                            |
| IMAP state     | Cloud per-account/folder `UIDVALIDITY`, `last_uid`; reconnect with backoff; IDLE refresh.                        |
| Webhook        | Raw MIME; signature verification; size limit; dedupe by `Message-ID`.                                            |
| Parsing        | Cloud `mail-parser`; multipart; charset; headers; text/plain and HTML.                                           |
| Sanitization   | Strip scripts, event handlers, iframes; block remote images by default; allowlist links.                         |
| Quoted replies | Strip quoted chains heuristically; keep full body for audit.                                                     |
| Attachments    | Object storage; virus scan; size limits; inline images (CID).                                                    |
| Threading      | `In-Reply-To`/`References`; fallback normalized subject + participants + time window; stable `email_thread_key`. |
| Dedupe         | `external_id` unique; webhook retries idempotent.                                                                |
| Spam/junk      | Folder-aware; do not create threads for junk by default; user can move.                                          |
| Shared mailbox | Multiple users can access; assignment/collision handled by cloud assignment.                                     |
| Flags          | Read/unread, replied, forwarded; cloud IMAP sync where possible.                                                  |

### 5.4 Folder and label discovery

**Boundary.** Folder discovery is cloud-only. The web API owns account connection, OAuth callbacks, the credential vault, and the discovery job; the worker performs provider I/O. The desktop receives a normalized folder tree and message-to-folder memberships through sync events. It never calls Gmail, Graph, Zoho, IMAP, or SMTP, and it never receives provider credentials.

**Terms.**

- **Account** — one connected mailbox. Folder structure is account-scoped; two accounts may both have `INBOX` or `Customers`.
- **Folder/label node** — a provider mailbox, label, search folder, or virtual container. Its local identity is `folder_id`; `provider_folder_id` is opaque.
- **View** — a computed query over synced messages, not a provider folder. `Priority`, `Needs reply`, `Waiting`, Gmail Archive, and Gmail All Mail are views.
- **Full structure** — every accessible node, including nested and hidden nodes, with selectability and best-effort counts. It does not include message bodies.

Discovery is **read-only in 2.0**: the cloud does not create, rename, delete, or move provider folders or labels. Provider writes are a separate command/scope review.

#### 5.4.1 Provider matrix

| Provider | Adapter | Discovery source | Authentication | Incremental state |
| --- | --- | --- | --- | --- |
| Gmail | `gmail` | Gmail API `users.labels.list`; `users.getProfile`; `users.history.list` | Google OAuth 2.0. Use `gmail.readonly` for discovery and `gmail.send` for send; add `gmail.modify` only when label/message writes are enabled. | Account-level `historyId`; if it expires, full resync. |
| Microsoft 365 / Outlook.com | `microsoft` | Microsoft Graph `/me/mailFolders` plus `childFolders`; `includeHiddenFolders=true` | Microsoft OAuth 2.0 with `Mail.ReadBasic` (discovery), `Mail.ReadWrite` for moves, `Mail.Send`, `offline_access`. | Per-folder Graph delta with `deltaLink`. |
| Zoho Mail | `zoho` | `GET /api/accounts/{accountId}/folders` and `/labels` on the account's regional host | Zoho OAuth 2.0 with `ZohoMail.accounts.READ`, `ZohoMail.folders.READ`, `ZohoMail.tags.READ`, `ZohoMail.messages.READ`, and `ZohoMail.messages.CREATE` for send. | No documented folder delta; poll and reconcile, dedupe messages by provider ID. |
| Yahoo Mail | `smtp_imap` | IMAP `LIST` and `STATUS` | Yahoo app password; OAuth2/XOAUTH2 only after provider approval and account support. | Per-folder `UIDVALIDITY` and `last_uid`. |
| iCloud Mail (Apple Mail client) | `smtp_imap` | IMAP `LIST` and `STATUS` | Apple app-specific password. | Per-folder `UIDVALIDITY` and `last_uid`. |
| cPanel-hosted mail | `smtp_imap` | IMAP `LIST` and `STATUS` | Mailbox password or host-provided app password; TLS required. | Per-folder `UIDVALIDITY` and `last_uid`. |
| Generic IMAP | `smtp_imap` | IMAP `LIST` and `STATUS` | Account-configured password or OAuth mechanism. | Per-folder `UIDVALIDITY` and `last_uid`. |
| SMTP-only | `smtp_imap` | None | Account-configured SMTP credentials. | No receive-side tree. |
| Postmark / SendGrid | `postmark` / `sendgrid` | None | Provider API key. | No mailbox tree; inbound webhook and outbound send only. |

#### 5.4.2 Gmail

- Use the Gmail API for Gmail accounts. Do not use Gmail IMAP as the discovery source: IMAP exposes only labels explicitly enabled under “Show in IMAP” and loses Gmail's label semantics.
- `users.labels.list` returns `id`, `name`, `type` (`system` or `user`), `labelListVisibility`, `messageListVisibility`, `messagesTotal`, and `messagesUnread`. Store every returned label, including labels whose visibility is hidden, with `visible=false`.
- Gmail labels are flat. `name` uses `/` for nesting; the API has no parent ID. Split on `/` to build the tree. If a child label exists without its parent, create a non-selectable virtual parent.
- Map system labels to canonical roles: `INBOX` → `inbox`, `SENT` → `sent`, `DRAFT` → `drafts`, `SPAM` → `junk`, `TRASH` → `trash`, `IMPORTANT` → `important`, `STARRED` → `starred`, and `CATEGORY_*` → `category`. `UNREAD` is a filter, not a folder, and is not rendered as a node; use its presence to update `email_messages.is_read`.
- Gmail has no All Mail label. `All Mail` is a view over the local message index. `Archive` is a view of received messages not in `INBOX`, `SPAM`, `TRASH`, `DRAFT`, or `SENT`; it is not a Gmail label.
- Message placement comes from `labelIds`; a message can be in several nodes. Moving a message is adding/removing labels, never moving a folder row.
- Use `users.getProfile().historyId` plus `users.history.list` for incremental changes, including `labelsAdded`/`labelsRemoved`. If the history ID is outside the provider's validity window, run a full message resync rather than deleting local data.
- Label definitions can change outside the history stream. Refresh `labels.list` on connect, periodically, and when an unknown label ID appears.
- Counts from label metadata are provider counts. They may be stale; show the last successful discovery time.

#### 5.4.3 Microsoft 365 and Outlook.com

- Use Microsoft Graph. `GET /me/mailFolders` returns only root-level folders; recurse through `childFolders` and follow `@odata.nextLink` pagination. Pass `includeHiddenFolders=true` so hidden folders are not silently lost.
- Store `id`, `displayName`, `parentFolderId`, `childFolderCount`, `totalItemCount`, `unreadItemCount`, `isHidden`, and `wellKnownName` where present.
- Default folders use well-known names: `inbox`, `sentitems`, `drafts`, `outbox`, `deleteditems`, `junkemail`, and `archive`. Do not identify a folder by its display name; localized names differ.
- `microsoft.graph.mailSearchFolder` nodes are search folders. Store them with `kind=search`; they are not ordinary move targets.
- Focused Inbox is the `inferenceClassification` (`focused` or `other`) message property, not a folder. Outlook categories are message properties, not folders. Neither belongs in the folder tree; they may become views later.
- Use per-folder delta with the stored `deltaLink`. A missing or expired delta triggers a full folder and message resync.
- Shared mailboxes are separate account connections or delegated `/users/{id}` mailbox connections; do not merge their folders into the signed-in user's tree.

#### 5.4.4 Zoho Mail

- Use the Zoho Mail API. The API host is data-centre-specific: `.com` for the US, `.eu` for Europe, `.in` for India, `.com.au` for Australia, `.jp` for Japan, `.zohocloud.ca` for Canada, `.com.cn` for China, `.ae` for the UAE, and `.sa` for Saudi Arabia. Store the resolved base URI with the account.
- `GET /api/accounts/{accountId}/folders` returns folder `path`, `folderName`, `folderId`, `folderType`, `isArchived`, and `imapAccess`. Build the tree from `path`; `previousFolderId` is not a parent ID.
- Treat `folderType` as a hint, not as identity. Do not trust it for custom folders; create a folder through the default-name/path mapping only when the role is unambiguous.
- `GET /api/accounts/{accountId}/labels` returns flat labels with `labelId`, `displayName`, and `color`. Zoho labels are separate from folders and may be applied many-to-many; store them with `kind=label`.
- Do not display `Templates` or `Snoozed` as mail folders by default; they are non-mail or synthetic views. Store them as hidden/custom nodes if the account returns them.
- Folder counts are best-effort. If the folder API does not return counts, leave `provider_total`/`provider_unread` null and update them from message sync rather than displaying zero.
- Zoho has no documented folder-level delta in this scope. Poll the folder and label lists, reconcile by provider ID, and use message deduplication for incremental content sync.
- The IMAP adapter may be used as a fallback when the Mail API is unavailable, but it is not authoritative for Zoho labels.

#### 5.4.5 Yahoo, iCloud, cPanel, and generic IMAP

- **Yahoo Mail.** Use IMAP `imap.mail.yahoo.com:993` with TLS and SMTP `smtp.mail.yahoo.com:465` with TLS as provider defaults. The 2.0 path is a Yahoo app password; use OAuth2/XOAUTH2 only after provider approval and account support are verified. No public REST mailbox-folder API is in scope. Discover folders through `LIST`; do not hardcode Yahoo's localized folder names.
- **iCloud Mail / Apple Mail.** “Apple Mail” is a client, not a provider. The connectable provider is iCloud Mail, or whichever IMAP provider Apple Mail is configured against. For iCloud, use IMAP `imap.mail.me.com:993` and SMTP `smtp.mail.me.com:587`, with an app-specific password. Discover folders through `LIST`. Apple Mail's local “On My Mac” folders are not server data and cannot be pulled.
- **cPanel-hosted mail.** cPanel is a hosting control panel, not a mailbox API. Each domain's mail server is addressed by its host (usually `mail.<domain>` or the server hostname that matches the TLS certificate). Use IMAP/SMTP and `LIST`; cPanel account APIs manage accounts and forwarders, not mailbox folder contents. Do not assume `INBOX.Sent`, `INBOX.Drafts`, or a `.` delimiter; read the server's `LIST` result. SPECIAL-USE may be configured by the host; use it when present.
- **Generic IMAP.** Use `LIST "" "*"`, not `LSUB`. Read the hierarchy delimiter, decode modified UTF-7 mailbox names, and preserve the server-provided mailbox identity. Handle `\Noselect` containers, `\HasChildren`/`\HasNoChildren`, and SPECIAL-USE flags (`\All`, `\Archive`, `\Drafts`, `\Flagged`, `\Junk`, `\Sent`, `\Trash`) where advertised. Use `STATUS (MESSAGES UNSEEN UIDNEXT UIDVALIDITY)` for counts and cursors. Use `NAMESPACE` when the server exposes shared or other-user namespaces, and keep each namespace's tree account-scoped. If the server has no SPECIAL-USE, use the provider preset's unambiguous aliases; never guess from localized display names.
- `email_accounts.provider_preset` is a connection and alias hint (`yahoo`, `icloud`, `cpanel`, `custom`), not an identity. Observed `LIST`/API data always wins over a preset's suggested roles.
- For all IMAP providers, a folder rename may appear as a removal plus an addition. Preserve the old `UIDVALIDITY` data until the replacement is reconciled, and do not hard-delete messages solely because a folder name changed.
- SMTP-only accounts have no receive-side tree. Mark the account send-only and expose Sent/Outbox only; do not synthesize Inbox or Priority.

#### 5.4.6 HTTP senders

Postmark and SendGrid are outbound/inbound webhook providers, not mailbox providers. They have no folder tree. Inbound messages enter the conversation stream and the email cache; the desktop must not show an account folder tree for them.

#### 5.4.7 Canonical mapping

| Canonical role | Gmail | Microsoft Graph | Zoho Mail | IMAP |
| --- | --- | --- | --- | --- |
| `inbox` | system label `INBOX` | well-known `inbox` | folder type/path `Inbox` | `INBOX` (case-insensitive) |
| `sent` | system label `SENT` | well-known `sentitems` | folder type/path `Sent` | `\Sent`, else preset alias |
| `drafts` | system label `DRAFT` | well-known `drafts` | folder type/path `Drafts` | `\Drafts`, else preset alias |
| `outbox` | not a label | well-known `outbox` | folder type/path `Outbox` | provider folder if present; otherwise local outbox |
| `archive` | view, not a label | well-known `archive` | folder type/path `Archive` | `\Archive`, else preset alias |
| `junk` | system label `SPAM` | well-known `junkemail` | folder type/path `Spam` | `\Junk`, else preset alias |
| `trash` | system label `TRASH` | well-known `deleteditems` | folder type/path `Trash` | `\Trash`, else preset alias |
| `all` | synthetic All Mail view | no direct folder; synthetic view | no direct folder; synthetic view | `\All` when advertised |
| `important` | system label `IMPORTANT` | message `importance` property, not a folder | label if present | no standard folder |
| `starred` | system label `STARRED` | message `flag` property, not a folder | label if present | `\Flagged` when advertised |
| `category` | system labels `CATEGORY_*` | message `categories` property, not a folder | label if present | no standard folder |
| user label | user label node | no folder; categories are message properties (optional view) | label node | keyword/label mapping if supported |
| custom folder | user label with no role | custom `mailFolder` | custom folder | any other selectable mailbox |

`role=important`, `role=starred`, and `role=category` nodes are labels or views, not physical folders. A node may have `kind=label` and a role; `kind` describes how it behaves, not where it is displayed.

#### 5.4.8 Normalized tree rules

- Every node has one parent or is a root. Validate that the parent exists in the same account, and reject cycles. If a provider returns an orphan or an invalid parent, attach it at the root, keep it visible, and raise an account-health warning; do not discard it.
- Use provider IDs for identity. Display names are labels, not keys. Account-scoped uniqueness is `(org_id, account_id, provider_folder_id)`; a synthetic parent may have a null provider ID.
- `kind` is `mailbox`, `label`, `virtual`, or `search`. `role` is `inbox`, `sent`, `drafts`, `outbox`, `archive`, `junk`, `trash`, `all`, `important`, `starred`, `category`, `label`, `folder`, or `unknown`; the last two cover a user label or custom folder with no system meaning. `role_source` is `provider`, `preset`, or `manual`; a manual role override survives later discovery and is the only role that may be edited from setup.
- `selectable` is false for `\Noselect` containers, synthetic parents, and any node that cannot receive a move. `visible` reflects provider navigation visibility; a hidden node is still stored and can be shown in “More”.
- Preserve provider order where supplied; otherwise order system roles first, then visible user folders/labels, then hidden nodes.
- Store provider-specific metadata in `attributes` (Gmail visibility/color, Graph `wellKnownName`/`isHidden`/`childFolderCount`, Zoho `folderType`/`imapAccess`/`isArchived`, IMAP SPECIAL-USE flags/subscription state).
- Counts are nullable. A provider that does not return counts must not be represented as zero.
- The desktop builds the visual tree from the flat normalized rows; it does not infer parents from display names except for a provider adapter that has no parent field. That inference happens server-side and is validated.

#### 5.4.9 Membership and views

- `email_message_folders` is the source of truth for placement. A message may belong to zero or more nodes. Zero memberships is valid for a Gmail archived message; it remains reachable through the synthetic All Mail view and any search result.
- Inbound and outbound events carry folder memberships. A label/folder move emits `email.message_folders_updated`; the desktop does not infer membership from the message subject or the currently selected view.
- `Priority` is deterministic: unread, directly addressed, linked VIP/open opportunity, quote activity, awaiting response, and recency. It is not a provider folder and must not be used as a move target.
- `Needs reply` and `Waiting` are thread-state views derived from the last message direction. `Starred`/`Important` may be views backed by a provider label or property.
- Gmail Archive, Gmail All Mail, Zoho Snoozed, and Outlook Focused Inbox are views unless the provider explicitly returns a folder. Do not create a folder row merely to make a view selectable.

#### 5.4.10 Sync lifecycle and events

1. The web API completes connection/OAuth and stores the credential in the cloud vault.
2. It enqueues a discovery job with a per-account lock. The worker calls the adapter and receives a flat normalized node list.
3. The worker validates the tree, writes the new `sync_revision` in one transaction, and tombstones nodes missing from a complete response. A partial failure leaves the previous revision intact.
4. The worker appends folder upserts/removals, the completed revision, and any membership changes to the org event log.
5. The desktop applies events idempotently to its SQLite cache; full snapshots seed the tree. Every linked device receives the same org-scoped metadata.
6. Discovery repeats on connect, on auth recovery, on a schedule (default six hours), and when a provider cursor references an unknown folder or label. Counts may refresh independently.

Account lifecycle events are defined in §5.1.7. Folder/membership event types are:

- `email.folders_synced` — an account completed a full reconciliation. Payload: `account_id`, `revision`, and node count. A desktop that sees a revision gap requests a new snapshot.
- `email.folder_updated` — one normalized node was created or changed; the payload carries the complete node and its revision.
- `email.folder_removed` — one node was tombstoned; its messages remain in whichever other memberships survive.
- `email.message_folders_updated` — a message's folder/label membership changed without a new message; payload carries `account_id`, `message_id`, and the complete `folder_ids` set.

Initial folder metadata is part of the sync snapshot. Live events must stay within the 1 MB frame limit; a full tree is never broadcast as one live event.

#### 5.4.11 Acceptance tests

- Gmail: nested labels with a missing parent, hidden labels, all system roles, counts, All Mail/Archive views, and `historyId` expiry.
- Graph: hidden and search folders, nested children, pagination, well-known names, delta resume, and no Focused/category folder nodes.
- Zoho: regional base URI, path-based hierarchy, labels separate from folders, misleading `folderType`, and polling reconciliation.
- IMAP: `/` and `.` delimiters, modified UTF-7 names, `\Noselect`, missing SPECIAL-USE, UIDVALIDITY reset, and account isolation.
- Lifecycle: partial failure does not delete the previous tree; folder rename does not delete messages; deleted label memberships are removed; SMTP-only has no Inbox.
- Security: no credentials or provider payloads reach the desktop; every query is tenant-scoped; the desktop makes no provider calls.
- Events: folder and membership updates are idempotent, ordered per account revision, and recover from a missed event through a snapshot.

Provider references are maintained at the end of this section.

### 5.5 Data model

```sql
CREATE TABLE email_accounts (
  account_id UUID NOT NULL,
  org_id UUID NOT NULL,
  provider TEXT NOT NULL, -- smtp_imap | gmail | microsoft | zoho | postmark | sendgrid
  provider_preset TEXT, -- yahoo | icloud | cpanel | custom | null
  auth_method TEXT NOT NULL, -- oauth2 | app_password | password | api_key
  provider_account_id TEXT,
  provider_tenant_id TEXT,
  email TEXT NOT NULL,
  display_name TEXT,
  from_name TEXT,
  reply_to TEXT,
  signature_html TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL, -- discovering | ready | reauth_required | error | disabled | disconnected
  status_detail TEXT,
  smtp_host TEXT, smtp_port INT, smtp_security TEXT,
  imap_host TEXT, imap_port INT, imap_security TEXT,
  api_base_url TEXT,
  username TEXT,
  secret_ref TEXT,
  oauth_scopes TEXT[],
  capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  owner_user_id UUID,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, account_id),
  FOREIGN KEY (org_id, owner_user_id) REFERENCES memberships (org_id, user_id),
  UNIQUE (org_id, email),
  UNIQUE (org_id, provider, provider_account_id)
);
CREATE UNIQUE INDEX email_accounts_one_default
  ON email_accounts (org_id)
  WHERE is_default AND deleted_at IS NULL;
CREATE TABLE email_folders (
  folder_id UUID NOT NULL,
  org_id UUID NOT NULL,
  account_id UUID NOT NULL,
  provider_folder_id TEXT,
  parent_folder_id UUID,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  kind TEXT NOT NULL, -- mailbox | label | virtual | search
  role TEXT NOT NULL, -- inbox | sent | drafts | outbox | archive | junk | trash |
                     -- all | important | starred | category | label | folder | unknown
  role_source TEXT NOT NULL DEFAULT 'provider', -- provider | preset | manual
  selectable BOOLEAN NOT NULL DEFAULT TRUE,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  provider_total BIGINT,
  provider_unread BIGINT,
  sort_order INT NOT NULL DEFAULT 0,
  attributes JSONB,
  sync_revision BIGINT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, folder_id),
  UNIQUE (org_id, account_id, folder_id),
  UNIQUE (org_id, account_id, provider_folder_id),
  FOREIGN KEY (org_id, account_id) REFERENCES email_accounts (org_id, account_id),
  FOREIGN KEY (org_id, account_id, parent_folder_id)
    REFERENCES email_folders (org_id, account_id, folder_id)
    ON DELETE RESTRICT
);
CREATE TABLE email_account_sync_state (
  org_id UUID NOT NULL,
  account_id UUID NOT NULL,
  provider_cursor TEXT,
  folder_revision BIGINT NOT NULL DEFAULT 0,
  last_full_discovery_at TIMESTAMPTZ,
  last_message_sync_at TIMESTAMPTZ,
  status TEXT NOT NULL,
  PRIMARY KEY (org_id, account_id),
  FOREIGN KEY (org_id, account_id) REFERENCES email_accounts (org_id, account_id)
);
CREATE TABLE email_sync_state (
  org_id UUID NOT NULL,
  account_id UUID NOT NULL,
  folder_id UUID NOT NULL,
  uidvalidity BIGINT,
  last_uid BIGINT,
  delta_link TEXT,
  last_sync_at TIMESTAMPTZ,
  status TEXT NOT NULL,
  PRIMARY KEY (org_id, account_id, folder_id),
  FOREIGN KEY (org_id, account_id) REFERENCES email_accounts (org_id, account_id),
  FOREIGN KEY (org_id, account_id, folder_id)
    REFERENCES email_folders (org_id, account_id, folder_id)
    ON DELETE RESTRICT
);
CREATE TABLE email_messages (
  message_id UUID NOT NULL,
  org_id UUID NOT NULL,
  account_id UUID NOT NULL,
  thread_id UUID,
  direction TEXT NOT NULL, -- inbound | outbound
  from_json JSONB NOT NULL,
  to_json JSONB NOT NULL,
  cc_json JSONB,
  bcc_json JSONB,
  subject TEXT,
  snippet TEXT,
  body_text TEXT,
  body_html TEXT,
  message_id_header TEXT,
  in_reply_to TEXT,
  references_json JSONB,
  email_thread_key TEXT,
  size_bytes BIGINT,
  has_attachments BOOLEAN NOT NULL DEFAULT FALSE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_draft BOOLEAN NOT NULL DEFAULT FALSE,
  is_spam BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  sent_folder_synced BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, message_id),
  UNIQUE (org_id, account_id, message_id),
  FOREIGN KEY (org_id, message_id) REFERENCES messages (org_id, message_id),
  FOREIGN KEY (org_id, account_id) REFERENCES email_accounts (org_id, account_id),
  FOREIGN KEY (org_id, thread_id) REFERENCES threads (org_id, thread_id),
  UNIQUE (org_id, message_id_header)
);
CREATE TABLE email_message_folders (
  org_id UUID NOT NULL,
  account_id UUID NOT NULL,
  message_id UUID NOT NULL,
  folder_id UUID NOT NULL,
  PRIMARY KEY (org_id, account_id, message_id, folder_id),
  FOREIGN KEY (org_id, account_id, message_id)
    REFERENCES email_messages (org_id, account_id, message_id)
    ON DELETE RESTRICT,
  FOREIGN KEY (org_id, account_id, folder_id)
    REFERENCES email_folders (org_id, account_id, folder_id)
    ON DELETE RESTRICT
);
CREATE TABLE email_attachments (
  attachment_id UUID NOT NULL,
  org_id UUID NOT NULL,
  message_id UUID NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  blake3_hash TEXT NOT NULL,
  content_id TEXT,
  is_inline BOOLEAN NOT NULL DEFAULT FALSE,
  storage_key TEXT NOT NULL,
  PRIMARY KEY (org_id, attachment_id),
  FOREIGN KEY (org_id, message_id) REFERENCES email_messages (org_id, message_id)
);
CREATE TABLE email_drafts (
  draft_id UUID NOT NULL,
  org_id UUID NOT NULL,
  account_id UUID NOT NULL,
  thread_id UUID,
  to_json JSONB NOT NULL,
  cc_json JSONB,
  bcc_json JSONB,
  subject TEXT,
  body_markdown TEXT,
  attachments_json JSONB,
  updated_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, draft_id),
  FOREIGN KEY (org_id, account_id) REFERENCES email_accounts (org_id, account_id),
  FOREIGN KEY (org_id, thread_id) REFERENCES threads (org_id, thread_id)
);
CREATE TABLE email_bounces (
  bounce_id UUID NOT NULL,
  org_id UUID NOT NULL,
  message_id UUID NOT NULL,
  recipient TEXT NOT NULL,
  bounce_type TEXT NOT NULL, -- hard | soft
  diagnostic TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, bounce_id),
  FOREIGN KEY (org_id, message_id) REFERENCES email_messages (org_id, message_id)
);
CREATE TABLE email_suppressions (
  org_id UUID NOT NULL,
  email TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, email)
);
```

`email_accounts.status` uses the state machine in §5.1.3; a disconnected account keeps its row and `deleted_at` for retention. `email_accounts.capabilities` records the adapter's send/receive/folder/label/delta abilities for the desktop and health UI. The initial keys are `send`, `receive`, `folders`, `labels`, `delta`, `shared_mailboxes`, and `server_counts`; unknown keys are ignored by older clients. `email_account_sync_state.provider_cursor` holds Gmail's account-level `historyId`; `email_sync_state` holds IMAP UID state or a Graph `deltaLink` per folder. `provider_account_id` is the provider's stable identity (OAuth subject/account ID, Graph user ID, Zoho account ID, or the IMAP email/host identity); `provider_tenant_id` is populated for Microsoft where available.

The 2.0 migration backfills `provider_account_id` (provider profile identity, or the mailbox address for IMAP), sets `role_source='provider'`, and maps existing folder strings into `email_folders` and `email_message_folders` per account, maps known system names to canonical roles, rekeys `email_sync_state` by `folder_id`, and preserves `UIDVALIDITY`/`last_uid`. Only after the backfill and orphan audit may the legacy `folder` column be dropped. `is_spam`, `is_archived`, and `is_deleted` remain denormalized flags updated in the same transaction as membership changes.

### 5.6 Error handling

| Error                    | User action                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `AUTH_FAILED`            | Re-enter credentials or re-consent OAuth in console.              |
| `OAUTH_EXPIRED`          | Refresh token; if revoked, reconnect account.                     |
| `CONNECTION_FAILED`      | Retry with backoff; show account health.                          |
| `RATE_LIMITED`           | Queue and backoff; surface provider limit.                        |
| `FOLDER_DISCOVERY_FAILED`| Keep the last successful tree; retry; show stale health.          |
| `FOLDER_TREE_INVALID`    | Attach the orphan at root; keep it visible; raise a health warning. |
| `FOLDER_CURSOR_EXPIRED`  | Full folder and message resync; never tombstone from a gap.       |
| `FOLDER_UNSUPPORTED`     | Show the account as send-only or folderless; do not synthesize.   |
| `OAUTH_DENIED`           | Explain the missing consent; retry the provider authorization.    |
| `OAUTH_STATE_INVALID`    | Restart setup from the provider picker; never retry a stale callback. |
| `OAUTH_SCOPE_MISSING`    | Re-consent with the required read/send scopes; do not enable partial sync. |
| `DUPLICATE_ACCOUNT`      | Offer reconnect of the existing account; do not create a duplicate. |
| `PROVIDER_IDENTITY_MISMATCH` | Reject the connection; verify the selected mailbox and provider account. |
| `IMAP_AUTH_FAILED` / `SMTP_AUTH_FAILED` | Re-enter the mailbox/app password; check the provider preset. |
| `TLS_CERT_INVALID`       | Use the server hostname that matches the valid certificate; never bypass TLS. |
| `FOLDER_ROLE_CONFLICT`   | Ask for one mapping per canonical role; reject the save.          |
| `ACCOUNT_REAUTH_REQUIRED`| Keep cached mail readable; reconnect in the web console.          |
| `MESSAGE_TOO_LARGE`      | Compress attachments or send a link.                              |
| `INVALID_RECIPIENT`      | Validate address; block header injection.                         |
| `BOUNCE_HARD`            | Suppress; show bounce diagnostic.                                 |
| `BOUNCE_SOFT`            | Retry; escalate after threshold.                                  |
| `TLS_ERROR`              | Fall back only if allowed; never send plaintext credentials.      |
| `TIMEOUT`                | Retry idempotently; dead-letter.                                  |
| `ATTACHMENT_REJECTED`    | Virus/size/type rejection; show reason.                           |

### 5.7 UI

- **Web console.** Channels → Email accounts shows provider, address, owner, default state, status, last sync, folder count, and capabilities. The setup wizard handles the provider picker, OAuth redirect or app-password form, discovery preview, role corrections, owner/default/signature, and activation. Managers/admins manage all accounts; sales users see only My email accounts. Postmark/SendGrid live under Sending providers.
- **Desktop.** Account switcher; the account-scoped folder/label tree arrives from sync. The desktop does not discover folders or present provider authentication.
- Canonical folders first; provider labels/folders under “More”; hidden nodes are not shown by default. `Priority`, `Needs reply`, `Waiting`, Gmail Archive, and Gmail All Mail are views, not folders.
- Account states are visible: `discovering` is a setup state; `reauth_required` and `error` show a banner with “Open web console”; `disabled` stops sync/send; `disconnected` is hidden from the switcher while cached messages follow retention.
- A successful web-console reconnect clears the desktop banner through `email.account_updated`; no device re-link is required. Default/owner changes update the switcher and composer from the same event.
- Conversation view; collapsed quoted text; attachment list; inline image preview.
- Reply/reply-all/forward; signature; template; schedule send.
- Status chips: queued/sending/sent/delivered/failed/bounced.
- Search across subject/body/participants (FTS5), scoped to the selected account and view.
- Folder counts are best-effort and show the last successful discovery time; a missing count is not rendered as zero.
- Send-only accounts show Sent/Outbox and a send-only notice; they do not show an empty Inbox or Priority.
- Account health banner in settings; folder discovery or reauthentication failures appear there without hiding cached mail.

### 5.8 Limits

- Email accounts per org: plan cap (default five in 2.0); one default account.
- Setup, reauthentication, and one-time consent-link attempts are rate-limited. OAuth state and one-time consent links expire after ten minutes and are single-use.
- Attachment size: provider/account limit (default 25 MB).
- Recipients per message: configurable (default 50).
- Daily send limit per account; rate limit per tenant.
- Inbound MIME size limit (default 50 MB); reject oversized with notification.
- Folder discovery: cap at 10,000 nodes and 32 levels per account; paginate provider responses; surface truncation as a health warning rather than silently dropping nodes.
- Folder/label metadata refresh: on connect, on auth recovery, every six hours, and when a provider cursor references an unknown node. Counts may be stale between refreshes.
- Folder events: a full tree is never sent in one live event; initial state belongs in snapshots and live events stay under the 1 MB WebSocket frame limit.
- Retention per org policy.

**Provider references (non-normative).** The mapping above is based on:

- Gmail labels: [manage labels](https://developers.google.com/workspace/gmail/api/guides/labels), [users.labels](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.labels), [labels.list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.labels/list), [history.list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.history/list), and [Gmail IMAP/SMTP](https://developers.google.com/workspace/gmail/imap/imap-smtp).
- Google auth: [OAuth 2.0 web-server flow](https://developers.google.com/identity/protocols/oauth2/web-server), [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), and [restricted-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification).
- Microsoft Graph: [mailFolder](https://learn.microsoft.com/en-us/graph/api/resources/mailfolder?view=graph-rest-1.0), [list mailFolders](https://learn.microsoft.com/en-us/graph/api/user-list-mailfolders?view=graph-rest-1.0), [delta query](https://learn.microsoft.com/en-us/graph/delta-query-overview), [OAuth authorization-code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow), and [Graph permissions](https://learn.microsoft.com/en-us/graph/permissions-reference).
- Zoho Mail: [get all folders](https://www.zoho.com/mail/help/api/get-all-folder-details.html), [get all labels](https://www.zoho.com/mail/help/api/get-all-label-details.html), [API data centres](https://www.zoho.com/mail/help/api/getting-started-with-api.html), and [OAuth 2.0](https://www.zoho.com/mail/help/api/using-oauth-2.html).
- Yahoo: [IMAP server settings](https://help.yahoo.com/kb/SLN4075.html) and [sender authentication/OAuth](https://senders.yahooinc.com/developer/documentation/).
- iCloud: [iCloud Mail server settings](https://support.apple.com/en-us/102525) and [app-specific passwords](https://support.apple.com/en-us/102654).
- cPanel: [mail server configuration](https://docs.cpanel.net/whm/service-configuration/mailserver-configuration/) and [manage email accounts](https://docs.cpanel.net/cpanel/email/manage-email-accounts/).
- Generic IMAP: [RFC 3501](https://datatracker.ietf.org/doc/html/rfc3501) and [RFC 6154 SPECIAL-USE](https://datatracker.ietf.org/doc/html/rfc6154).

## 6. Sales Intelligence and AI

IntelluxIQ is a sales intelligence product, not just a messaging inbox. Intelligence must work **without AI** and without making basic CRM flows depend on it. The 2.0 release ships deterministic signal detection and outcome measurement; AI is an optional later layer.

### 6.1 The four entities

Keep four concepts separate:

| Entity | Represents | Examples |
| --- | --- | --- |
| **Contact** | A customer/person/company | Grace Wanjiku; Acme Kenya |
| **Conversation** (`threads` in the current schema) | One channel conversation with a contact | A WhatsApp thread about Product A; an email thread about a quote |
| **Opportunity** | One sales pursuit with a lifecycle, owner, value, products, and quotes | “Acme Kenya — Q4 packaging”; “Grace — 3 product lines” |
| **Message** | One inbound/outbound message within a conversation | A WhatsApp text, email, call summary, or internal note |

A contact can have many conversations and many opportunities. A conversation can be linked to zero, one, or several opportunities (a customer may ask about three products in one conversation). An opportunity can span several conversations and channels. Quotes belong to an opportunity; messages belong to a conversation.

The current `threads` table is retained as the **conversation** table for 2.0 protocol compatibility, but it must not carry deal-stage, owner, value, probability, or pipeline fields. Those move to `opportunities`. A future rename to `conversations` is a mechanical migration, not a data-model change.

**Example:** Grace asks about three products on WhatsApp. The WhatsApp exchange is one conversation. Sales creates three opportunities, each with its own product interest and stage. Two quotations are issued against two of those opportunities. Six months later Grace returns on email: a new conversation is linked to the same contact and can create a new opportunity or reopen an existing one. Her contact record and full timeline remain intact.

### 6.2 Deterministic intelligence

The intelligence layer is a rule engine plus an outcome model. It runs on cloud events and a scheduled sweep; it does not require an LLM, embeddings, or an external model.

**Signals** are durable, addressable records:

- `signal_id`, `org_id`, `rule_key`, `entity_type`, `entity_id`
- optional `conversation_id` and `opportunity_id`
- `severity` (`low | medium | high | urgent`)
- `status` (`open | acknowledged | resolved | dismissed`)
- `owner_user_id`, `first_seen_at`, `last_seen_at`, `resolved_at`
- `metadata` with the evidence (timestamps, counts, thresholds, quote IDs)

Rules are evaluated on event ingestion and every 5 minutes. Evaluation is idempotent; a signal is not duplicated for the same rule/entity/window. Signals resolve automatically when the underlying condition clears, or manually when a manager dismisses them with a reason.

Default rules:

| Rule | Condition | Default threshold |
| --- | --- | --- |
| `lead_unanswered` | Inbound customer message with no outbound reply | 30 min in business hours; urgent after 2 h |
| `customer_went_silent` | Last message outbound, no customer reply | 3 business days |
| `quote_no_follow_up` | Quote sent, no customer response, no follow-up | 3 days after send |
| `opportunity_inactive` | Qualified/quotation/negotiation with no activity | 7 days |
| `follow_up_overdue` | Follow-up task past due | At due time |
| `conversation_unanswered_burst` | Customer sends multiple messages with no reply | 3 unanswered inbound messages |

Thresholds, business hours, and timezone are org-configurable in `intelligence_rules`. Defaults are sensible; changing them does not require a deploy.

### 6.3 Lead recovery

The recovery queue shows conversations and opportunities that need intervention:

- unanswered customer enquiries;
- conversations where the customer stopped responding;
- quotations without follow-up;
- opportunities that have gone inactive;
- overdue follow-ups.

Each signal has an owner, evidence, age, severity, and one-click actions: reply, reassign, create/complete follow-up, advance or close the opportunity, or dismiss with a reason. A lead is **recovered** when a signal resolves because the customer replied, the opportunity advanced, a quote was accepted, or the owner completed a documented follow-up. Dismissal without action is not a recovery.

### 6.4 Conversation intelligence

For every conversation, compute:

- first response time (first inbound → first outbound);
- last inbound and last outbound timestamps;
- response gaps over a configurable threshold;
- inbound/outbound counts and unanswered inbound count;
- follow-up consistency (follow-ups completed on time / follow-ups due);
- conversation activity and age.

These are operational diagnostics. They are not the performance ranking. A salesperson with 300 messages and poor conversion is not outperforming one with 80 messages and strong conversion.

### 6.5 Pipeline intelligence

Opportunity stages:

`enquiry → qualified → quotation → negotiation → won | lost`

Track:

- time in each stage;
- stage-to-stage conversion;
- enquiry-to-qualified, qualified-to-quotation, quotation-to-won rates;
- aging and stalled opportunities;
- win/loss reasons;
- expected value and won revenue;
- source and product mix;
- quotes issued and accepted per opportunity.

Every stage change writes `opportunity_stage_history`; conversion is calculated on cohorts, not by counting current rows.

### 6.6 Team performance and the outcome model

Measure outcomes, not activity. Activity metrics are available as diagnostics, but team dashboards rank by outcomes:

| Outcome | Definition |
| --- | --- |
| Enquiries received | Opportunities created in the period, or conversations with first inbound and no opportunity yet |
| Qualified opportunities | Opportunities that reach `qualified` |
| Quotations issued | Distinct quotations sent in the period |
| Quotations accepted | Quotations marked accepted |
| Deals won | Opportunities reaching `won` |
| Revenue generated | Sum of won opportunity value in the org currency |
| Leads recovered | Signals resolved by a qualifying outcome, not a bare dismissal |
| Follow-ups completed | Follow-up tasks completed, split on-time/late |
| Conversion rates | Stage-to-stage and enquiry-to-won cohort rates |

Every metric has a period, scope (`user`, `team`, `org`), denominator, and currency where relevant. `sales_metrics_daily` stores the computed values for fast dashboards; the event log and stage history remain the source of truth. Members see activity context; managers see outcome and conversion rankings. Never rank by message count alone.

### 6.7 Evaluation, API, UI, and rollout

- Event-driven evaluation plus a 5-minute scheduled sweep; backfills are idempotent.
- API: `GET /v1/orgs/{org}/intelligence/summary`, `/signals`, `/pipeline`, `/team`; `POST /v1/orgs/{org}/intelligence/signals/{id}/acknowledge`, `/resolve`, `/dismiss`; follow-up endpoints under `/follow-ups`.
- Events: `intelligence.signal.opened`, `intelligence.signal.updated`, `intelligence.signal.resolved`; `opportunity.created`, `opportunity.stage_changed`, `opportunity.owner_changed`, `opportunity.value_changed`; `follow_up.created`, `follow_up.completed`.
- Web console: manager intelligence dashboard, recovery queue, pipeline funnel, team outcomes.
- Desktop: `My pipeline`, `Recovery`, `Conversations`, and contact/opportunity timelines; no AI dependency.
- Progressive delivery: 2.0 deterministic signals + pipeline + outcome metrics; later manager targets/forecasting; AI autopsy/hints only after the deterministic layer is trusted.

### 6.8 AI stub

AI is disabled by default and is not a dependency of inbox, quotes, email, WhatsApp, or intelligence. The interface remains stable so deterministic signals can feed it later.

```rust
pub enum AiTask { Transcription, DealAutopsy, ObjectionHint }

pub struct AiRequest {
    pub org_id: String,
    pub task: AiTask,
    pub input_ref: String,
    pub options: serde_json::Value,
}

pub enum AiError { Disabled, Unsupported, Failed(String) }

#[async_trait::async_trait]
pub trait AiProvider: Send + Sync {
    async fn transcribe(&self, req: AiRequest) -> Result<serde_json::Value, AiError>;
    async fn analyze_deal(&self, req: AiRequest) -> Result<serde_json::Value, AiError>;
    async fn objection_hint(&self, req: AiRequest) -> Result<serde_json::Value, AiError>;
}

pub struct StubAiProvider;

#[async_trait::async_trait]
impl AiProvider for StubAiProvider {
    async fn transcribe(&self, _req: AiRequest) -> Result<serde_json::Value, AiError> { Err(AiError::Disabled) }
    async fn analyze_deal(&self, _req: AiRequest) -> Result<serde_json::Value, AiError> { Err(AiError::Disabled) }
    async fn objection_hint(&self, _req: AiRequest) -> Result<serde_json::Value, AiError> { Err(AiError::Disabled) }
}
```

- `ai.enabled` defaults to false; no AI job rows are created when disabled; API returns `409 AI_DISABLED`.
- `StubAiProvider` performs no network calls, model loading, or data persistence.
- AI later consumes deterministic signals and stage history; it must not replace the deterministic layer.

### 6.9 Data model

```sql
CREATE TABLE intelligence_rules (
  org_id UUID NOT NULL,
  rule_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  thresholds JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, rule_key)
);
CREATE TABLE sales_signals (
  signal_id UUID NOT NULL,
  org_id UUID NOT NULL,
  rule_key TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  conversation_id UUID,
  opportunity_id UUID,
  owner_user_id UUID,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  first_seen_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  metadata JSONB NOT NULL,
  PRIMARY KEY (org_id, signal_id),
  FOREIGN KEY (org_id, conversation_id) REFERENCES threads (org_id, thread_id),
  FOREIGN KEY (org_id, opportunity_id) REFERENCES opportunities (org_id, opportunity_id),
  FOREIGN KEY (org_id, owner_user_id) REFERENCES memberships (org_id, user_id)
);
CREATE TABLE follow_up_tasks (
  task_id UUID NOT NULL,
  org_id UUID NOT NULL,
  conversation_id UUID,
  opportunity_id UUID,
  owner_user_id UUID NOT NULL,
  source_signal_id UUID,
  due_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  completed_at TIMESTAMPTZ,
  note TEXT,
  PRIMARY KEY (org_id, task_id),
  FOREIGN KEY (org_id, conversation_id) REFERENCES threads (org_id, thread_id),
  FOREIGN KEY (org_id, opportunity_id) REFERENCES opportunities (org_id, opportunity_id),
  FOREIGN KEY (org_id, owner_user_id) REFERENCES memberships (org_id, user_id),
  FOREIGN KEY (org_id, source_signal_id) REFERENCES sales_signals (org_id, signal_id)
);
CREATE TABLE sales_metrics_daily (
  org_id UUID NOT NULL,
  metric_date DATE NOT NULL,
  scope_type TEXT NOT NULL, -- user | team | org
  scope_id UUID NOT NULL,
  metric_key TEXT NOT NULL,
  value_numeric NUMERIC(18, 4) NOT NULL,
  currency TEXT,
  computed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, metric_date, scope_type, scope_id, metric_key)
);
```

### 6.10 Tests and acceptance

- Fixtures covering each default rule, business hours, timezone edges, and idempotent evaluation.
- A reply/resolution clears the signal; a dismissal does not count as a recovery.
- Stage conversion is cohort-based; no double counting; won revenue sums once.
- Activity and outcome metrics are separate; message count cannot drive the performance ranking.
- AI disabled: no external calls, no AI job records; core inbox/quote/intelligence flows pass.
- Permissions: sales see their own outcome report and the org-wide CRM read model; managers see team/org aggregates, all recovery signals, and pipeline; finance sees revenue aggregates. Aggregates do not expose customer content.

## 7. Data Model and Schema

### 7.1 Cloud (Postgres, RLS by `org_id`)

The core CRM entities are defined below. `contacts`, `threads` (conversations), `opportunities`, and `messages` are central; the remaining core entities follow the same `org_id`, UUID-ID, and tombstone conventions and are summarized after the DDL. The DDL is ordered for readability; apply it in dependency order (`orgs` → `users` → memberships/devices → `channel_accounts` → `whatsapp_connections` → `whatsapp_business_accounts` → `whatsapp_phone_numbers` → contacts → threads/messages → the rest).

**Tenant-key rule (normative).** Every tenant-scoped table carries `org_id` and exposes a unique key `(org_id, <entity>_id)` — normally its primary key. Every FK from a tenant-scoped child to a tenant-scoped parent is composite: `(org_id, parent_id) REFERENCES parent (org_id, parent_id)`. This blocks cross-tenant references at the database layer, independently of RLS. The only global tables are `orgs`, `users`, and `plans`; a tenant reference to a user is `(org_id, user_id) → memberships(org_id, user_id)`, never `users(user_id)`. FKs are `ON DELETE RESTRICT` by default; tenant rows use soft deletes. Application code may assume `org_id` is present on every relation.

```text
table                     primary / unique key                         composite foreign keys
contacts                  (org_id, contact_id)                         —
contact_identities        (org_id, kind, value)                        (org_id, contact_id) -> contacts
threads                   (org_id, thread_id)                          (org_id, contact_id) -> contacts; (org_id, channel_account_id) -> channel_accounts; (org_id, assigned_user_id) -> memberships; (org_id, assigned_by) -> memberships
messages                  (org_id, message_id)                         (org_id, thread_id) -> threads; (org_id, channel_account_id) -> channel_accounts; (org_id, reply_to_message_id) -> messages; (org_id, sender_user_id) -> memberships
opportunities             (org_id, opportunity_id)                     (org_id, contact_id) -> contacts; (org_id, owner_user_id) -> memberships
opportunity_conversations (org_id, opportunity_id, conversation_id)     (org_id, opportunity_id) -> opportunities; (org_id, conversation_id) -> threads
opportunity_products      (org_id, opportunity_product_id)             (org_id, opportunity_id) -> opportunities; (org_id, product_id) -> products
opportunity_stage_history (org_id, stage_event_id)                     (org_id, opportunity_id) -> opportunities; (org_id, changed_by) -> memberships
conversation_metrics      (org_id, conversation_id)                    (org_id, conversation_id) -> threads
products                  (org_id, product_id)                         —
product_media             (org_id, product_id, media_id)               (org_id, product_id) -> products
quote_templates           (org_id, template_id)                        —
quotations                (org_id, quote_id)                           (org_id, contact_id) -> contacts; (org_id, opportunity_id) -> opportunities; (org_id, thread_id) -> threads; (org_id, template_id) -> quote_templates; (org_id, assigned_user_id) -> memberships
quote_items               (org_id, quote_item_id)                      (org_id, quote_id) -> quotations
quote_versions            (org_id, quote_id, version)                  (org_id, quote_id) -> quotations
quote_tax_lines           (org_id, quote_id, version, tax_code, tax_bps) (org_id, quote_id, version) -> quote_versions
fx_rates                  (org_id, base_currency, quote_currency, fetched_at) —
approvals                 (org_id, approval_id)                        (org_id, requested_by) -> memberships; (org_id, approved_by) -> memberships
wa_templates              (org_id, template_id)                        (org_id, waba_id) -> whatsapp_business_accounts
wa_template_versions      (org_id, template_id, version)               (org_id, template_id) -> wa_templates
wa_template_status_events (org_id, id)                                 (org_id, template_id) -> wa_templates
wa_opt_ins                (org_id, wa_phone_number_id, phone_e164, category) (org_id, wa_phone_number_id) -> whatsapp_phone_numbers
media_variants            (org_id, variant_id)                         —
wa_media_cache            (org_id, wa_phone_number_id, blake3_hash)    (org_id, wa_phone_number_id) -> whatsapp_phone_numbers
call_logs                 (org_id, call_id)                            (org_id, thread_id) -> threads; (org_id, contact_id) -> contacts; (org_id, user_id) -> memberships
deal_autopsies            (org_id, autopsy_id)                         (org_id, thread_id) -> threads
thread_tags               (org_id, thread_id, tag)                     (org_id, thread_id) -> threads
reminders                 (org_id, reminder_id)                        (org_id, thread_id) -> threads; (org_id, assigned_user_id) -> memberships
memberships               (org_id, user_id)                            orgs(org_id), users(user_id) — global parents
devices                   (org_id, device_id)                          (org_id, user_id) -> memberships
device_sessions           (org_id, session_id)                         (org_id, user_id) -> memberships; (org_id, device_id) -> devices
device_wipe_requests      (org_id, request_id)                         (org_id, device_id) -> devices; (org_id, requested_by) -> memberships
user_invitations          (org_id, invitation_id)                      (org_id, created_by) -> memberships
security_policies         (org_id)                                      (org_id, updated_by) -> memberships
user_security_settings    (org_id, user_id)                            (org_id, user_id) -> memberships
subscriptions             (org_id, subscription_id)                    plans(plan_id) — global parent
entitlements              (org_id, key)                                —
usage_events              (org_id, usage_id)                           —
invoices                  (org_id, invoice_id)                         —
payment_methods           (org_id, payment_method_id)                  —
channel_accounts          (org_id, channel_account_id)                 —
whatsapp_connections      (org_id, connection_id)                     (org_id, created_by) -> memberships
whatsapp_business_accounts (org_id, waba_id)                          (org_id, connection_id) -> whatsapp_connections
whatsapp_phone_numbers    (org_id, wa_phone_number_id)                (org_id, waba_id) -> whatsapp_business_accounts; (org_id, channel_account_id) -> channel_accounts
email_accounts            (org_id, account_id)                         (org_id, owner_user_id) -> memberships
email_folders             (org_id, folder_id)                          (org_id, account_id) -> email_accounts; (org_id, account_id, parent_folder_id) -> email_folders
email_message_folders     (org_id, account_id, message_id, folder_id)  (org_id, account_id, message_id) -> email_messages; (org_id, account_id, folder_id) -> email_folders
email_account_sync_state  (org_id, account_id)                         (org_id, account_id) -> email_accounts
email_sync_state          (org_id, account_id, folder_id)              (org_id, account_id) -> email_accounts; (org_id, account_id, folder_id) -> email_folders
email_messages            (org_id, message_id)                         (org_id, message_id) -> messages; (org_id, account_id) -> email_accounts; (org_id, thread_id) -> threads
email_attachments         (org_id, attachment_id)                      (org_id, message_id) -> email_messages
email_drafts              (org_id, draft_id)                           (org_id, account_id) -> email_accounts; (org_id, thread_id) -> threads
email_bounces             (org_id, bounce_id)                          (org_id, message_id) -> email_messages
email_suppressions        (org_id, email)                              —
ai_settings               (org_id)                                      —
ai_jobs                   (org_id, job_id)                               —
intelligence_rules        (org_id, rule_key)                            —
sales_signals             (org_id, signal_id)                           (org_id, conversation_id) -> threads; (org_id, opportunity_id) -> opportunities; (org_id, owner_user_id) -> memberships
follow_up_tasks           (org_id, task_id)                             (org_id, conversation_id) -> threads; (org_id, opportunity_id) -> opportunities; (org_id, owner_user_id) -> memberships; (org_id, source_signal_id) -> sales_signals
sales_metrics_daily       (org_id, metric_date, scope_type, scope_id, metric_key) —
events                    (org_id, seq); unique (org_id, event_id)     —
webhook_events            (org_id, id); unique (org_id, provider, external_id, event_type) —
device_cursors            (org_id, device_id)                          (org_id, device_id) -> devices
quote_number_blocks       (org_id, block_id)                           (org_id, device_id) -> devices
outbound_jobs             (org_id, job_id)                             (org_id, channel_account_id) -> channel_accounts
audit_log                 (org_id, audit_id)                           (org_id, actor_user_id) -> memberships; (org_id, actor_device_id) -> devices
```


```sql
CREATE TABLE contacts (
  org_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  display_name TEXT,
  company_name TEXT,
  locale TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, contact_id)
);
CREATE TABLE contact_identities (
  org_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  kind TEXT NOT NULL, -- phone | email | messenger_psid | instagram_igsid | tiktok_open_id
  value TEXT NOT NULL, -- E.164, lowercase email, or channel_account_id:provider_user_id
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (org_id, kind, value),
  FOREIGN KEY (org_id, contact_id) REFERENCES contacts (org_id, contact_id)
);
CREATE TABLE threads (
  org_id UUID NOT NULL,
  thread_id UUID NOT NULL,
  contact_id UUID,
  channel_account_id UUID,
  channel TEXT NOT NULL, -- whatsapp | messenger | instagram | tiktok | email | internal
  external_thread_id TEXT, -- provider thread/conversation key
  contact_name TEXT,
  company_name TEXT,
  locale TEXT,
  wa_phone TEXT,
  email_address TEXT,
  assigned_user_id UUID,
  assigned_at TIMESTAMPTZ,
  assigned_by UUID,
  assignment_source TEXT NOT NULL DEFAULT 'unassigned',
  category TEXT NOT NULL DEFAULT 'Inbox',
  sla_deadline_at TIMESTAMPTZ, -- response SLA, not a deal field
  wa_window_expires_at TIMESTAMPTZ,
  first_inbound_at TIMESTAMPTZ,
  first_outbound_at TIMESTAMPTZ,
  last_inbound_at TIMESTAMPTZ,
  last_outbound_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ NOT NULL,
  unread_count INT NOT NULL DEFAULT 0,
  closed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, thread_id),
  FOREIGN KEY (org_id, contact_id) REFERENCES contacts (org_id, contact_id),
  FOREIGN KEY (org_id, channel_account_id) REFERENCES channel_accounts (org_id, channel_account_id),
  FOREIGN KEY (org_id, assigned_user_id) REFERENCES memberships (org_id, user_id),
  FOREIGN KEY (org_id, assigned_by) REFERENCES memberships (org_id, user_id),
  UNIQUE (org_id, channel_account_id, external_thread_id)
);
CREATE INDEX threads_assigned_idx ON threads (org_id, assigned_user_id, last_message_at DESC);
CREATE INDEX threads_last_message_idx ON threads (org_id, last_message_at DESC);
CREATE INDEX threads_phone_idx ON threads (org_id, wa_phone);
CREATE INDEX threads_email_idx ON threads (org_id, email_address);

CREATE TABLE opportunities (
  org_id UUID NOT NULL,
  opportunity_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  owner_user_id UUID,
  name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'enquiry', -- enquiry | qualified | quotation | negotiation | won | lost
  source TEXT,
  estimated_value_minor BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  probability_bps INT,
  expected_close_date DATE,
  last_activity_at TIMESTAMPTZ NOT NULL,
  next_follow_up_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, opportunity_id),
  FOREIGN KEY (org_id, contact_id) REFERENCES contacts (org_id, contact_id),
  FOREIGN KEY (org_id, owner_user_id) REFERENCES memberships (org_id, user_id)
);
CREATE INDEX opportunities_pipeline_idx ON opportunities (org_id, stage, last_activity_at DESC);
CREATE INDEX opportunities_owner_idx ON opportunities (org_id, owner_user_id, stage);

CREATE TABLE opportunity_conversations (
  org_id UUID NOT NULL,
  opportunity_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  linked_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, opportunity_id, conversation_id),
  FOREIGN KEY (org_id, opportunity_id) REFERENCES opportunities (org_id, opportunity_id),
  FOREIGN KEY (org_id, conversation_id) REFERENCES threads (org_id, thread_id)
);
CREATE UNIQUE INDEX opportunity_conversations_one_primary
  ON opportunity_conversations (org_id, opportunity_id)
  WHERE is_primary;

CREATE TABLE opportunity_products (
  org_id UUID NOT NULL,
  opportunity_product_id UUID NOT NULL,
  opportunity_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity_milli BIGINT NOT NULL DEFAULT 1000,
  target_price_minor BIGINT,
  currency TEXT,
  notes TEXT,
  PRIMARY KEY (org_id, opportunity_product_id),
  FOREIGN KEY (org_id, opportunity_id) REFERENCES opportunities (org_id, opportunity_id),
  FOREIGN KEY (org_id, product_id) REFERENCES products (org_id, product_id)
);
CREATE INDEX opportunity_products_opportunity_idx ON opportunity_products (org_id, opportunity_id);

CREATE TABLE opportunity_stage_history (
  org_id UUID NOT NULL,
  stage_event_id UUID NOT NULL,
  opportunity_id UUID NOT NULL,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL,
  note TEXT,
  PRIMARY KEY (org_id, stage_event_id),
  FOREIGN KEY (org_id, opportunity_id) REFERENCES opportunities (org_id, opportunity_id),
  FOREIGN KEY (org_id, changed_by) REFERENCES memberships (org_id, user_id)
);
CREATE INDEX opportunity_stage_history_idx ON opportunity_stage_history (org_id, opportunity_id, changed_at);

CREATE TABLE conversation_metrics (
  org_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  first_inbound_at TIMESTAMPTZ,
  first_outbound_at TIMESTAMPTZ,
  first_response_seconds BIGINT,
  last_inbound_at TIMESTAMPTZ,
  last_outbound_at TIMESTAMPTZ,
  response_gap_count INT NOT NULL DEFAULT 0,
  unanswered_inbound_count INT NOT NULL DEFAULT 0,
  follow_up_due_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, conversation_id),
  FOREIGN KEY (org_id, conversation_id) REFERENCES threads (org_id, thread_id)
);

CREATE TABLE messages (
  org_id UUID NOT NULL,
  message_id UUID NOT NULL,
  thread_id UUID NOT NULL,
  channel_account_id UUID,
  reply_to_message_id UUID,
  external_id TEXT,
  channel TEXT NOT NULL, -- whatsapp | messenger | instagram | tiktok | email | internal
  sender_type TEXT NOT NULL, -- customer | user | system | whisper
  sender_user_id UUID,
  content_type TEXT NOT NULL, -- text | html_email | image | video | audio | document
  body_text TEXT,
  body_html TEXT,
  media_blake3_hash TEXT,
  media_mime TEXT,
  audio_transcript TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, message_id),
  FOREIGN KEY (org_id, thread_id) REFERENCES threads (org_id, thread_id),
  FOREIGN KEY (org_id, channel_account_id) REFERENCES channel_accounts (org_id, channel_account_id),
  FOREIGN KEY (org_id, reply_to_message_id) REFERENCES messages (org_id, message_id),
  FOREIGN KEY (org_id, sender_user_id) REFERENCES memberships (org_id, user_id),
  UNIQUE (org_id, channel, external_id)
);
CREATE INDEX messages_thread_idx ON messages (org_id, thread_id, created_at);
```

**Other core entities**

| Table             | Purpose / key fields                                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `products`        | `sku`, `name`, `category`, `sub_category`, `description`, `specs_json`, `unit_of_measure`, `unit_price_minor`, `wholesale_price_minor`, `currency`, `tax_bps`, `stock_qty`, `is_active`, `catalog_seq_id`, `deleted_at`. |
| `product_media`   | `product_id`, `media_id`, `blake3_hash`, `media_type`, `thumbnail_path`, `sync_status`, `wa_cached_media_id`, `sort_order`.                                                                                              |
| `quote_templates` | `locale`, layout, colors, fonts, logo/stamp hashes, company/tax/payment fields, column config, `custom_typst_source`, `version`, `deleted_at`.                                                                           |
| `quotations`      | `quote_number`, `locale`, template snapshot, `subtotal_minor`, discounts, `tax_minor`, `total_minor`, currency/FX, `status`, `version`, PDF hash.                                                                        |
| `quote_items`     | `quantity_milli`, `unit_price_minor`, line/global discounts, `tax_bps`, `tax_inclusive`, computed line totals.                                                                                                           |
| `call_logs`       | Phase 3: provider, direction, media mode, status, duration, recording path, transcript.                                                                                                                                  |
| `deal_autopsies`  | Post-2.0 AI: loss category, confidence, summary, model/version, review status.                                                                                                                                           |
| `thread_tags`     | `org_id`, `thread_id`, `tag`; join table for `#BulkOrder`, `#VIP`, etc.                                                                                                                                                  |
| `reminders`       | `org_id`, `thread_id`, `trigger_at`, `note`, `status`; native follow-up reminders.                                                                                                                                       |

```sql
CREATE TABLE orgs (
  org_id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  base_currency TEXT NOT NULL,
  default_locale TEXT NOT NULL DEFAULT 'en',
  timezone TEXT NOT NULL,
  status TEXT NOT NULL, -- active | past_due | suspended | cancelled
  data_region TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email CITEXT UNIQUE NOT NULL,
  name TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL, -- active | disabled | removed
  created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE memberships (
  org_id UUID NOT NULL REFERENCES orgs(org_id),
  user_id UUID NOT NULL REFERENCES users(user_id),
  role TEXT NOT NULL, -- owner | admin | manager | sales | finance | viewer
  status TEXT NOT NULL,
  max_active_chats INT NOT NULL DEFAULT 15,
  PRIMARY KEY (org_id, user_id)
);
CREATE TABLE devices (
  device_id UUID NOT NULL,
  org_id UUID NOT NULL,
  user_id UUID,
  name TEXT,
  os TEXT,
  app_version TEXT,
  public_key_ed25519 TEXT NOT NULL,
  status TEXT NOT NULL, -- linked | revoked | terminated
  posture JSONB,
  last_seen_at TIMESTAMPTZ,
  last_refresh_at TIMESTAMPTZ,
  linked_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ,
  wipe_status TEXT, -- none | pending | sent | acked | failed | local_wiped
  PRIMARY KEY (org_id, device_id),
  FOREIGN KEY (org_id, user_id) REFERENCES memberships (org_id, user_id)
);
CREATE TABLE device_sessions (
  session_id UUID NOT NULL,
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  device_id UUID NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  access_jti UUID,
  issued_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, session_id),
  FOREIGN KEY (org_id, user_id) REFERENCES memberships (org_id, user_id),
  FOREIGN KEY (org_id, device_id) REFERENCES devices (org_id, device_id),
  UNIQUE (org_id, refresh_token_hash)
);
CREATE TABLE device_wipe_requests (
  request_id UUID NOT NULL,
  org_id UUID NOT NULL,
  device_id UUID NOT NULL,
  requested_by UUID NOT NULL,
  reason TEXT,
  status TEXT NOT NULL, -- pending | sent | acked | failed
  requested_at TIMESTAMPTZ NOT NULL,
  acked_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, request_id),
  FOREIGN KEY (org_id, device_id) REFERENCES devices (org_id, device_id),
  FOREIGN KEY (org_id, requested_by) REFERENCES memberships (org_id, user_id)
);
CREATE TABLE user_invitations (
  invitation_id UUID NOT NULL,
  org_id UUID NOT NULL,
  email CITEXT NOT NULL,
  role TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  PRIMARY KEY (org_id, invitation_id),
  FOREIGN KEY (org_id, created_by) REFERENCES memberships (org_id, user_id)
);
CREATE TABLE security_policies (
  org_id UUID PRIMARY KEY,
  default_idle_timeout_seconds INT NOT NULL DEFAULT 600,
  max_idle_timeout_seconds INT NOT NULL DEFAULT 3600,
  updated_by UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  FOREIGN KEY (org_id, updated_by) REFERENCES memberships (org_id, user_id)
);
CREATE TABLE user_security_settings (
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  idle_timeout_seconds INT,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, user_id),
  FOREIGN KEY (org_id, user_id) REFERENCES memberships (org_id, user_id),
  FOREIGN KEY (org_id, updated_by) REFERENCES memberships (org_id, user_id)
);
CREATE TABLE plans (
  plan_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  device_limit INT,
  channel_limit INT,
  conversation_limit INT,
  storage_gb INT,
  ai_credit_limit INT,
  features JSONB NOT NULL,
  price_cents BIGINT,
  currency TEXT,
  interval TEXT
);
CREATE TABLE subscriptions (
  subscription_id UUID NOT NULL,
  org_id UUID NOT NULL,
  plan_id TEXT NOT NULL REFERENCES plans(plan_id),
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  provider TEXT,
  provider_ref TEXT,
  PRIMARY KEY (org_id, subscription_id)
);
CREATE UNIQUE INDEX subscriptions_one_active
  ON subscriptions (org_id)
  WHERE status IN ('active', 'past_due', 'trialing');
CREATE TABLE entitlements (
  org_id UUID NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  expires_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, key)
);
CREATE TABLE usage_events (
  usage_id UUID NOT NULL,
  org_id UUID NOT NULL,
  metric TEXT NOT NULL,
  quantity BIGINT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  source TEXT,
  source_id TEXT NOT NULL,
  PRIMARY KEY (org_id, usage_id),
  UNIQUE (org_id, metric, source_id)
);
CREATE TABLE invoices (
  invoice_id UUID NOT NULL,
  org_id UUID NOT NULL,
  charge_class TEXT NOT NULL, -- subscription | usage | add_on; never a Meta charge
  amount_minor BIGINT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  provider_ref TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, invoice_id)
);
CREATE TABLE payment_methods (
  payment_method_id UUID NOT NULL,
  org_id UUID NOT NULL,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  last4 TEXT,
  status TEXT NOT NULL,
  PRIMARY KEY (org_id, payment_method_id)
);
CREATE TABLE channel_accounts (
  channel_account_id UUID NOT NULL,
  org_id UUID NOT NULL,
  channel TEXT NOT NULL, -- whatsapp | messenger | instagram | tiktok | email | voice
  display_name TEXT,
  status TEXT NOT NULL, -- provisioning | pending_review | pending_provider_billing |
                        -- ready | restricted | reauth_required | error | disabled |
                        -- revoked | disconnected; WhatsApp mirrors whatsapp_phone_numbers.status
  status_detail TEXT,
  capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Non-WhatsApp provider identity and credentials. For WhatsApp these columns
  -- are null; the explicit whatsapp_* tables are authoritative.
  provider TEXT,
  external_id TEXT,
  parent_external_id TEXT, -- Page ID for Instagram fallback/TikTok business ID; not used for WhatsApp
  auth_method TEXT, -- embedded_signup | oauth2 | app_password | password | api_key
  token_type TEXT,
  scopes TEXT[],
  webhook_status TEXT,
  health JSONB,
  secret_ref TEXT,
  token_expires_at TIMESTAMPTZ,
  token_refreshed_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, channel_account_id),
  UNIQUE (channel, external_id)
);
CREATE TABLE whatsapp_connections (
  connection_id UUID NOT NULL,
  org_id UUID NOT NULL,
  meta_business_portfolio_id TEXT,
  onboarding_method TEXT NOT NULL, -- embedded_signup_v4 | bsp_embedded_signup | bsp_manual
  onboarding_state TEXT NOT NULL, -- initiated | pending_assets | code_received |
                                  -- code_exchanged | assets_verified | waba_subscribed |
                                  -- provisioning | completed | failed | cancelled
  onboarding_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  onboarding_completed_at TIMESTAMPTZ,
  onboarding_error_code TEXT,
  onboarding_error_detail TEXT,
  granted_permissions TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'provisioning', -- provisioning | pending_review |
                        -- pending_provider_billing | ready | restricted |
                        -- reauth_required | error | disabled | revoked | disconnected
  status_detail TEXT,
  bsp_reference TEXT, -- optional fallback record; never a core dependency
  created_by UUID,
  connected_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, connection_id),
  FOREIGN KEY (org_id, created_by) REFERENCES memberships (org_id, user_id)
);
CREATE TABLE whatsapp_business_accounts (
  waba_id UUID NOT NULL,
  org_id UUID NOT NULL,
  connection_id UUID NOT NULL,
  meta_waba_id TEXT NOT NULL,
  name TEXT,
  currency TEXT,
  timezone TEXT,
  review_status TEXT, -- pending | approved | rejected | restricted
  status TEXT NOT NULL DEFAULT 'provisioning', -- provisioning | pending_review |
                        -- pending_provider_billing | ready | restricted |
                        -- reauth_required | error | disabled | revoked | disconnected
  status_detail TEXT,
  token_ref TEXT, -- cloud-vault reference only; never a raw token
  token_type TEXT NOT NULL DEFAULT 'business_integration_system_user',
  token_expires_at TIMESTAMPTZ,
  token_refreshed_at TIMESTAMPTZ,
  effective_permissions TEXT[] NOT NULL DEFAULT '{}',
  webhook_status TEXT NOT NULL DEFAULT 'unsubscribed', -- unsubscribed | pending | subscribed | disabled | error
  webhook_fields TEXT[] NOT NULL DEFAULT '{}',
  webhook_subscribed_at TIMESTAMPTZ,
  webhook_error TEXT,
  meta_payment_status TEXT NOT NULL DEFAULT 'unknown', -- unknown | missing | pending | added | failed |
                                                       -- managed_by_bsp | not_applicable (Meta-owned)
  revoked_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, waba_id),
  UNIQUE (meta_waba_id),
  FOREIGN KEY (org_id, connection_id)
    REFERENCES whatsapp_connections (org_id, connection_id)
);
CREATE TABLE whatsapp_phone_numbers (
  wa_phone_number_id UUID NOT NULL,
  org_id UUID NOT NULL,
  waba_id UUID NOT NULL,
  channel_account_id UUID NOT NULL,
  meta_phone_number_id TEXT NOT NULL,
  display_phone_number TEXT NOT NULL,
  e164_phone_number TEXT NOT NULL,
  verified_name TEXT,
  registration_status TEXT NOT NULL DEFAULT 'unregistered', -- unregistered | registering | registered | failed
  verification_status TEXT NOT NULL DEFAULT 'unverified', -- unverified | pending | verified | rejected
  quality_rating TEXT, -- green | yellow | red | unknown
  messaging_limit TEXT, -- 1K | 10K | 100K | unlimited | unknown
  throughput TEXT, -- standard | high | unknown
  calling_capability JSONB NOT NULL DEFAULT '{}'::jsonb, -- voice/video/sip flags and status
  status TEXT NOT NULL DEFAULT 'provisioning', -- provisioning | pending_review |
                        -- pending_provider_billing | ready | restricted |
                        -- reauth_required | error | disabled | revoked | disconnected
  status_detail TEXT,
  registered_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, wa_phone_number_id),
  UNIQUE (meta_phone_number_id),
  UNIQUE (org_id, channel_account_id),
  FOREIGN KEY (org_id, waba_id)
    REFERENCES whatsapp_business_accounts (org_id, waba_id),
  FOREIGN KEY (org_id, channel_account_id)
    REFERENCES channel_accounts (org_id, channel_account_id)
);
CREATE TABLE events (
  org_id UUID NOT NULL,
  seq BIGINT NOT NULL,
  event_id UUID NOT NULL,
  type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  schema_version INT NOT NULL,
  payload JSONB NOT NULL,
  actor_user_id UUID,
  actor_device_id UUID,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, seq),
  UNIQUE (org_id, event_id)
);
CREATE TABLE webhook_events (
  id UUID NOT NULL,
  org_id UUID NOT NULL,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  PRIMARY KEY (org_id, id),
  UNIQUE (org_id, provider, external_id, event_type)
);
CREATE TABLE device_cursors (
  org_id UUID NOT NULL,
  device_id UUID NOT NULL,
  last_seq BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, device_id),
  FOREIGN KEY (org_id, device_id) REFERENCES devices (org_id, device_id)
);
CREATE TABLE quote_number_blocks (
  block_id UUID NOT NULL,
  org_id UUID NOT NULL,
  device_id UUID,
  prefix TEXT NOT NULL,
  year INT NOT NULL,
  start_seq BIGINT NOT NULL,
  end_seq BIGINT NOT NULL,
  next_seq BIGINT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  PRIMARY KEY (org_id, block_id),
  FOREIGN KEY (org_id, device_id) REFERENCES devices (org_id, device_id)
);
CREATE TABLE outbound_jobs (
  job_id UUID NOT NULL,
  org_id UUID NOT NULL,
  channel TEXT NOT NULL,
  channel_account_id UUID,
  payload JSONB NOT NULL,
  status TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ,
  provider_message_id TEXT,
  last_error TEXT,
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, job_id),
  FOREIGN KEY (org_id, channel_account_id) REFERENCES channel_accounts (org_id, channel_account_id),
  UNIQUE (org_id, idempotency_key)
);
CREATE TABLE audit_log (
  audit_id UUID NOT NULL,
  org_id UUID NOT NULL,
  actor_user_id UUID,
  actor_device_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (org_id, audit_id),
  FOREIGN KEY (org_id, actor_user_id) REFERENCES memberships (org_id, user_id),
  FOREIGN KEY (org_id, actor_device_id) REFERENCES devices (org_id, device_id)
);
```

RLS policy pattern: every table with `org_id` uses `USING (org_id = current_setting('app.org_id')::uuid)`. Application roles are scoped per request; no cross-tenant joins.

### 7.2 Desktop (SQLite, SQLCipher)

| Table                                    | Purpose                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `local_meta`                             | Schema version, org_id, device_id, encryption key ref.                                             |
| `sync_cursor`                            | Last applied `seq`; last event id.                                                                 |
| `contacts_cache`                         | Authorized contact records; merge/identity links; `last_synced_at`.                                 |
| `conversations_cache`                    | Authorized conversation summaries; `dirty`, `last_synced_at`.                                      |
| `channel_accounts_cache`                 | Connected send targets, capability flags, status/health, and webhook state; no provider tokens.     |
| `whatsapp_accounts_cache`                | WhatsApp connection/WABA/number display metadata, statuses, quality, throughput, and calling capabilities; no tokens or onboarding secrets. |
| `opportunities_cache`                    | Pipeline opportunities, stage history, products, and owner; `last_synced_at`.                        |
| `sales_signals_cache`                    | Open/resolved deterministic signals and follow-up tasks for the recovery queue.                      |
| `messages_cache`                         | Authorized messages; FTS5 index; `pending` flag.                                                   |
| `email_accounts_cache`                   | Connected mailbox metadata, status, owner, default, and capabilities; no credentials or OAuth tokens. |
| `email_folders_cache`                    | Account-scoped folder/label tree, roles, role source, visibility, counts, and sync revision.        |
| `email_message_folders_cache`            | Many-to-many folder/label membership used by the mail views and label chips.                        |
| `products_cache` / `product_media_cache` | Catalog metadata, thumbnails, media paths.                                                         |
| `quote_templates_cache`                  | Template configs and brand assets.                                                                 |
| `quotes` / `quote_items`                 | Local quote state; sync status.                                                                    |
| `outbox`                                 | Queued commands; retry count; next attempt; idempotency key.                                       |
| `quote_number_blocks`                    | Reserved blocks and consumption.                                                                   |
| `media_cache`                            | Local variants; LRU metadata.                                                                      |
| `settings`                               | Local preferences; cached entitlement lease.                                                       |
| `local_security` (keychain)              | Argon2id hash/salt, wrapped DEK, failed-attempt counter, policy version; outside the encrypted DB. |

Desktop DB is a **cache**, not an authority. Every write is a command; optimistic local rows carry `dirty=1` and are reconciled on the event.

### 7.3 Migrations

- Cloud: versioned SQL migrations; expand/contract for zero-downtime; RLS policies in migrations.
- Desktop: `PRAGMA user_version`; migration runner; pre-migration backup; SQLCipher key rotation.
- Legacy 1.x → 2.0: export Manager data, re-enroll devices, backfill the event log, migrate media variants, and preserve quote numbers.
- 2.0 standardizes entity IDs on UUID; legacy `TEXT` IDs are migrated. `messages.message_id` and related references move together in the same migration.
- Backfill `users`/`memberships` from `sales_nodes` (rep -> `sales`), link each device to a user, and start fresh sessions on re-link.
- Backfill `threads.contact_id` from phone/email identities; remove legacy phone/email uniqueness; add the unique provider conversation key. Do not add a one-open-conversation-per-contact constraint: contacts may have multiple conversations and opportunities.
- Create `opportunities` from existing thread deal fields: one opportunity per thread initially, mapping `deal_stage` to the new stage vocabulary, moving estimated value/currency/owner, and linking the source conversation. Existing quotations receive `opportunity_id`; conflicting threads are reviewed before the column becomes non-null.
- Backfill conversation metrics and deterministic signals from historical messages and quotations; do not require AI, and keep the event log as the source of truth.
- Backfill `quote_versions`/`quote_tax_lines` `org_id`; initialize `security_policies` defaults (10 min default, 60 min max); existing devices must set a local unlock password before accessing data.
- Tenant-key migration: add/backfill `org_id` on every tenant table; create unique indexes `(org_id, entity_id)` concurrently; add composite FKs as `NOT VALID`, validate after the orphan check, then drop single-column FKs. Switch primary keys only after validation; keep the old global unique ID as a transitional index if needed.
- Cross-tenant audit query before validation: every child `(org_id, parent_id)` must match exactly one parent `(org_id, parent_id)`; quarantine or delete orphans before enforcing FKs.
- Create `whatsapp_connections`, `whatsapp_business_accounts`, and `whatsapp_phone_numbers`; backfill each existing WhatsApp `channel_accounts` row into a connection/WABA/phone tuple using its stored WABA parent and phone number ID; link the phone row 1:1 to the `channel_accounts` send target and move token, scope, webhook, registration, quality, and calling state into the new tables. Rename `channel_accounts.type` to `channel`; make provider/external_id nullable for WhatsApp; retain `parent_external_id` only for Page/TikTok grouping. Backfill `meta_business_portfolio_id` from Graph where known, otherwise leave it null and re-read it on reconnect. Reuse rows by Meta WABA/phone ID on reconnect; never duplicate. Add `channel.connection_updated`, `channel.connection_revoked`, and `channel.connection_disconnected`.
- Rekey `wa_templates` from the Meta WABA text ID to the internal `(org_id, waba_id)` and drop `phone_number_id`; backfill every template to its WABA. Templates are WABA-scoped in 2.0; number-scoped templates are not migrated because they are not supported.
- Re-key `wa_opt_ins` by the sending `wa_phone_number_id`; backfill where the originating number is known, otherwise require a fresh opt-in before marketing from that number.
- Add `invoices.charge_class` (`subscription` | `usage` | `add_on`) and backfill existing invoices as `subscription`; add `whatsapp_business_accounts.meta_payment_status`. Never import Meta messaging/calling charges as IntelluxIQ invoice lines.
- Add email auth/setup fields; backfill `provider_account_id` from the provider profile or the mailbox address/host, initialize `role_source='provider'`, and keep credentials out of the database migration.
- Backfill `email_messages.folder` into `email_folders`/`email_message_folders`, rekey `email_sync_state` by `folder_id`, preserve `UIDVALIDITY`/`last_uid`, and drop the legacy column only after the orphan audit.
- Email protocol data is cloud-only; desktop SQLite has no SMTP/IMAP credentials, IMAP sync cursors, or MIME parser. The desktop caches messages, drafts, normalized account/folder metadata, and message-to-folder memberships received through sync.

## 8. Protocol and events

### 8.1 Event envelope

```json
{
  "event_id": "018f...",
  "org_id": "8b1...",
  "seq": 12345,
  "type": "message.created",
  "entity_type": "message",
  "entity_id": "9c2...",
  "schema_version": 3,
  "payload": {},
  "correlation_id": "018f...",
  "causation_id": "018f...",
  "producer": "cloud",
  "actor": { "user_id": "u1", "device_id": "d1" },
  "created_at": "2026-11-16T10:00:00Z"
}
```

### 8.2 Command envelope

```json
{
  "command_id": "018f...",
  "org_id": "8b1...",
  "device_id": "d1",
  "type": "message.send",
  "expected_version": 42,
  "idempotency_key": "018f...",
  "trace_id": "018f...",
  "sent_at": "2026-11-16T10:00:00Z",
  "payload": {}
}
```

Cloud responds `accepted` or `rejected` with a code; the resulting event arrives on the stream. Commands are idempotent by `idempotency_key`; duplicate commands return the original result.

Core conversation, opportunity, and intelligence commands:

| Command | Purpose |
| --- | --- |
| `thread.assign` | Manager/admin assigns or reassigns a conversation; unassigned conversations remain read-only for sales. |
| `message.send` | Send only if the actor is the assigned sales user or a manager; otherwise `READ_ONLY`/`THREAD_ASSIGNED`. |
| `opportunity.create` | Create an opportunity for a contact, optionally linking source conversations and products. |
| `opportunity.change_stage` | Move `enquiry → qualified → quotation → negotiation → won/lost`; writes stage history and an event. |
| `opportunity.assign` | Manager/admin changes the opportunity owner; audited. |
| `opportunity.link_conversation` | Link another channel conversation to the opportunity; manager/owner. |
| `opportunity.set_follow_up` | Set the next follow-up time and optionally create a follow-up task. |
| `quote.create` | Create a quote for an opportunity; `conversation_id` is optional source context. |
| `signal.acknowledge` / `signal.resolve` / `signal.dismiss` | Manage a deterministic intelligence signal. |
| `follow_up.complete` | Complete a follow-up task; feeds recovery and team outcomes. |

See §12.3 for the canonical command/event catalog; this table is the minimum core.

### 8.3 Event types

| Domain    | Events                                                                                                                                             |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Messaging | `message.created`, `message.status_updated`, `message.deleted`                                                                                     |
| Media     | `media.ready`, `media.failed`                                                                                                                      |
| Conversations | `thread.created`, `thread.updated`, `thread.assigned`                                                                                              |
| Channels    | `channel.account_updated`, `channel.account_removed`, `channel.connection_updated`, `channel.connection_revoked`, `channel.connection_disconnected` |
| Opportunities | `opportunity.created`, `opportunity.updated`, `opportunity.stage_changed`, `opportunity.owner_changed`, `opportunity.linked`                       |
| Intelligence | `intelligence.signal.opened`, `intelligence.signal.updated`, `intelligence.signal.resolved`                                                        |
| Follow-ups   | `follow_up.created`, `follow_up.updated`, `follow_up.completed`                                                                                     |
| Quotes    | `quote.created`, `quote.updated`, `quote.sent`, `quote.status_updated`, `quote.approval_requested`                                                 |
| Catalog   | `catalog.updated`, `catalog.deleted`, `template.updated`                                                                                           |
| WhatsApp  | `wa.template_status_changed`, `wa.window_updated`, `wa.quality_changed`                                                                            |
| Email     | `email.received`, `email.sent`, `email.status_updated`, `email.bounced`, `email.account_updated`, `email.account_removed`, `email.folders_synced`, `email.folder_updated`, `email.folder_removed`, `email.message_folders_updated` |
| Calls     | `call.ringing`, `call.updated`, `call.ended` (Phase 3)                                                                                             |
| Users     | `user.invited`, `user.updated`, `user.removed`                                                                                                     |
| Devices   | `device.linked`, `device.unlinked`, `device.terminated`, `device.pending_wipe`, `device.wipe_acked`                                                |
| Sessions  | `session.revoked`                                                                                                                                  |
| Security  | `security.policy_updated` (all devices), `device.lock_requested` (target device); `device.local_wipe`, `device.unlock_failed` (audit/console only) |
| Billing   | `entitlement.updated`, `subscription.updated`                                                                                                      |
| AI        | `ai.disabled`, `ai.job_completed` (stub: disabled only)                                                                                            |

Ephemeral (not persisted in the log): `presence.updated`, `typing.started`, `typing.stopped`.

Security audit events (`device.unlock_failed`, `device.local_wipe`) are not broadcast in the org-wide CRM stream; they go to the audit log and the manager console. Policy and force-lock events are control events delivered to the affected devices. `device.pending_wipe` means `devices.wipe_status = pending`, not a link status. Channel connection events carry lifecycle state, WABA/phone display metadata, permissions, and webhook health only; never tokens, token references, PINs, or raw provider payloads.

§12.3 is the canonical command/event catalog and defines the contract rules.

### 8.4 Sync sequence

1. Device connects with certificate/token; server resolves org, user, role.
2. Client sends `last_seq`; the cloud allocates the next per-org `seq` atomically when appending events.
3. If `last_seq` is within retention, server streams events after it; otherwise sends a snapshot and resumes. Snapshots are compressed, paginated, contain the org's CRM data plus email/channel account status, WhatsApp connection/WABA/number metadata, and folder metadata (all linked CRM devices are authorized), and exclude media and provider secrets (signed URLs are issued separately).
4. Live events over WSS; client acks every 100 events or 5 seconds.
5. Commands over HTTPS; responses; resulting events via WSS.
6. On disconnect, reconnect with backoff and resume from `last_seq`; client dedupes by `event_id`.

**WebSocket lifecycle:** WSS on port 443; short-lived token at connect and periodic revalidation; one active connection per device; heartbeat every 30 s; idle timeout 90 s; reconnect with jitter; per-device outbound queue and backpressure; max frame 1 MB; permessage-deflate; rate limits; no media over the socket. If cursor lag exceeds the event-log retention, force a snapshot resync. Event-log retention defaults to 90 days; snapshots are retained longer.

### 8.5 Org-wide fan-out, read-only assignment, and write authorization

- Every linked CRM device in the org receives every CRM event. There is no per-event audience computation and no per-device filtering.
- The desktop may filter its views (`My conversations`, `All conversations`, `My pipeline`), but the data is local and org-wide. Read visibility is a product decision with security consequences (§9.4).
- **Read:** all `sales` users can view all conversations and opportunities. A conversation not assigned to the actor is read-only for messaging.
- **Write:** the cloud enforces assignment at command time:
  - A conversation has `assigned_user_id` (the messaging owner) or is unassigned.
  - If assigned, only the assigned sales user or a manager/admin can send or update it.
  - If unassigned, all sales users are read-only. A manager/admin must assign it; the routing engine may auto-assign inbound conversations. There is no self-claim by sending.
  - A manager send on an unassigned conversation assigns it to that manager (audited), so ownership stays consistent.
  - A manager can reassign or unassign at any time; this emits `thread.assigned` and updates every device.
  - A non-assigned sales user gets `READ_ONLY` (unassigned) or `THREAD_ASSIGNED` (owned by someone else); the desktop shows the owner and disables the composer.
  - If a conversation is reassigned while a rep is composing, the send is rejected, the draft is preserved, and the UI shows the new owner.
- **Opportunity writes:** the opportunity owner or a manager/admin can change stage, value, products, linked conversations, and follow-ups. Creating a quote requires opportunity write access. A conversation assignee does not automatically get opportunity write access.
- **Intelligence signals:** owners can acknowledge/resolve their signals; managers can resolve or dismiss any signal with a reason. Dismissal without a qualifying outcome is not a recovery.
- Typing/presence is ephemeral and informational; it is not a lock. Conversation assignment locks messaging; opportunity ownership locks the deal.
- On device unlink or termination, the cloud stops the event stream immediately and wipes the local cache; a lost device is handled by revoke + wipe + encryption.
- This prevents double replies without filtering events, at the cost of org-wide read visibility.

### 8.6 Error codes

| Code                    | Meaning                                                   |
| ----------------------- | --------------------------------------------------------- |
| `AUTH_REQUIRED`         | Missing/expired token.                                    |
| `FORBIDDEN`             | Role/tenant mismatch.                                     |
| `CONFLICT`              | Version/assignment conflict.                              |
| `READ_ONLY`             | Conversation is unassigned; sales users can view but not send. |
| `THREAD_ASSIGNED`       | Conversation is owned by another rep; cannot send.        |
| `DEVICE_TERMINATED`     | Device was terminated; wipe and re-link.                  |
| `USER_DISABLED`         | User was disabled; session cannot refresh.                |
| `SESSION_REVOKED`       | Session was revoked; re-authenticate.                     |
| `UNLOCK_FAILED`         | Wrong local unlock password; remaining attempts returned. |
| `DEVICE_LOCAL_WIPED`    | Local data wiped after three failures; re-link required.  |
| `POLICY_PINNED`         | Manager pinned the idle timeout; user cannot change it.   |
| `QUOTE_BLOCK_EXHAUSTED` | No offline quote numbers; go online.                      |
| `VALIDATION_ERROR`      | Invalid payload/field.                                    |
| `RATE_LIMITED`          | Backoff.                                                  |
| `PROVIDER_ERROR`        | Provider rejected; see details.                           |
| `AI_DISABLED`           | Stub phase.                                               |
| `SCHEMA_TOO_OLD`        | Force update.                                             |

## 9. Security, compliance, entitlements

### 9.1 Tenant isolation

- `org_id` on every row; Postgres RLS; per-request `app.org_id`.
- Per-tenant KMS data keys; envelope encryption; object storage prefixes; no shared caches keyed without tenant.
- Per-tenant rate limits/quotas; noisy-neighbor controls.
- Cross-tenant tests in CI; no admin query without tenant scope.
- Within a tenant, read visibility is org-wide by design in 2.0: every linked device caches every CRM event. Do not claim per-rep read isolation. Write authorization is per-conversation assignment: unassigned conversations are read-only for `sales` users; only the assigned user or a manager can send. Opportunity stage/value/quotes require ownership or manager/admin rights. Composite tenant keys and FKs enforce isolation at the database layer.

### 9.2 Device security

- Ed25519 device key; certificate issued by cloud; 15-minute access tokens; device-bound refresh tokens with rotation.
- Server-side sessions; refresh checks user status, device status, and entitlement; revoked sessions cannot refresh.
- Terminate: revoke certificate and sessions, mark device `terminated`, enqueue wipe. Online devices wipe immediately; offline devices wipe on next refresh/connection; powered-off devices cannot be wiped remotely, so disk encryption, the offline lease, and MDM are the fallback.
- Wipe scope: SQLCipher DB/WAL/SHM, media cache, PDFs, attachments, logs, keychain tokens, device key; acknowledge and audit.
- Idle lock: device-local password, Argon2id, wrapped DEK, 3-attempt local wipe (§1.13). Lock and wipe events are audited; passwords are never logged.
- Posture: OS version, app version, disk encryption; force minimum version.
- Single instance per device; screen lock; session timeout.

### 9.3 Secrets

- Provider credentials only in the cloud vault (KMS envelope encryption): OAuth refresh tokens, Meta business/Page/Instagram tokens, TikTok access/refresh tokens, app passwords, and provider API keys. They are never returned by the API.
- WhatsApp business tokens are vaulted per WABA and referenced by `whatsapp_business_accounts.token_ref`; token type, expiry, and refresh metadata live on the WABA. Tokens are never stored on `channel_accounts`, in events, or on the desktop. BSP-supplied tokens follow the same rule. Registration PINs are not stored at all.
- OAuth client IDs/secrets are application configuration in the secret manager, not tenant rows. Per-account secrets are referenced by `secret_ref` (non-WhatsApp) or `token_ref` (WhatsApp WABA) and decrypted only in workers.
- Rotation; per-tenant scope; audit access. Refresh-token rotation is atomic; app passwords can be replaced but never re-displayed.
- No access token, refresh token, authorization code, app password, or client secret in logs, crash reports, browser storage, redirect URLs, sync events, or desktop storage.

### 9.4 Data protection and compliance

- TLS 1.3 in transit; encryption at rest for Postgres, object storage, backups.
- Retention/erasure per org; export on cancellation; deletion window.
- DPA, sub-processors, data residency (Kenya/EU), Kenya DPA 2019, GDPR where applicable.
- Call recording consent and disclosure (Phase 3); WhatsApp opt-in; email consent.
- Pen test before launch; SOC 2 roadmap for enterprise; incident response and breach notification.
- Org-wide read visibility increases the blast radius: disk encryption, remote wipe, device posture, and a bounded offline lease are mandatory. DPIA/DPA and customer contracts must disclose that all linked devices can read all customer conversations and opportunity data. Enterprise customers may require per-conversation privacy later.
- Lost-device termination is best-effort: an offline device retains encrypted data until it reconnects. Document this limitation; recommend OS-level remote wipe/MDM for high-risk devices.
- Local idle-lock wipe is also best-effort on SSDs and cannot erase forensic copies or backups. The local unlock password is a separate credential; account passwords are never stored.

### 9.5 Subscription, provider charges, and entitlements

Billing has three separate charge classes. They must stay separate in the data model, the UI, and the invoice.

| Charge class | Biller and payer | Scope | In an IntelluxIQ invoice? |
| --- | --- | --- | --- |
| Meta WhatsApp messaging/calling | Meta bills the customer directly through the customer's Meta business portfolio payment method. If the customer has a separate BSP-managed billing arrangement, the BSP bills for Meta charges under that agreement; IntelluxIQ is not a party to either. | Meta conversation/message/calling pricing; provider-owned. | **No.** IntelluxIQ does not invoice, collect, hold, remit, or mark up Meta charges in 2.0. |
| IntelluxIQ subscription | IntelluxIQ bills the customer through Stripe/Paddle plus an M-PESA-capable provider for Kenya. | Organisation base + connected sendable channels + monthly active conversations; devices included up to the plan cap. | **Yes.** |
| Optional IntelluxIQ usage | IntelluxIQ bills the customer only when the customer explicitly enables the overage/add-on. | For example storage above plan or AI credits when enabled. | **Yes**, on a separate `charge_class='usage'`/`'add_on'` invoice; never inferred from Meta charges. |

- A WhatsApp **phone number** is one connected channel for IntelluxIQ billing. The WABA and connection are grouping/onboarding records and are not separately billed. Meta's per-conversation/per-message/calling charges remain the customer's direct obligation to Meta.
- `whatsapp_business_accounts.meta_payment_status` is read-only onboarding state for the customer's Meta payment method (unknown/missing/pending/added/failed) or a BSP-managed/not-applicable arrangement. It is never an IntelluxIQ payment method, invoice state, or dunning state. The account state `pending_provider_billing` means the provider-side payment method (or a BSP-managed billing confirmation) is still pending; it never means "the customer owes IntelluxIQ".
- Plans: device limit, channel limit, conversation/storage/AI limits; the pricing metric and plan caps are in §12.6.
- Entitlements cached on desktop with a 14-day offline lease; grace period; read-only after expiry (never delete local data). The 7-day session offline lease in §1.12 is separate; the shorter one wins.
- Enforcement at device link and at send; clear upgrade prompts.
- Billing: Stripe/Paddle plus M-PESA for Kenya; invoices, VAT, dunning, cancellation, export. Invoices carry a `charge_class` (`subscription` | `usage` | `add_on`) and never contain a Meta charge.
- Usage metering: active devices, connected channels, monthly active conversations, storage, AI credits, and provider diagnostics. Meta message/call volumes may be recorded in provider diagnostics for cost reporting and reconciliation, but they are never `usage_events` or IntelluxIQ invoice lines.
- **No accidental billing intermediary.** Combining Meta charges with IntelluxIQ invoices, reselling Meta credit, holding customer funds, or becoming the merchant of record for Meta requires a deliberate ADR, a separate ledger, tax/compliance review, and explicit customer consent. It is not part of 2.0. A BSP may bill a customer under its own arrangement; that relationship is external to IntelluxIQ and does not change this boundary.

### 9.6 Audit and observability

- Audit: device link/unlink, role changes, billing changes, data exports, support access, sends, email account connect/reconnect/disconnect, owner changes, default changes, social channel asset connect/reconnect/disconnect, and WhatsApp connection/WABA/number onboarding, token rotation, revocation, disconnect, and BSP fallback use.
- Metrics: event lag, WS connections, outbound failures, provider errors, webhook-signature/asset-mapping failures, folder-discovery lag/failures, reauthentication/setup failures, queue depth, sync errors, tenant health.
- Tracing per command/event; PII redaction in logs.
- Status page and incident runbooks.

## 10. Roadmap and open decisions

### 10.1 Phases (2.0 core)

| Phase                  | Scope                                                                                                                                                                                            | Estimate\*  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| 0 — Cloud foundation   | Orgs/users/roles/devices/auth, sessions/termination/wipe, security policy/idle lock/local wipe, event log, WSS sync, Next.js + Hono/Bun API, i18n/a11y foundations, subscription skeleton, audit | 8–12 weeks  |
| 1 — Channel egress     | WhatsApp messaging/templates/media, email provider authentication/onboarding, outbound/inbound, folder discovery, cloud egress, desktop sync/outbox, session refresh                                             | 12–14 weeks |
| 1.5 — Social messaging | WhatsApp Embedded Signup v4 with connection/WABA/phone hierarchy and lifecycle, Messenger, Instagram (Login + Page fallback), TikTok (gated), app-level webhooks, channel accounts, desktop channels | 8–12 weeks  |
| 2 — Catalog and quotes | Cloud catalog/media origin, brand studio, quoting math, PDF, approvals, opportunity-linked quotes                                                                                              | 8–10 weeks  |
| 2.5 — Sales intelligence | Contact/conversation/opportunity separation, deterministic signals, lead recovery, conversation/pipeline metrics, outcome model, manager dashboards                                      | 6–8 weeks   |
| 3 — Voice (deferred)   | Cloud signaling, desktop media, AT/Twilio, recording                                                                                                                                             | 16–24 weeks |
| 4 — Real AI (later)    | Transcription, autopsy, hints; eval/privacy                                                                                                                                                      | 8–12 weeks  |
| Hardening/pilot        | Security, compliance, load/chaos, migration, pilot                                                                                                                                               | 6–8 weeks   |

**Estimate basis:** 5–7 engineers (backend, desktop, SRE, security). Sequential total is ~11–15 months; parallel work can compress to ~8–11 months. A narrow 2.0 release without voice: 7–9 months with ~4 engineers. The §12 contract pack, release/update pipeline, billing skeleton, telemetry/crash plumbing, and test harness are built alongside Phase 0/1, not as a separate phase.

### 10.2 Validation and post-2.0 items

§12.10 fixes the build-blocking defaults. These items remain for validation, legal/commercial sign-off, or post-2.0:

| Item                           | 2.0 default                                  | When          |
| ------------------------------ | -------------------------------------------- | ------------- |
| Pricing numbers and packaging  | Metric fixed; prices TBD                     | Before launch |
| Data region and DPA            | EU pilot region; Kenya/Africa when available | Before pilot  |
| Per-conversation privacy       | Org-wide read in 2.0                         | Post-2.0      |
| Manager-only whispers          | Team-visible in 2.0                          | Post-2.0      |
| Web catalog/brand admin        | Manager desktop                              | Post-2.0      |
| Voice timing                   | Phase 3                                      | Confirm       |
| Email provider validation      | Gmail API + Microsoft Graph + Zoho API first with OAuth app review; IMAP presets for Yahoo/iCloud/cPanel; Postmark/SendGrid for outbound | Phase 1/pilot |
| WhatsApp onboarding validation | Direct Embedded Signup v4 first; Tech Provider/Tech Partner; BSP manual/embedded fallback only, with no single-BSP dependency; connection/WABA/phone lifecycle verified | Pilot |
| WhatsApp billing boundary      | Customer pays Meta directly (or through its BSP billing arrangement) for messaging/calling; IntelluxIQ subscription and optional usage invoiced separately; no pass-through or billing intermediary | Pilot |
| Social messaging provider access | Meta App Review/Business Verification; Instagram Login review; TikTok Business Messaging/data-security/region gate | Phase 1.5/pilot |
| Framework upgrade cadence      | Exact pinning; quarterly window              | Ongoing       |
| Offline termination/MDM        | Best effort                                  | Accepted      |
| User removal retention         | Audit 12 months                              | Legal         |
| Reassignment timeout           | 4 business hours                             | Pilot         |

No item in this table blocks the build; pricing, data region, and DPA are launch gates.

### 10.3 Risks

- Meta policy/template/quality changes; social messaging API/review changes; TikTok Business Messaging availability/region gates; media limits and ID expiry.
- Meta pricing/billing changes and customer confusion between Meta charges, IntelluxIQ subscription, and optional usage; mitigated by explicit labels, separate charge classes, and no pass-through.
- BSP commercial/technical dependency or lock-in; mitigated by making the direct Embedded Signup path the default, keeping the BSP fallback adapter-based, and never making core WhatsApp I/O depend on one BSP.
- Provider API changes (Meta social, TikTok, email/voice), folder/label schema changes, OAuth app verification, owner-consent complexity, and IMAP namespace variations; deliverability.
- Cloud media egress and WebSocket costs; unit economics.
- Voice complexity (SIP/TURN/AEC/recording).
- Compliance (recording consent, data residency, DPA).
- Desktop framework churn; auto-update/version skew.
- Multi-tenant isolation defects.
- User lifecycle mistakes: wrong user removed, orphaned threads, role drift.
- Offline termination is best-effort; a powered-off device cannot be wiped until it reconnects.
- Idle lock/3-attempt wipe can cause data loss if a user forgets the unlock password; support and user education are required.
- Local wipe cannot erase forensic copies or backups; Argon2id and disk encryption are the mitigation.

## 11. Voice (Phase 3)

Voice is part of the product direction but **not part of the 2.0.0 core**. It is specified here so the architecture, credentials, and desktop media stack do not have to be reworked later.

### 11.1 Scope

- WhatsApp Business Calling (voice first; video only where Meta exposes it).
- Africa's Talking and Twilio for PSTN/SIP numbers.
- Inbound/outbound calls, hold, mute, DTMF, warm transfer, recording where the provider permits, and call timeline entries.
- Call queue/IVR/business hours are required for "high-volume" inbound; the 2.0.0 desktop is not a call centre.

### 11.2 Architecture

- **Cloud:** call-control signaling, provider webhooks, routing/ring groups, presence, short-lived provider tokens, recording metadata. The cloud does not carry RTP unless a gateway is deliberately added.
- **Desktop:** `str0m` for ICE/DTLS-SRTP/SDP, `cpal` for audio I/O, Opus (and G.711 for PSTN), a jitter buffer, AEC/NS/AGC, RTP/RTCP handling, and a TURN client.
- **Provider path:** either direct WebRTC/SIP from the desktop with TURN, or a provider SIP gateway. The cloud mints short-lived credentials and routes calls; it does not store long-lived SIP passwords on desktops.

`str0m` is sans-I/O. It provides the WebRTC state machine, not a softphone: the audio pipeline, jitter buffer, AEC, TURN, device management, and SIP stack are separate work. This is why voice is a 4–6 month module, not a four-week phase. Audio details are in §13.

### 11.3 WhatsApp Calling

- Subscribe to the `calls` webhook field; exchange SDP through the Graph API; answer/reject with the cloud as signaling relay.
- Outbound calls use the approved call-permission template (`voice_call_request`) and one-click dial once the customer approves.
- Incoming calls ring the assigned sales user's desktop; if they are offline, route to another online user or voicemail.
- Video calling is not a 2.0.0 promise. Meta's Calling API is voice-first; video/screen-share availability varies by region and version.
- Meta does not expose call recordings through the Calling API as of this writing (verify with Meta). Any WhatsApp recording is client-side capture of both parties, requires consent/disclosure, and must be uploaded to cloud media by the desktop.

### 11.4 Africa's Talking and Twilio

| Capability   | Africa's Talking                           | Twilio                                                              |
| ------------ | ------------------------------------------ | ------------------------------------------------------------------- |
| Numbers      | Kenyan local/toll-free (`+254`)            | Global DIDs                                                         |
| Signaling    | SIP over TLS + Voice XML webhooks          | SIP trunking / WebRTC + TwiML                                       |
| Controls     | DTMF, mute, hold, warm transfer, recording | DTMF, mute, hold, warm transfer, recording                          |
| Desktop path | SIP client or provider gateway             | SIP client or provider gateway; Twilio has no native Rust Voice SDK |

A SIP stack is required for AT SIP trunks and Twilio SIP. Building one is a separate, non-trivial workstream; buying a SIP gateway or hosted softphone is the lower-risk v1 path.

### 11.5 Call control and timeline

- Ring groups, queue, business hours, holiday routing, voicemail, callback request, and overflow to mobile when no rep answers.
- Warm transfer uses a consult call and a bridge; the cloud coordinates, the desktop media path renegotiates.
- Call events (`call.ringing`, `call.updated`, `call.ended`) appear on the unified customer timeline with duration, direction, and outcome.
- Screen-pop shows the customer's conversations, open opportunity value, and recent orders.

### 11.6 Recording, transcription, and AI

- AT/Twilio recordings are fetched by the cloud, stored as media, and attached to the timeline.
- WhatsApp recordings, where used, are captured at the desktop with a disclosure/consent flag and uploaded.
- Transcription and diarization are post-2.0 AI work; Whisper does not separate speakers by default. Transcripts feed the AI autopsy only after the AI module is enabled.
- Recording consent and retention are policy-controlled per org; see §9.4.

### 11.7 Build vs buy and estimate

- **Buy/host:** a provider SIP gateway or hosted softphone, plus LiveKit/Twilio for any video demo. Lower engineering risk.
- **Build:** `str0m` media + SIP stack + TURN + AEC + recording mixer + call queue. Estimate 16–24 weeks for an experienced audio/WebRTC team, plus carrier integration and certification.
- Do not put voice in the same phase as WhatsApp/email; it is a separate track with its own test matrix (headsets, NAT, mobile, codecs, recording consent).

## 12. Engineering Contract and Release

This section closes the minimum engineering gaps from the spec review. It is deliberately lightweight: one contract pack, one operating envelope, and release gates. Detailed OpenAPI, AsyncAPI, DDL, and runbooks are generated artifacts; the rules and 2.0 defaults are fixed here.

**P0 closure map**

| P0 gap                                             | Where closed |
| -------------------------------------------------- | ------------ |
| Requirements, acceptance, traceability             | §12.1        |
| Capacity, SLOs, DR                                 | §12.2        |
| API and event contract                             | §12.3        |
| Data-model corrections                             | §12.4        |
| Security and privacy baseline                      | §12.5        |
| Billing and entitlements                           | §12.6        |
| Desktop release, update, signing, crash, telemetry | §12.7        |
| Migration, pilot, rollback                         | §12.8        |
| Test strategy and release gates                    | §12.9        |
| Build-blocking decisions                           | §12.10       |

### 12.1 Requirements, acceptance criteria, and traceability

- Requirement IDs: `FR-<area>-###` and `NFR-<area>-###`. Every issue and PR references one.
- Acceptance criteria use Given/When/Then and live in the issue tracker next to the requirement.
- Definition of Done: code, tests, contract/schema update, docs, opt-in telemetry event (if applicable), security review for sensitive changes, and a migration/rollback note.
- No separate requirements tool is required for 2.0; the issue tracker plus this spec is the source of truth.

| Core flow                        | Minimum acceptance criteria                                                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| WhatsApp text in window          | Sends via cloud egress; status transitions; duplicate `client_msg_id` does not double-send.                                              |
| WhatsApp template outside window | Only `APPROVED` template; variables validated; opt-in/window/quality checks; Meta error mapped to user action.                           |
| WhatsApp media                   | Desktop preflight; variant within limits; cloud revalidation; media-ID reuse or re-upload; failure leaves draft intact.                  |
| Social messaging                  | WhatsApp Embedded Signup v4, Messenger Pages, Instagram Login/Page fallback, and gated TikTok onboarding; app-level signed webhooks; account status sync; no provider token on desktop. |
| Entity separation                | Contact, conversation, opportunity, message, and quote remain distinct; a contact has many conversations/opportunities; a conversation links zero or more opportunities; a quote requires an opportunity; `threads` carries no deal stage/value. |
| Conversation assignment          | Unassigned conversation is read-only; manager assigns; non-owner send rejected; reassignment preserves the draft.                        |
| Opportunity lifecycle            | Enquiry → qualified → quotation → negotiation → won/lost; stage history recorded; only owner/manager changes stage; quote requires opportunity write access. |
| Lead recovery                    | Deterministic signals for unanswered leads, silent customers, quote follow-up, inactivity, overdue follow-ups; resolve vs dismiss is audited; no AI required. |
| Pipeline intelligence            | Cohort conversion and time-in-stage computed from stage history; won revenue counted once; stale opportunities surfaced.                  |
| Team performance                 | Outcomes (enquiries, qualified, quotes, accepted, won, revenue, recovered, follow-ups, conversion) ranked over activity; message counts are diagnostics only. |
| Quote                            | Opportunity required; offline number block consumed; tax/discount/FX totals match stored values; PDF renders; send is idempotent; no number collision. |
| Email                            | Cloud SMTP/IMAP only; desktop has no protocol code or credentials; send/receive; RFC 5322 threading; Sent append; bounce recorded; duplicate Message-ID not re-threaded. |
| Email account onboarding         | Provider-specific OAuth/app-password setup; folder preview; duplicate/provider-mismatch rejection; no secret in browser or desktop; reauth preserves account/folder/message identity; default/owner changes sync. |
| Device lifecycle                 | Link, terminate online/offline, wipe ack, re-link; no customer data survives a successful wipe.                                          |
| Idle lock                        | Timeout locks; wrong password count persists; third failure wipes; manager policy wins.                                                  |
| Offline/reconnect                | Queued commands replay once; cursor resumes; deletes do not resurrect; conflict is visible to the user.                                  |
| Tenant isolation                 | Tenant A cannot read, write, search, or infer tenant B data through API, events, media, or logs. Every tenant table has composite `(org_id, id)` keys and every tenant FK is composite; the DB rejects cross-org references. |
| Accessibility                    | Keyboard-only path; accessible name/role/state; focus visible/restored; screen-reader smoke; 4.5:1 contrast; 200% text; reduced motion.  |
| Internationalization             | English/Spanish key parity; no hardcoded user-facing strings; date/number/currency/plural formatting; missing key falls back to English. |
| Module boundaries                | Feature registers through its public module contract; no cross-feature internal imports; architecture test passes.                       |

### 12.2 Capacity, SLOs, and DR

This is an **initial operating envelope** for pilot and load testing, not a contractual SLA. Re-baseline after the pilot.

| Dimension           | 2.0 design target                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| Organisation        | Up to 50 linked devices, 5 WhatsApp numbers, 5 email accounts, 5 social messaging accounts.      |
| Conversation volume | 20,000 WhatsApp/social/email messages per org per day; 100,000 threads; 1M messages retained.   |
| Catalog             | 10,000 SKUs; 100 GB media per org; variants generated on demand.                                |
| Realtime            | 50 concurrent WebSocket connections per org; 10 concurrent calls per org (Phase 3).             |
| Availability        | 99.9% monthly API availability; single region, multi-AZ.                                        |
| API latency         | p95 read ≤300 ms, write ≤500 ms at the envelope.                                                |
| Event fan-out       | p95 ≤2 s for a small event to 50 devices in the same region.                                    |
| Send acceptance     | p95 ≤500 ms from command acceptance to provider handoff.                                        |
| Desktop health      | Crash-free sessions ≥99.5%; sync lag p95 ≤5 s.                                                  |
| DR                  | Postgres PITR RPO ≤15 min; RTO ≤4 h; daily backups retained 35 days; object storage versioning. |
| Load test           | 2× the envelope for 60 minutes before each major release.                                       |

- Multi-region active-active is not a 2.0 requirement. A single region with multi-AZ, tested backups, and a documented regional recovery is sufficient.
- On-call rotation, status page, and incident runbooks are required before the first paying org. A quarterly restore drill is required.
- If the envelope is exceeded, the cloud sheds load with 429/`Retry-After` rather than degrading all tenants.

### 12.3 API and event contract

The contract pack consists of OpenAPI 3.1 (REST), AsyncAPI 2.6 (WebSocket), and JSON Schema for commands/events. It is generated into docs and checked in CI; breaking changes require a new major version.

**Envelopes**

- Event includes `correlation_id`, `causation_id`, `producer`, and `schema_version` (see §8.1).
- Command includes `sent_at` and `trace_id`; `idempotency_key` is scoped to `(org_id, device_id)` and retained 7 days.
- Response is `accepted` with `command_id`/`event_seq`, or `rejected` with an error envelope: `code`, `message`, `retryable`, `details`, `request_id`.
- Client acks `(device_id, seq)` every 100 events or 5 seconds. Missing ack does not delete the event; the cursor is authoritative.
- Snapshot is addressed by `seq`, compressed (JSON or MessagePack), paginated, and excludes media. Media is fetched by signed URL.
- Versioning: `/v1` URL major; additive event fields are backward-compatible; N/N-1 client support; `SCHEMA_TOO_OLD` forces update.
- Rate limits return 429 with `Retry-After`; per-tenant and per-device quotas are enforced at the edge.

**Core command catalog**

| Command              | Required payload                                                  | Notes                                        |
| -------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| `thread.assign`      | `thread_id`, `assignee_user_id`                                   | Manager/admin only; emits `thread.assigned`. |
| `thread.update`      | `thread_id`, `tags`/`category`, `expected_version`                | Assigned user or manager; no deal fields.    |
| `message.send`       | `thread_id`, `client_msg_id`, `channel`, `content`                | Assigned user or manager; idempotent.        |
| `opportunity.create` | `contact_id`, `name`, `stage`, `products`, optional `thread_ids` | Owner or manager; emits `opportunity.created`. |
| `opportunity.change_stage` | `opportunity_id`, `from_stage`, `to_stage`, `reason`       | Owner/manager; writes stage history.         |
| `opportunity.assign` | `opportunity_id`, `owner_user_id`                                 | Manager/admin only.                          |
| `opportunity.link_conversation` | `opportunity_id`, `thread_id`                            | Owner/manager; audited.                      |
| `quote.create`       | `opportunity_id`, optional `thread_id`, `items`, `currency`, `template_id` | Opportunity write access; validates prices/tax/FX. |
| `quote.update`       | `quote_id`, `version`, `items`/`discounts`                        | Creates a new immutable version.             |
| `quote.send`         | `quote_id`, `channel`                                             | Compiles/upload PDF; dispatches.             |
| `catalog.publish`    | product payload, media hashes                                     | Manager/admin only.                          |
| `wa.template.submit` | `template_id`, `version`                                          | Manager/admin only.                          |
| `media.upload`       | `blake3_hash`, `profile`, `size`                                  | Returns signed URL or multipart session.     |
| `email.send`         | `account_id`, `thread_id`, recipients, subject, body, attachments | Cloud egress; idempotent.                    |
| `reminder.create`    | `thread_id` or `opportunity_id`, `trigger_at`, `note`             | Native/desktop follow-up.                    |
| `signal.acknowledge` | `signal_id`                                                       | Owner or manager.                            |
| `signal.resolve`     | `signal_id`, `outcome`, `note`                                    | Owner or manager; recovery outcome.          |
| `signal.dismiss`     | `signal_id`, `reason`                                             | Manager only; not a recovery.                |

**Additional events** (beyond §8.3): `quote.approved`, `quote.rejected`, `quote.expired`, `thread.tagged`, `message.reaction`, `media.uploaded`, `email.draft_saved`, `email.sent_folder_synced`, `reminder.due`, `opportunity.won`, `opportunity.lost`, `opportunity.stage_history_recorded`, `follow_up.overdue`, `security.policy_updated`.

**State machines**

| Entity    | States                                                                                                                       |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Conversation | `unassigned` → `assigned` → `reassigned` (read-only for non-owner); `closed_at` closes the conversation.                     |
| Opportunity | `enquiry` → `qualified` → `quotation` → `negotiation` → `won`/`lost`; stage history immutable.                             |
| Quote     | `draft` → `pending_approval` → `approved`/`rejected` → `sent` → `accepted`/`expired`; versions immutable.                    |
| Template  | `DRAFT` → `PENDING` → `APPROVED`/`REJECTED` → `PAUSED`/`DISABLED`.                                                           |
| WhatsApp onboarding | `initiated` → `pending_assets` → `code_received` → `code_exchanged` → `assets_verified` → `waba_subscribed` → `provisioning` → `completed`; `failed`/`cancelled` terminal. |
| WhatsApp connection | `provisioning` → `pending_review`/`pending_provider_billing` → `ready`; `restricted`/`reauth_required`/`error`/`disabled`; `revoked`/`disconnected`. |
| WhatsApp phone number | `provisioning` → `pending_review`/`pending_provider_billing` → `ready`; `restricted`/`reauth_required`/`error`/`disabled`; `revoked`/`disconnected`. Registration and verification are tracked separately from send status. |
| Email     | `queued` → `sending` → `sent` → `delivered`/`bounced`/`failed`; drafts separate.                                             |
| Device    | Link state: `linked` → `revoked`/`terminated`; wipe state: `none` → `pending` → `sent` → `acked`/`failed`, or `local_wiped`. |
| Session   | `active` → `revoked`/`expired`.                                                                                              |
| Idle lock | `unlocked` → `locked` → `unlocked`, or `wiped` after 3 failures.                                                             |

Contract tests use golden JSON fixtures for every command/event. A payload change without a schema version bump fails CI.

### 12.4 Data-model corrections

These changes close the referential, tenant-key, and RLS gaps found in review. They are applied expand/contract with backfills; the folder-discovery and account-auth changes land in the next migration after `0002`. The final column shapes are in §7.1; this table records the migration-specific work.

| Change                                                                                                                                           | Reason                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Backfill `threads.contact_id`; remove legacy phone/email uniqueness; add provider conversation uniqueness; no one-open-thread constraint | Contact merge, multiple conversations, and repeat business.        |
| Move `deal_stage`/value/intent/currency fields from `threads` to `opportunities`; link source conversation; add `quotations.opportunity_id` | Separate conversation from sales opportunity.                    |
| Backfill `memberships.max_active_chats` (default 15)                                                                                             | Capacity routing.                                                  |
| Backfill `quote_versions`/`quote_tax_lines` `org_id`; convert keys and FKs to `(org_id, quote_id, …)`                                             | RLS and tenant-scoped referential integrity.                        |
| Populate `messages.reply_to_message_id` for new replies                                                                                          | WhatsApp/email quoted messages.                                    |
| Change `outbound_jobs` to PK `(org_id, job_id)` and `UNIQUE (org_id, idempotency_key)`                                                           | Prevent cross-tenant collisions.                                   |
| Create `whatsapp_connections`, `whatsapp_business_accounts`, and `whatsapp_phone_numbers`; backfill existing WhatsApp `channel_accounts` into the hierarchy; rename `channel_accounts.type` to `channel` and make WhatsApp provider fields nullable; keep `channel_accounts` as the 1:1 send target; move WABA/token/permission/webhook/registration/quality/calling state into the explicit tables; add `channel.connection_updated`/`channel.connection_revoked`/`channel.connection_disconnected` | Explicit WABA-versus-phone scope, onboarding lifecycle, revocation, and no generic WhatsApp account fields. |
| Add `wa_opt_ins.wa_phone_number_id`; rekey opt-in by sending number and require re-opt-in where the origin is unknown | Number-scoped STOP/START and marketing eligibility; prevents cross-number opt-in leakage. |
| Add partial unique active subscription per org; add `usage_events.source_id` + unique                                                            | Billing correctness and idempotent metering.                       |
| Add `invoices.charge_class` (`subscription` \| `usage` \| `add_on`); add `whatsapp_business_accounts.meta_payment_status` | Keep Meta charges out of IntelluxIQ invoices and distinguish provider billing from IntelluxIQ billing. |
| Add `email_accounts.owner_user_id`; composite FKs to memberships; unique `(org_id, message_id_header)`                                           | Account ownership and tenant-scoped Message-ID.                    |
| Add `provider_account_id`, `provider_tenant_id`, `auth_method`, `provider_preset`, `api_base_url`, `capabilities`, `status_detail`, `last_verified_at`, `deleted_at`; unique `(org_id, provider, provider_account_id)`; backfill provider identity | Stable account identity, setup state, and duplicate-safe reconnect. |
| Add `email_folders.role_source`; backfill `provider` | Preserve manual IMAP/cPanel role overrides across discovery. |
| Add `email.account_updated` and `email.account_removed` events | Desktop sync for account setup, reauth, owner/default changes, and disconnect. |
| Add `email_folders`, `email_message_folders`, `email_account_sync_state`; rekey `email_sync_state` by `folder_id`; backfill and drop `email_messages.folder` | Gmail/Zoho labels are many-to-many; IMAP folders are provider-defined. |
| Keep `devices.status` for linked/revoked/terminated and `wipe_status` for wipe state                                                             | Remove the overlapping `pending_wipe` status.                      |
| Make `audit_log` append-only/WORM; PK `(org_id, audit_id)`; add 12-month retention                                                                | "Immutable audit" in §1.3 is not implemented by an ordinary table. |
| Convert every tenant table to PK/unique `(org_id, entity_id)`; add composite `(org_id, parent_id)` FKs; validate after orphan audit               | Block cross-tenant references at the database layer.                |
| Add indexes on `messages(org,thread,created)`, `email_messages(org,thread,received)`, `email_folders(org,account,parent)`, `email_message_folders(org,account,folder)`, `events(org,seq)`, `outbound_jobs(status,next_attempt_at)` | Query and queue performance.                                       |
| Rekey `wa_templates` by internal `(org_id, waba_id)`; drop `phone_number_id`; templates are WABA-scoped | WABA ownership; no number-scoped templates in 2.0. |

```sql
CREATE INDEX email_messages_thread_idx ON email_messages (org_id, thread_id, received_at);
CREATE UNIQUE INDEX email_accounts_one_default ON email_accounts (org_id) WHERE is_default AND deleted_at IS NULL;
CREATE INDEX email_folders_account_idx ON email_folders (org_id, account_id, parent_folder_id);
CREATE INDEX email_message_folders_folder_idx ON email_message_folders (org_id, account_id, folder_id);
CREATE INDEX outbound_jobs_status_idx ON outbound_jobs (status, next_attempt_at);
CREATE INDEX usage_events_org_metric_idx ON usage_events (org_id, metric, occurred_at);
```

### 12.5 Security and privacy baseline

**Trust model:** the cloud is a trusted data processor in 2.0; there is no end-to-end encryption because cloud egress, search, and support require plaintext processing. This is disclosed in the DPA and customer documentation.

| Control                    | 2.0 baseline                                                                                                                                                                                                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data classes and retention | Account, customer PII, message content, media, call recordings (Phase 3), payment metadata, secrets, telemetry. Messages/media default 24 months (org-configurable, minimum 30 days); call recordings 90 days; audit 12 months; logs 30 days; backups 35 days; AI jobs 30 days.                           |
| Keys                       | Per-tenant KMS data keys; envelope encryption; 90-day data-key rotation; secrets vault; no provider secrets on desktops.                                                                                                                                                                                  |
| Audit                      | Append-only/WORM, 12 months, tenant export; admin actions and support access recorded.                                                                                                                                                                                                                    |
| Top threats                | Stolen device, refresh-token/app-password theft, webhook spoof, cross-tenant access, malicious attachment, update supply chain, support insider, export abuse. Mitigations are device wipe/encryption, short tokens, signature verification, RLS, virus scan, signed updates, time-bound support access, export audit. |
| App security               | Pen test before launch and annually; SBOM and dependency scanning; critical vulnerability fix ≤7 days, high ≤30 days.                                                                                                                                                                                     |
| Privacy                    | DPA, subprocessor list, data residency, DSAR/export, erasure, 72-hour breach notification, Kenya DPA 2019/GDPR mapping.                                                                                                                                                                                   |
| Support access             | Time-bound, customer-consented, fully audited; no standing production database access.                                                                                                                                                                                                                    |
| Incident response          | Severity levels, on-call, status page, post-incident review.                                                                                                                                                                                                                                              |

This is a baseline, not a certification. SOC 2 readiness is a post-pilot decision.

### 12.6 Billing and entitlements

**2.0 plan metric:** organisation base + connected sendable channels + monthly active conversations; devices are included up to a cap. This preserves "no per-seat" pricing and avoids metering every seat. A WhatsApp phone number counts as one connected channel; the WABA and connection are grouping/onboarding records, not separate billable channels.

**Charge classes (normative).**

| Charge class | Biller / payer | In an IntelluxIQ invoice? | Source of truth |
| --- | --- | --- | --- |
| Meta WhatsApp messaging and calling | Meta bills the customer through the customer's Meta business portfolio payment method, or a BSP bills under a separate BSP-managed arrangement. | **No.** No pass-through, resale, markup, or customer-funds custody; IntelluxIQ is not a party to the Meta/BSP arrangement. | Meta / WhatsApp Manager or BSP |
| IntelluxIQ subscription | IntelluxIQ bills the customer. | **Yes.** `charge_class='subscription'`. | Plan + entitlements |
| Optional IntelluxIQ usage | IntelluxIQ bills the customer only when the customer explicitly enables the overage/add-on. | **Yes**, on a separate `charge_class='usage'`/`'add_on'` invoice. | Usage events + add-on order |

| Item         | 2.0 default                                                                                                                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entitlements | `devices.max`, `channels.max`, `conversations.monthly`, `storage.gb`, `ai.credits`.                                                                                                                                                     |
| Usage events | IntelluxIQ-billable metrics only: `conversation_active` (a thread with at least one inbound/outbound message in the billing month), `channel_connected`, `email_sent`, `storage_gb_month`, `device_active_day`; each has `source_id` and `occurred_at`; monthly aggregation. Meta message/call volumes are **not** `usage_events`. |
| Provider diagnostics | Meta message/call volumes, per-number quality/throughput snapshots, and provider cost estimates. Analytics and reconciliation only; never billed, never imported into `usage_events`, and never an invoice source. |
| Plans        | Starter: 10 devices, 1 WhatsApp + 1 email + 1 social account, 5k conversations/month. Pro: 50 devices, 5 WhatsApp + 5 email + 5 social accounts, 50k conversations/month. Enterprise: custom. Exact prices are commercial.                     |
| Grace        | 14 days past due, then read-only; export remains available; no data deletion during grace.                                                                                                                                              |
| Billing      | Stripe/Paddle plus M-PESA via a supported provider; invoices carry `charge_class`, VAT, dunning (3 retries), cancellation, export. Meta charges are never imported as invoice lines.                                                     |
| Meta billing | Customer-owned. `whatsapp_business_accounts.meta_payment_status` is read-only onboarding state (unknown/missing/pending/added/failed/managed_by_bsp/not_applicable); no Meta card data is stored. A BSP may bill the customer under its own arrangement; that is external to IntelluxIQ. |
| Enforcement  | Device link, channel connect, send, and media upload; soft warning then hard block at the cap.                                                                                                                                          |
| Idempotency  | Billing webhooks and usage events are idempotent; monthly reconciliation report.                                                                                                                                                        |
| Intermediary | Not in 2.0. Combining Meta charges with IntelluxIQ invoices, reselling Meta credit, or holding customer funds requires a new ADR, separate ledger, tax/compliance review, and explicit customer consent.                                  |

AI credits remain a placeholder until the AI module is enabled; the stub consumes none.

### 12.7 Desktop release, update, signing, crash reporting, and telemetry

#### 12.7.1 Versioning and channels

- SemVer `MAJOR.MINOR.PATCH`; separate app, protocol, and schema versions. The cloud enforces a minimum app version.
- Channels: `dev` (internal), `beta` (opt-in orgs), `stable`. Org cohorts control rollout.
- Each release has changelog, migration notes, known issues, and rollback plan. N/N-1 client compatibility is required.

#### 12.7.2 Auto-update

- Check on launch and every 6 hours; manual check in settings.
- Signed manifest fields: `version`, `channel`, `min_os`, `url`, `sha256`, `size`, `signature`, `release_notes`, `mandatory`, `rollout_percent`.
- Client verifies the Ed25519 manifest signature and SHA-256, downloads to a staging path, and installs atomically on restart.
- Staged rollout: 5% → 25% → 50% → 100%; halt automatically on crash/error thresholds.
- Block install during an active call/recording (Phase 3) or while a quote is being finalized; prompt to restart.
- Downgrade is rejected unless a support-signed rollback manifest is issued. A failed launch after update rolls back to the previous binary; database migrations are forward-only, so N-1 binary compatibility is tested.
- Offline/manual update package is available for locked-down networks; it uses the same signature verification.
- The update server is CDN-backed and serves signed manifests only; no arbitrary update URLs.

#### 12.7.3 Code signing

- Windows: Authenticode (EV preferred) with timestamping; MSI/MSIX.
- macOS: Developer ID Application/Installer, hardened runtime, notarization, and stapling; DMG/PKG.
- Linux: GPG-signed packages/AppImage plus checksums; document the repository key.
- Update manifest: Ed25519 key separate from OS signing keys.
- Keys live in an HSM/cloud KMS and are used by CI via short-lived OIDC credentials; no keys on developer laptops; two-person control and annual rotation.
- Installer and updater verify the publisher/signature and show it to the user.

#### 12.7.4 Crash reporting (opt-in)

- Disabled by default; first-run consent explains what is collected. On a crash, a dialog offers "Send report" with a preview.
- Collects stack trace, app/protocol version, OS/device, and redacted breadcrumbs. Never collects message content, contact data, attachments, or passwords.
- Local queue until consent; uploads to self-hosted Sentry or equivalent; 30-day retention; symbol upload in CI.
- Opt-out is respected globally; local logs remain available for support export.

#### 12.7.5 Telemetry (opt-in)

- Disabled by default; user opts in, and an org admin can disable org-wide.
- Events: app start, update result, sync lag, send success/failure, feature usage, crash-free session. No message content, customer identifiers, or keystrokes.
- Pseudonymous install ID; sampling; 90-day retention; export/delete on request; DPA covers the processor.
- Telemetry is not a condition of service. No ad tech or third-party tracking.
- Release health uses only opted-in telemetry; if opt-in is insufficient, canary relies on support reports and staged rollout. This is an accepted 2.0 limitation.

#### 12.7.6 Release process

1. Trunk-based development; release tag from a green commit.
2. CI gates: fmt/clippy, unit, contract, integration, security scan, SBOM, signed artifacts.
3. Staging smoke with provider sandboxes and a seeded tenant.
4. Canary cohort (internal/beta) for 48–72 hours.
5. Staged stable rollout with monitoring; halt/rollback criteria.
6. Release notes, support brief, status page entry.
7. Post-release monitoring for 72 hours.

Hotfixes follow the same gates on a branch from the release tag; emergency changes require a written rollback note and post-incident review.

#### 12.7.7 Failed update and rollback

- Failed download/hash/signature: keep current version, retry with backoff, surface a support code.
- Failed launch after update: automatic rollback to the previous binary; restore the pre-migration database backup if the schema changed.
- Cloud can pause a rollout or mark a version minimum via the manifest; it cannot force a binary downgrade without a signed rollback manifest.

### 12.8 Migration, pilot, and rollback

- **Pre-flight:** inventory legacy orgs, devices, quote numbers, media hashes, and message counts; run a dry-run import; reconcile counts.
- **Import:** Manager data → cloud; devices re-enrolled; quote numbers preserved; media variants generated; event log backfilled to a known `seq`.
- **Cutover:** freeze legacy writes, final delta import, switch webhooks/DNS, re-link devices, verify send/receive on one WhatsApp number and one mailbox.
- **Pilot:** 2–3 orgs, 10–20 devices, one WhatsApp number and one email account each, 4–6 weeks. Exit criteria: ≥99% send success, p95 sync ≤5 s, crash-free ≥99.5%, no P1 security finding, support load within plan.
- **Rollback:** legacy remains read-only for 30 days; restore cloud backup; N-1 client supported; event schemas remain compatible.
- **Hypercare:** 30 days of daily review, then normal support.

No big-bang migration. A pilot org can opt out before cutover without data loss.

### 12.9 Test strategy and release gates

**Test levels:** unit, contract, integration, end-to-end, provider sandbox, load/chaos, security, accessibility (AccessKit/axe), i18n parity/pseudolocale, module-boundary checks.

Key scenarios: offline/reconnect and tombstones; contact/conversation/opportunity separation; opportunity stage history and conversion; deterministic lead-recovery rules; outcome-vs-activity reporting; quote number blocks and tax/FX; WhatsApp 24h/template/media plus connection/WABA/phone lifecycle, revocation/disconnection, and Meta-versus-IntelluxIQ billing separation; cloud-only email threading/Sent/bounces; conversation assignment/read-only; device termination/wipe; idle lock/3 failures; tenant isolation including cross-org composite-FK rejection; update rollback; permission denial.

**CI gates:** build, unit, contract golden files, integration with Postgres/Redis/object storage, security scan, SBOM, accessibility (axe/AccessKit), English/Spanish key parity, signed artifacts.

**Release gates:**

| Gate                 | Requirement                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Code                 | Green CI; no critical/high vulnerabilities.                                                       |
| Contract             | OpenAPI/AsyncAPI/schema diff reviewed; N-1 compatibility.                                         |
| Data                 | Migration tested on a production-sized snapshot; rollback verified.                               |
| Security             | Sensitive changes reviewed; pen-test findings closed or accepted.                                 |
| Accessibility / i18n | Keyboard and screen-reader smoke; axe/AccessKit pass; `en`/`es` key parity and placeholder check. |
| Docs                 | Release notes, admin guide, support runbook updated.                                              |
| Operations           | Dashboards/alerts live; on-call briefed; rollback plan signed off.                                |

Provider tests use the Meta test number, Postmark/SendGrid sandbox, and AT/Twilio test credentials. Load tests run at 2× the §12.2 envelope.

### 12.10 2.0 defaults

These are build-blocking defaults, not permanent policy. Changing one requires an ADR.

| Decision                  | 2.0 default                                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Read visibility           | Org-wide for sales; per-conversation privacy is post-2.0.                                                                                      |
| Deal model                | Opportunity is separate from conversation; quotes require an opportunity; one conversation may link several opportunities.             |
| Sales intelligence        | Deterministic rules and outcome metrics in 2.0; default thresholds configurable per org; AI is not required.                             |
| Performance ranking       | Outcomes only (qualified, quotes, accepted, won, revenue, recovered, follow-ups); message counts are diagnostics.                        |
| Supervisor whispers       | Team-visible in 2.0; manager-only store is post-2.0.                                                                                     |
| Unlock credential         | Device-local password; account-password unlock is not in 2.0.                                                                            |
| Pricing metric            | Org base + connected sendable channels + monthly active conversations; devices included up to cap.                                      |
| Data region               | Single region selected at deployment; 2.0 pilot uses EU (Frankfurt) or the nearest supported region; Kenya/Africa region when available. |
| E2E encryption            | Not in 2.0; cloud is a trusted processor, documented in the DPA.                                                                         |
| Voice                     | Phase 3; no native calls in 2.0.                                                                                                         |
| Catalog/brand editing     | Manager desktop; web admin is post-2.0.                                                                                                  |
| Quote numbers             | Org-wide sequence plus offline blocks; no `{BRANCH}` in 2.0.                                                                             |
| Email protocols           | Cloud-only. Provider API first (Postmark/SendGrid); direct SMTP/IMAP as cloud fallback; desktop has no SMTP/IMAP code, sockets, or credentials. |
| Tenant keys               | Every tenant table is keyed `(org_id, <entity>_id)`; every tenant FK is `(org_id, parent_id)`; only `orgs`, `users`, and `plans` are global. |
| WhatsApp onboarding       | Direct Embedded Signup v4 self-serve first; BSP manual/embedded only as fallback; no single-BSP dependency.                                  |
| WhatsApp account model    | Connection → WABA → phone number; WABA owns templates/token/permissions/webhook/status; phone number owns registration/quality/throughput/calling and is the sendable channel. |
| WhatsApp billing          | Meta messaging/calling charges are paid by the customer to Meta (or through its BSP billing arrangement); IntelluxIQ subscription and optional usage are invoiced separately; no pass-through or billing intermediary. |
| Framework pinning         | Exact `gpui-kit`/`gpui-fast` versions per release; quarterly upgrade window.                                                             |
| Sessions                  | 15-minute access token; 7-day offline lease.                                                                                             |
| Offline termination       | Best-effort wipe plus MDM guidance; no stricter lease in 2.0.                                                                            |
| User removal              | Retain audit 12 months; unassign threads to the manager queue.                                                                           |
| Local-wipe identity       | Keep minimal device identity/wipe receipt; re-link rotates keys.                                                                         |
| Manager override          | Manager send on an unassigned conversation auto-assigns it to that manager.                                                              |
| Reassignment timeout      | 4 business hours if the owner is offline and the SLA is breached; manager override.                                                      |
| Idle lock                 | 10-minute default, 60-minute max, 3-attempt wipe.                                                                                        |
| Locales                   | English default; Spanish second; customer content per org/contact; regional Spanish variant TBD.                                         |
| Active call               | Idle timer pauses until the call ends (Phase 3).                                                                                         |
| Forgotten unlock password | No recovery; terminate and re-link.                                                                                                      |

The remaining validation items in §10.2 are post-2.0 or launch-gate decisions; they do not block the 2.0 build. Legal/commercial sign-off is still required for pricing, data region, and the DPA; these defaults unblock engineering, not the contract.

## 13. Audio Handling

Audio handling is split into two scopes: recorded voice notes and audio attachments in 2.0, and real-time call audio in Phase 3. They share an audio service but have different quality and latency requirements.

### 13.1 Scope

- **2.0:** record and play WhatsApp voice notes; play inbound audio attachments (OGG/Opus, AAC/M4A, MP3, AMR, WAV); waveform, duration, pause/resume; upload as `wa_audio`.
- **Phase 3:** real-time call audio for WhatsApp Calling, Africa's Talking, and Twilio; echo cancellation, jitter buffer, DTMF, hold/transfer, dual-channel recording.
- **Post-2.0:** transcription, diarization, and AI call analysis. These are not required for 2.0.

### 13.2 Architecture

- A dedicated audio service, not the UI thread, owns capture, playback, device enumeration, and codec work. The UI receives level/waveform/state events.
- `cpal` for device I/O; internal format 48 kHz, mono, `f32`; `rubato` for resampling; `opus` for encode/decode; `symphonia` (or FFmpeg for AMR) for decoding.
- Bounded ring buffers and backpressure; a slow UI or disk write must not block audio. Audio errors are isolated and logged without crashing the app.
- Voice-note chain: input → gain/noise suppression → Opus encode → OGG mux. Playback chain: demux/decode → resample → output.
- Call chain (Phase 3): capture → AEC/NS/AGC → Opus/G.711 → RTP; receive → jitter buffer → decode → output. `str0m` provides the WebRTC transport, not the audio pipeline.

### 13.3 Voice notes (2.0)

- Record OGG/Opus, mono, 48 kHz, 24–32 kbps VBR; max 16 MB (WhatsApp audio limit). Show duration and waveform; pause/resume; cancel discards the temp file.
- Microphone permission is requested on first use; a visible recording indicator is mandatory; recording stops when the app is locked, terminated, or the device is unplugged unexpectedly.
- Upload as the `wa_audio` media variant; cloud revalidates size/format; WhatsApp egress uses the audio message type. A failed upload leaves the note as a retryable draft.
- Cloud normalization: validate OGG/Opus (mono, 48 kHz, ≤16 MB); transcode other accepted audio formats to OGG/Opus; cache `wa_audio`; reuse a `media_id` per number while unexpired.
- Playback decodes OGG/Opus, AAC/M4A, MP3, AMR, and WAV; supports seek/speed; caches the decoded/streamed file; does not auto-download uncached audio.
- Inbound WhatsApp audio is downloaded on demand, size-checked, and attached to the message timeline. The original is preserved; a normalized variant is generated only if needed.

### 13.4 Call audio (Phase 3)

- Opus at 48 kHz, 20 ms frames; G.711 (PCMA/PCMU) transcoding for PSTN/SIP; DTMF via RFC 4733 or SIP INFO as the provider requires.
- Adaptive jitter buffer 40–80 ms; packet-loss concealment, comfort noise, VAD; AEC/NS/AGC tuned for headsets and speakerphone.
- TURN is required for restrictive NATs; the cloud does not relay RTP unless a media gateway is deliberately deployed.
- Mute, hold, warm transfer, and dual-channel recording are provider/desktop features; recording requires consent/disclosure and uploads as `call_recording`.
- Target glass-to-glass ≤150 ms on a LAN/headset; 120 ms is not a mobile-network promise.

### 13.5 Devices, permissions, and privacy

- Input/output device selection with OS default, hot-plug, and fallback if the selected device disappears.
- Test tone and input level meter in settings; warn on Bluetooth latency or missing microphone.
- No background or silent recording. The OS microphone indicator, app indicator, and an explicit stop control are always available.
- Audio is not uploaded to the cloud unless the user sends the voice note, starts a recorded call (call media goes to the provider, not the cloud), or explicitly opts into transcription.

### 13.6 Storage, codecs, and retention

- Media variants: `wa_audio` for WhatsApp voice notes; `call_recording` for Phase 3. Both are encrypted at rest and served by signed URL.
- Metadata: duration, codec, sample rate, channels, size, waveform peaks. Original files are preserved for audit where policy allows.
- Retention follows the org policy; default 24 months for message audio, 90 days for call recordings (Phase 3). Local cache is wiped on termination/idle wipe.
- Virus scanning is applied to uploaded files; audio decoding is sandboxed and size/duration-capped.

### 13.7 Failure handling

| Failure                                   | Behavior                                                          |
| ----------------------------------------- | ----------------------------------------------------------------- |
| Microphone permission denied              | Explain and link to OS settings; disable recording until granted. |
| No input/output device                    | Show a device error; fall back to OS default if available.        |
| Device removed/hot-unplugged              | Stop capture, keep the partial file, notify, allow retry.         |
| Unsupported codec                         | Offer conversion or reject with the supported list.               |
| File >16 MB                               | Block send; offer trim/compress.                                  |
| Upload failure                            | Keep local draft; retry with backoff; no duplicate message.       |
| Recording interrupted by lock/termination | Stop and discard or keep a clearly marked draft per policy.       |
| Decode/playback error                     | Show a non-blocking error; preserve the original file.            |

### 13.8 Tests and acceptance

- Record/play 5 s, 60 s, and 15 min notes; verify format, size, duration, waveform, pause/resume, cancel, and retry.
- Permission denial, device hot-plug, Bluetooth/headset, 44.1/48 kHz sources, mono/stereo input, and no-device fallback.
- Decode OGG/Opus, AAC/M4A, MP3, AMR, and WAV; verify seek, speed, and memory ceiling.
- Automated signal tests (sine sweep, clipping check, duration/size assertions) plus a manual device matrix.
- Phase 3: latency, echo, packet loss, jitter, DTMF, hold/transfer, recording consent, and dual-channel output.

### 13.9 Deferred

- Transcription/diarization, AI audio analysis, WhatsApp call recording (Meta does not expose it), and video are not 2.0 features. The audio service and media variants are designed so those can be added without reworking capture/playback.

## 14. Web Console, Accessibility, Internationalization, and Modularity

### 14.1 Web console and public API

- `app.intelluxiq.com` is a **Next.js App Router** application (React/TypeScript) on Bun for the manager console only: orgs, users/roles, devices/sessions, subscription/billing, channels, templates, audit, support, pipeline, and intelligence. It has no inbox, composer, catalog editor, or quote builder.
- The public HTTP API is a **single `/api/*` surface** routed to a **Hono** service. Hono serves `/v1/*`; public URLs are `/api/v1/*`. Browser calls may use a thin Next.js route handler or an edge rewrite; desktop and long-lived traffic use the same `/api` base.
- **Pure TypeScript cloud:** Hono/Bun public API plus Bun sync/event, provider-egress, and media/audio workers. Rust is the desktop client only; there is no Rust cloud service.
- Hono owns the web API: auth/session, orgs/users/roles, devices/sessions/termination, subscription/billing, channel onboarding, template CRUD, audit, support, and signed media URLs. The Bun provider gateway owns outbound sends. Hono authorizes/enqueues and does not duplicate sync/egress rules.
- Runtime: pinned **Bun 1.x on Linux containers**, not Node and not a serverless edge function. Services use Postgres/RLS, Redis (pub/sub and cache), S3, a Postgres-backed `outbound_jobs` queue (`FOR UPDATE SKIP LOCKED`), and `Bun.serve` WebSockets; avoid Node-only native addons and BullMQ unless verified on Bun.
- Public routes: `/api/*` → Hono; `/sync` → Bun WSS; media → signed object-storage URLs; everything else → Next.js. There is one public origin/path surface; the Bun sync plane is not separately exposed.
- Auth: web session cookie (Auth.js/OIDC) for the console; device-code plus short-lived tokens for desktop; Hono validates and forwards tenant/user claims to the Bun services. Next.js server components call Hono over HTTP and never query Postgres directly.
- Monorepo: Bun workspaces + Turborepo with `apps/desktop` (a Bun wrapper around Cargo), `apps/web` (Next.js), `apps/api` (Hono), `apps/sync`, `apps/worker`, and packages for `contracts` (Zod/OpenAPI), `i18n`, `auth`, and `db`.
- Deployment: separate Bun containers for web, API, and worker behind an edge proxy; health checks, graceful shutdown, Postgres migrations before rollout, and rolling deploys. No serverless/edge runtime for the API or WSS.
- Contracts: `@hono/zod-openapi` generates OpenAPI; a TypeScript client serves the web app, and a generated Rust client serves the desktop. No hand-written duplicate DTOs.
- **Next.js on Bun is the compatibility risk:** spike `next build`/`next start`, middleware, image optimization, Auth.js, and server components on the pinned Bun version before committing. If blocked, use a static export served by Bun or a documented exception; do not silently run Node.
- **Email on Bun:** prefer provider HTTP APIs (Postmark/SendGrid) for outbound/inbound. Direct SMTP/IMAP (`nodemailer`/`imapflow` or Bun TCP/TLS) requires a compatibility spike; no Node sidecar without an ADR.
- **Media on Bun:** FFmpeg child processes and pure-JS S3/Postgres clients; no native addons.
- If a Next.js route handler is used for `/api`, cap body size/time and never stream media or WebSocket through it; the edge rewrite/reverse proxy is the preferred path.

### 14.2 Accessibility

Accessibility is a release gate for every feature, not a later pass. Target **WCAG 2.2 AA** on desktop and web.

**Desktop**

- Use `gpui-kit` AccessKit roles, names, states, relationships, and actions; every custom-painted control gets an explicit accessible role/name/state.
- Every action has a keyboard-only path; focus is always visible and restored after dialogs/overlays; dialogs trap focus and return it on close.
- Virtualized lists expose row/count semantics; new messages, send status, errors, and toasts use live announcements.
- No color-only status; text contrast ≥4.5:1; 200% text; reduced-motion support; shortcut help.
- Screen-reader smoke on NVDA and JAWS (Windows), VoiceOver (macOS), and Orca (Linux) before each release.

**Web**

- Semantic HTML, shadcn/ui (Radix) primitives, visible focus, skip links, labeled forms, errors tied to fields, accessible dialogs/tables, and live regions for toasts.
- `axe-core` runs in Playwright E2E and blocks the build on new serious violations.
- Keyboard-only smoke, 200% zoom, high-contrast mode, and reduced motion are release checks.

Translations must not truncate accessible names or announcements; Spanish labels and screen-reader text are part of the translation scope.

### 14.3 Internationalization

**Locales**

- **English (`en`) is the default; Spanish (`es`) is the second locale.** English is the source language. A regional Spanish variant (`es-ES` vs `es-419`) is a later decision.
- Two layers: **app UI locale** (`users.locale`) and **customer content locale** (`orgs.default_locale`, `contacts.locale`, `threads.locale`, `quote_templates.locale`, `quotations.locale`, `wa_templates.language`).
- A user can switch language in desktop settings and the web profile; the choice is persisted. OS locale is a suggestion only; default remains English.
- Missing Spanish keys fall back to English and log a development warning; there are no blank labels.

**Implementation**

- Desktop: Fluent `.ftl` with plural/gender/selection support. Web uses `next-intl` (ICU); both are generated from one shared key manifest so translators keep parity.
- Web: `next-intl` (ICU). Both share semantic keys; CI checks key parity and placeholder consistency.
- No hardcoded user-facing strings; lint rules reject them. Pseudolocalization is used to catch layout/truncation issues.
- Dates, numbers, currency, lists, and plurals use ICU/Intl, with org timezone/currency; no string concatenation. Spanish decimal separators are tested.
- RTL-ready layout, though `en`/`es` are LTR.

**Customer-facing content**

- Quote PDFs, email bodies/templates, and WhatsApp templates resolve their language from the quote/thread/contact, then org default.
- PDF fonts support Spanish accents; payment terms, tax labels, and legal text are translated and reviewed.
- Translation workflow: English source, translator review, versioned files; no machine-only legal/tax/payment text.

### 14.4 Monorepo structure and feature modules

The repo is a polyglot monorepo: a **Cargo workspace** for the Rust desktop app, **Bun workspaces** for the TypeScript cloud, and a thin `justfile` for cross-language tasks. Turborepo handles TS task caching; Cargo handles Rust. There is no Node runtime in production.

```text
/
├── apps/
│   ├── desktop/                 # Rust binary: gpui-kit shell
│   ├── web/                     # Next.js manager console (Bun)
│   ├── api/                     # Hono HTTP API (/api/v1)
│   ├── sync/                    # Bun WSS / event stream (/sync)
│   └── worker/                  # Bun workers: egress, media, email
├── crates/
│   ├── app/                     # desktop composition root
│   ├── ui/                      # gpui design system + AccessKit
│   ├── platform/                # OS: menus, keychain, files, windows
│   ├── domain/                  # shared Rust domain types
│   ├── sync/                    # desktop sync client
│   ├── store/                   # SQLCipher SQLite + FTS5
│   ├── contracts/               # generated API/event types
│   ├── i18n/                    # Fluent loader + generated .ftl
│   ├── a11y/                    # accessibility helpers
│   ├── telemetry/
│   ├── audio/
│   ├── testkit/
│   └── features/
│       ├── inbox/
│       ├── whatsapp/
│       ├── email/
│       ├── catalog/
│       ├── quotes/
│       ├── pipeline/
│       ├── intelligence/
│       ├── settings/
│       └── security/
├── packages/
│   ├── contracts/               # Zod HTTP/event schemas + OpenAPI source
│   ├── db/                      # Drizzle schema + migrations
│   ├── auth/                    # sessions, device tokens, RBAC
│   ├── events/                  # event log/seq/cursor helpers
│   ├── providers/               # WhatsApp/Meta/TikTok/email/voice adapters
│   ├── media/                   # S3, FFmpeg, variants
│   ├── jobs/                    # outbound queue types/handlers
│   ├── features/                # TS domain modules
│   │   ├── identity/
│   │   ├── billing/
│   │   ├── channels/
│   │   ├── templates/
│   │   ├── threads/
│   │   ├── opportunities/
│   │   ├── intelligence/
│   │   ├── media/
│   │   └── audit/
│   ├── i18n/                    # en/es messages, key manifest, FTL export
│   ├── telemetry/
│   ├── config/                  # tsconfig, Oxc, Tailwind
│   └── testkit/                 # fixtures, provider simulators, Playwright/axe
├── infra/
│   ├── compose.yml              # Postgres, Redis, MinIO, Mailpit
│   ├── docker/                  # Bun/Next images
│   ├── caddy/                   # /api, /sync routing
│   └── deploy/                  # Fly/Render manifests
├── docs/
│   ├── adr/
│   ├── architecture/
│   ├── features/
│   └── runbooks/
├── scripts/
│   ├── codegen.ts               # OpenAPI/JSON Schema → TS + Rust
│   ├── i18n.ts                  # key parity + FTL export
│   ├── new-feature.ts           # scaffold Rust + TS + i18n + tests
│   ├── check-boundaries.ts
│   └── db.ts
├── .github/workflows/
├── Cargo.toml
├── rust-toolchain.toml
├── package.json
├── bun.lock
├── turbo.json
├── justfile
└── README.md
```

**Why this shape**

- **Apps are deployables, packages are libraries, crates are Rust libraries.** Only `apps/desktop` produces a Rust binary.
- **API, sync, and worker are separate apps** because they scale differently: HTTP, long-lived WSS, and background jobs. At first, `api` and `sync` may run in one Bun process; the split remains possible.
- **`packages/features/*` are TS domain modules.** Hono routes and worker jobs are thin adapters; the domain rules live in the feature package.
- **`crates/features/*` mirror the same feature boundaries on the desktop.** `crates/app` composes them.
- **`packages/contracts` is canonical.** Zod HTTP/event schemas generate OpenAPI and JSON Schema; generated TS and Rust clients are checked in, so there are no duplicate DTOs.
- **`packages/db` owns schema and migrations.** Feature repositories are the only code that touches their tables; Next.js never touches Postgres.
- **Web UI is shadcn/ui in `apps/web/src/components/ui`; `crates/ui` is desktop-only.** There is no custom design-system package; app screens compose shadcn components.
- **Desktop email is UI/composition only.** `crates/features/email` must not depend on `lettre`, `async-imap`, `mail-parser`, or any SMTP/IMAP crate; cloud workers own all email protocol I/O.
- **`packages/testkit` and `crates/testkit`** hold fixtures, provider simulators, Playwright/axe helpers, and headless AccessKit tests.

**Tooling**

- Root `package.json` workspaces: `apps/desktop`, `apps/web`, `apps/api`, `apps/sync`, `apps/worker`, `packages/*`, `packages/features/*`; install with `bun install` and commit `bun.lock`. `apps/desktop` is a Bun wrapper around Cargo, not a TypeScript app.
- Root `Cargo.toml` workspace: `apps/desktop`, `crates/*`, `crates/features/*`; pin the toolchain in `rust-toolchain.toml`.
- `turbo.json` for TS tasks; `justfile` for `just dev`, `just test`, `just check`, `just codegen`, `just db`, and desktop commands.
- Desktop commands are Bun-first: `bun run desktop`, `desktop:build`, `desktop:test`, and `desktop:check`; root `bun run build` and `bun run test` include the desktop through Turbo. `scripts/desktop.ts` wraps Cargo and pins `CARGO_TARGET_DIR`.
- `oxlint`/`oxfmt` for TS lint/format; `dependency-cruiser`/`eslint-plugin-boundaries` for module boundaries; `cargo fmt`, `clippy`, `nextest`, and `deny` for Rust.
- `mise.toml` pins Bun, Rust, and FFmpeg. Playwright/axe may run in CI on Bun or a CI-only Node tool; production remains Bun.
- Local `infra/compose.yml`: Postgres, Redis, MinIO, and Mailpit. Dockerfiles use `oven/bun` for the cloud apps and the Rust toolchain for desktop CI.
- CI workflows: TS build/test/boundary, Rust matrix (Windows/macOS/Linux), contract drift, i18n key parity, axe/AccessKit checks, and signed desktop artifacts.

**Feature module contract**

Rust:

```text
crates/features/quotes/
├── Cargo.toml
├── src/lib.rs          # public API only
├── src/feature.rs      # register commands, events, views, settings
├── src/domain.rs
├── src/commands.rs
├── src/events.rs
├── src/ui/mod.rs
├── src/i18n.rs
├── src/a11y.rs
└── tests/
```

TypeScript:

```text
packages/features/quotes/
├── package.json
├── src/index.ts        # public API only
├── src/service.ts
├── src/repository.ts
├── src/events.ts
└── test/

apps/api/src/modules/quotes/routes.ts
apps/worker/src/jobs/quotes/*.ts
apps/web/src/features/quotes/*.tsx
```

- Feature packages expose only their `index.ts`/`lib.rs` public surface; internals are private.
- A feature declares its permissions, commands/events, feature flag, i18n namespace, accessibility labels, and telemetry events.
- `scripts/new-feature.ts` scaffolds both sides, the API route, worker job, `en`/`es` keys, a11y labels, tests, docs, and a feature flag.
- Register the Rust feature in `crates/app` and the TS feature in `apps/api`/`apps/worker`; no hidden global wiring.

**Adding a feature**

1. Add the contract/command/event and permissions.
2. Add the migration, domain/service, and repository.
3. Add the Rust feature crate and/or TS feature package; wire API/worker adapters.
4. Add `en`/`es` keys and accessibility labels.
5. Add unit, contract, UI, accessibility, and i18n tests.
6. Add the telemetry event and feature flag.
7. Update docs/spec/open decisions.

**Boundaries**

- Features may depend on `contracts`, `db`, `auth`, `events`, `providers`, `media`, `ui`/`platform`, and their own internals; they may not import another feature.
- Apps may depend on packages/features; packages/features may not depend on apps.
- Next.js imports `ui`, `contracts`, and `i18n` only; it never imports cloud feature packages or Postgres.
- API modules never call providers directly; they enqueue into `jobs`/`providers` for the worker.
- `scripts/check-boundaries.ts` plus `dependency-cruiser` and a Rust `xtask` fail CI on violations.

**Code generation and i18n**

- `packages/contracts` is the source of truth: Zod HTTP schemas → OpenAPI 3.1; Zod/JSON Schema events → generated TS and Rust types.
- Rust API clients are generated with `progenitor`; event types with `typify` (or an equivalent checked-in generator).
- `packages/i18n/messages/en.json` and `es.json` are the source; `scripts/i18n.ts` checks parity and exports `crates/i18n/locales/en.ftl` and `es.ftl`.
- `bun run codegen --check` and `bun run i18n:check` are required CI gates.

**Runtime mapping**

| App            | Runtime                     | Responsibility                |
| -------------- | --------------------------- | ----------------------------- |
| `apps/web`     | Bun + Next.js               | Manager console               |
| `apps/api`     | Bun + Hono                  | Public `/api/v1`              |
| `apps/sync`    | Bun                         | `/sync` WSS and event stream  |
| `apps/worker`  | Bun                         | Provider egress, media, email |
| `apps/desktop` | Bun wrapper + Rust/gpui-kit | Desktop CRM                   |

### 14.5 Acceptance and release gates

- Web: Playwright E2E plus axe-core on every console page; keyboard-only smoke; 200% zoom.
- Desktop: `gpui-kit` headless windows plus AccessKit tree assertions; keyboard-only flow; screen-reader smoke; pseudolocale layout.
- i18n: CI fails on missing keys, placeholder mismatch, or untranslated user-facing strings in `en`/`es`.
- Modularity: a dependency-boundary test fails on cross-feature internals; the feature checklist is reviewed.
- Accessibility, i18n parity, and module boundaries are required for each feature, not deferred to the end.

## Appendix A — WhatsApp error codes (common)

| Code   | Meaning                     | Action                                |
| ------ | --------------------------- | ------------------------------------- |
| 131026 | Message undeliverable       | Check number, opt-in, channel status. |
| 131047 | Re-engagement required      | Outside 24h; send approved template.  |
| 131051 | Unsupported message type    | Check payload/media.                  |
| 131053 | Media upload error          | Check format/size/codec; retry.       |
| 131056 | Pair rate limit             | Backoff.                              |
| 132000 | Parameter count mismatch    | Fix template variables.               |
| 132001 | Template not found          | Sync templates; check name/language.  |
| 132005 | Translated text mismatch    | Fix localization.                     |
| 132007 | Template paused/disabled    | Use another template; appeal.         |
| 132012 | Parameter format mismatch   | Check type/length.                    |
| 132015 | Template paused for quality | Review content; use another.          |
| 132016 | Template disabled           | Contact Meta; replace.                |
| 132068 | Flood/throughput            | Backoff; spread sends.                |
| 132069 | Rate limit hit              | Backoff.                              |
| 133010 | Phone not registered        | Verify onboarding.                    |
| 133016 | Rate limit                  | Backoff.                              |

Verify against current Meta documentation; map codes to actionable UI messages.

## Appendix B — Quoting examples

**Tax-inclusive:** price KES 1,160.00 incl. 16%. `tax = round(116000 * 1600 / 11600) = 16000`; net = 100000; total = 116000. Display: KES 1,160.00 incl. VAT KES 160.00.

**FX:** base USD 100.00, `fx_rate_micros = 129_500_000` (129.50 KES/USD). Quote price = `round(10000 * 129_500_000 / 1_000_000) = 1_295_000` minor = KES 12,950.00. Store base total USD 100.00 and the rate.

**Offline number block:** block `QT-2026-0400..0449` (50 numbers); device consumes 0412; reports on reconnect; remaining 49 expire; next block starts at 0450. Gaps are acceptable and audited.

## Appendix C — Email status matrix

| From      | To          | Trigger                               |
| --------- | ----------- | ------------------------------------- |
| `queued`  | `sending`   | Egress picks job.                     |
| `sending` | `sent`      | Provider accepted.                    |
| `sending` | `failed`    | Permanent provider error.             |
| `sent`    | `delivered` | Provider delivery webhook (optional). |
| `sent`    | `bounced`   | DSN hard/soft.                        |
| `failed`  | `queued`    | Retryable error.                      |
| `draft`   | `queued`    | User sends.                           |

`sent_folder_synced` is independent: true only after cloud IMAP APPEND or provider Sent sync succeeds.

## Appendix D — Messaging channel onboarding (normative)

This appendix defines Phase 1.5 social messaging. WhatsApp Cloud API remains
part of Phase 1; Meta Messenger/Instagram and TikTok are provider-gated. Provider
approval, app review, business verification, and regional eligibility are
external prerequisites, not bypassed by this specification. TikTok access is
limited and must be presented as unavailable where the account does not qualify.

### D.1 Channel matrix

WhatsApp is hierarchical: a channel **connection** contains one or more **WABAs**, and each WABA contains one or more **phone numbers**. The sendable asset in the matrix is the phone number; the WABA owns templates, token, permissions, webhook subscription, and account status. `channel_accounts` is only the stable send target and is 1:1 with the WhatsApp phone number (D.7).

| Channel | Onboarding | Sendable asset | Token | Meta/TikTok webhook | Main gate |
| --- | --- | --- | --- | --- | --- |
| WhatsApp Cloud API | Meta Embedded Signup v4, Tech Provider/Tech Partner path; BSP fallback only | Business phone number (`phone_number_id`) inside a WABA | Business Integration System User access token, vaulted per WABA | Meta object `whatsapp_business_account` | App Review/Advanced Access, business verification, Tech Provider status, customer Meta payment method or BSP-managed billing, templates/24h |
| Facebook Messenger | Facebook Login for Business; Page selection | Facebook Page (`page_id`) | Page access token | Meta object `page` | App Review/Advanced Access, Business Verification, Page `MESSAGING`/`MODERATE` tasks |
| Instagram (preferred) | Business Login for Instagram; Instagram professional account | Instagram professional account (`ig_user_id`) | Instagram User access token, 60 days, refreshable | Meta object `instagram` | Business app, App Review/Advanced Access, connected-tools toggle |
| Instagram (Page fallback) | Facebook Login for Business; linked Page and Instagram account | Instagram account linked to a Page | Page access token | Meta object `instagram` | Page-linked account, permissions, App Review, Page tasks |
| TikTok Business Messaging | TikTok OAuth after developer/app/account approval | TikTok Business account (`open_id`) | TikTok access + refresh token | TikTok app callback | Approved developer app, Business Messaging access, data-security/privacy review, USDS where applicable, account/region eligibility |

### D.2 WhatsApp Embedded Signup v4

**Status and prerequisites.** Implement Embedded Signup **v4 only**. Embedded
Signup v2 and v3 were deprecated on 15 October 2026 and must not be used. The
direct Tech Provider/Tech Partner path is the default. A BSP/Solution Partner is
an optional fallback for a customer who cannot complete the direct path or who
needs a different commercial/billing arrangement; it is not a prerequisite for
the core WhatsApp integration and must never become a single point of dependency.
The Meta app needs Advanced Access/App Review for the WhatsApp permissions,
business verification, a Facebook Login for Business configuration, HTTPS allowed
domains/redirect URIs, and the Meta JavaScript SDK loaded only in the web
console. The app must already subscribe to the `account_update` webhook.

**Account hierarchy.** WhatsApp is stored as three explicit levels (normative;
see D.7 and §7.1):

```text
whatsapp_connections
  └── whatsapp_business_accounts   (WABA)
        └── whatsapp_phone_numbers (phone number; 1:1 channel_accounts send target)
```

The connection is the onboarding/audit anchor: it records the Meta business
portfolio ID, method, completion/failure, granted permissions, and
revocation/disconnection. The WABA owns the token reference, permissions,
templates, webhook subscription, account/review status, and the Meta billing
relationship. The phone number owns registration, verification, quality,
messaging limit, throughput, calling capability, and is the sendable channel.
One connection may contain multiple WABAs; one WABA may contain multiple phone
numbers. A WABA is never a sendable asset and is never stored as
`channel_accounts.parent_external_id`.

**Console flow.**

1. Manager/admin chooses **Connect WhatsApp** in Channels.
2. The web console loads the Meta JavaScript SDK and calls `FB.login` with the
   Embedded Signup `config_id`, `response_type=code`, and
   `override_default_response_type=true`; no password is collected by the
   console.
3. The Meta flow returns a one-time token code through the login callback and a
   `WA_EMBEDDED_SIGNUP` session message with `event=FINISH`, `waba_id` (or
   `waba_ids`), `phone_number_id`, and `business_id`. `CANCEL` and `ERROR` events
   map to actionable states; they are not successful onboarding.
4. Send both the code and asset IDs to the web API immediately. The code has a
   five-minute TTL. Never exchange it from the browser and never log the code.
5. Create a `whatsapp_connections` row with
   `onboarding_method='embedded_signup_v4'`, `onboarding_state='code_received'`,
   `meta_business_portfolio_id`, `granted_permissions`, and `created_by`; then
   exchange `GET /oauth/access_token` with the app ID, app secret, and code for a
   customer-scoped business integration system user access token.
6. Create one `whatsapp_business_accounts` row per returned WABA with
   `meta_waba_id`, the vault `token_ref`, `token_type`, token expiry/refresh
   metadata where provided, `effective_permissions`, and
   `webhook_status='pending'`; set onboarding state `code_exchanged`.
   The raw token is never written to Postgres.
7. Verify that each WABA and phone number belongs to the returned customer
   business; reject asset-ID mismatches and duplicate WABAs/phone numbers. Create
   or reuse `whatsapp_phone_numbers` rows with `meta_phone_number_id`,
   display/E.164, registration, and verification state, plus the 1:1
   `channel_accounts` send target. Set state `assets_verified`.
8. Subscribe the app to each WABA with
   `POST /{WABA_ID}/subscribed_apps` using the business token; store
   `webhook_status`, `webhook_fields`, and `webhook_subscribed_at`; set state
   `waba_subscribed`.
9. Register each phone number with `POST /{phone_number_id}/register` and the
   6-digit PIN established during onboarding. If Meta did not establish one, the
   console asks the customer to set it. The PIN is a secret: send it server-side,
   never log it, never store it in the database, and do not return it to the
   desktop. Update `registration_status` and set state `provisioning`.
10. Read `account_update` and Graph status. Update
    `meta_payment_status`, `review_status`, and phone quality/throughput/calling
    fields. Show `pending_review` for business verification/display-name
    approval and `pending_provider_billing` until the customer adds a Meta
    payment method or a BSP-managed billing arrangement is confirmed.
11. Move the connection, WABA, phone number, and send target to `ready` only when
    the token is valid, the WABA webhook is verified, the number is registered,
    and (Meta has the customer's payment method or the BSP-managed billing
    arrangement is confirmed). Set `onboarding_state='completed'` and
    `onboarding_completed_at`, then emit `channel.connection_updated` and
    `channel.account_updated`.
12. If Meta still requires an action, keep the pending state and reason; no send.
    Do not mark onboarding complete on the presence of a token alone.

**Lifecycle and recovery.**

- The durable onboarding record is `whatsapp_connections`; transient OAuth state
  and the one-time code are short-lived and are never synced to the desktop.
  Record `onboarding_started_at`, `onboarding_completed_at`,
  `onboarding_error_code`, and `onboarding_error_detail`. Each attempt is
  audit-logged; a failed/cancelled retry does not overwrite an existing completed
  hierarchy.
- Token revocation, permission loss, an `account_update` restriction/disable, or
  repeated auth errors move the connection/WABA/phone to `reauth_required` or
  `restricted`, record `revoked_at`, and emit `channel.connection_revoked` plus
  `channel.account_updated`. No send while in that state.
- A manager disconnect sets `disconnected_at`, revokes the token with Meta where
  possible, marks the hierarchy `disconnected`, and emits
  `channel.connection_disconnected`. Records are soft-deleted/retained for audit;
  never hard-delete, and never duplicate on reconnect.
- Rerunning onboarding for the same `meta_waba_id`/`meta_phone_number_id` reuses
  the existing rows and replaces the vault `token_ref` atomically. A new number
  adds a phone row and its 1:1 send target; a WABA-only change does not create a
  phone row.
- A BSP fallback uses the same records with
  `onboarding_method='bsp_manual'` or `'bsp_embedded_signup'` and an optional
  `bsp_reference`. It is an adapter, not a schema fork. The direct path must keep
  working if the BSP is unavailable.

**Operational rules.**

- The customer completes business verification, display-name approval, and the
  Meta payment method (or BSP-managed billing arrangement) in the relevant
  surface; the console shows the pending reason and a link to WhatsApp Manager
  rather than pretending setup is complete.
- Use the business token for Cloud API calls and include `appsecret_proof` on
  Graph requests. Never expose the token to the browser/desktop.
- Existing WhatsApp rules (§2–§3) still apply: opt-in, 24-hour customer service
  window, approved templates outside the window, media limits, quality, and
  messaging limits.
- Templates are WABA-scoped (§2). Number-scoped templates are not implemented in
  2.0; do not add a `phone_number_id` scope to `wa_templates`.
- If the business has multiple WABAs, the v4 flow can return `waba_ids`; create
  one WABA row per selected WABA and one phone row per selected number. There is
  exactly one `channel_accounts` send target per phone number, never per WABA.
- **Customer-owned billing.** Meta messaging/calling charges are paid by the
  customer to Meta, or by the BSP under its own billing arrangement. `pending_provider_billing` means the Meta payment method or
  BSP-managed billing confirmation is still pending; it does not mean the
  customer owes IntelluxIQ.
  IntelluxIQ subscription and optional usage are separate (§9.5, §12.6).
- **BSP fallback is optional.** A BSP may supply asset IDs/tokens or handle a
  customer-specific billing arrangement (recorded as `meta_payment_status=managed_by_bsp`
  when the BSP is the Meta billing intermediary), but the core WhatsApp integration must
  not depend on one BSP. Validate ownership, duplicate, token, webhook, and
  number-registration rules identically for BSP onboarding. BSP billing is
  external and never commingled with IntelluxIQ invoices.

### D.3 Facebook Messenger

**Prerequisites.** A Meta app with the Messenger use case, a Facebook Page, a
Facebook Login for Business configuration, Advanced Access/App Review, and
Business Verification for public use. The person connecting must be able to
perform `MESSAGING` and `MODERATE` tasks on the Page.

**Permissions.** Request `pages_show_list`, `pages_manage_metadata`,
`pages_messaging`, `pages_read_engagement`, and `business_management` through
Facebook Login for Business. Do not use WhatsApp Embedded Signup for Pages.

**Console flow.**

1. Manager/admin chooses **Connect Facebook Page**; the console starts Facebook
   Login for Business with the Page selection configuration.
2. The user grants Page access. The API exchanges the authorization code for a
   user token, upgrades it to a long-lived token, and fetches the selected
   Pages via `/me/accounts`.
3. For each selected Page, obtain the Page access token, verify the required
   tasks/permissions, and create one channel account per Page.
4. Subscribe the Page to messaging fields with
   `POST /{page-id}/subscribed_apps`; store `webhook_status` and the subscribed
   fields. A Page that fails subscription is `error`, not ready.
5. Store the Page token in the vault. A long-lived Page token can be
   non-expiring, but it is invalidated by role/password/permission changes;
   re-run Facebook Login and replace the token without duplicating the account.
6. Activate only after the webhook test and a test message/echo path succeed.

**Messaging rules.** A person must initiate the conversation. The standard
Messenger window is normally 24 hours; a first message after a Click-to-Messenger
or Click-to-Direct ad can open a longer window (currently up to 7 days). Use
message tags/human-agent handling only where Meta policy permits; no unsolicited
broadcasts. Store the Page-scoped ID (PSID) as a scoped contact identity.

### D.4 Instagram

Prefer **Instagram API with Instagram Login** for a new direct connection. Keep
the Page-linked **Messenger API for Instagram** as a fallback when the account is
already managed through a Facebook Page or the direct login path is not
available. Never connect the same Instagram professional account through both
paths.

#### D.4.1 Preferred: Instagram API with Instagram Login

- Requires a Meta business app with the Instagram product, Business Login for
  Instagram configured, an Instagram professional account, and (for accounts
  the app does not own) Advanced Access/App Review.
- Use the Instagram App ID/Secret from the App Dashboard; keep the secret in the cloud secret manager. OAuth scopes: `instagram_business_basic` and
  `instagram_business_manage_messages`. The authorization code is exchanged
  server-side for a short-lived Instagram User token, then for a 60-day
  long-lived token. Refresh before expiry; a token that has not been refreshed
  for 60 days cannot be refreshed and requires reauthentication.
- No Facebook Page is required. The API setup uses `graph.instagram.com` and the
  Instagram account ID; do not mix it with Page-token calls.
- Subscribe Instagram webhooks to the message fields; verify the Meta signature
  and resolve the account by Instagram ID.
- The customer must enable **Connected Tools → Allow Access to Messages** in
  Instagram message controls. Without it, the account can authorize but cannot
  manage messages; show this as a setup blocker.

#### D.4.2 Fallback: Page-linked Instagram Messaging

- Requires a Facebook Page linked to an Instagram professional account, a
  Facebook Login for Business configuration, and Advanced Access/App Review.
- Request `instagram_basic`, `instagram_manage_messages`,
  `pages_manage_metadata`, `pages_show_list`, and `business_management`.
- Obtain the Page access token; use it for Instagram Messaging calls and
  `GET /{page-id}/conversations?platform=instagram`. Subscribe the `instagram`
  webhook object from the Meta app.
- The customer still enables Instagram connected tools. A Page token whose
  permissions are revoked moves the account to `reauth_required`.
- Store the Page-linked account with `parent_external_id=page_id`; the
  Instagram account ID remains the sendable asset identity.

#### D.4.3 Shared rules

- The account must be a professional (Business or Creator) account. Personal
  accounts are not supported.
- A person must initiate the conversation. Apply Meta's standard messaging
  window/tags and Instagram policy; do not assume WhatsApp template semantics.
- Deduplicate by Instagram professional account ID. If both connection paths
  exist, the console shows the active path and offers migration only after
  explicit reauthentication.
- App Review evidence must cover the actual Instagram messaging use case and the
  Page-linked path if it remains enabled.

### D.5 TikTok Business Messaging

**Availability gate.** Do not present TikTok as generally available. Access
requires an approved TikTok developer app, Business Messaging API access,
TikTok's data-security/privacy review, and (for US-related access) the US Data
Security (USDS) review/addendum. The TikTok Business Account must have Advanced Access or be a
Verified Business Account, and direct messages must be open to everyone.
TikTok availability is provider- and region-gated: accounts registered in the
EEA, Switzerland, and the UK are currently outside the supported region set,
and US-related access requires the USDS review/addendum. Re-check eligibility at
onboarding. Gate the UI with the account capability endpoint and show
`restricted`/`unavailable`, not a generic failure.

**Console flow.**

1. Manager/admin chooses **Connect TikTok** and starts TikTok OAuth with the
   approved app's client ID, redirect URI, and state.
2. The customer authorizes the Business Messaging scopes (Direct Messages read
   and write, plus the account-type/capability scopes required by TikTok).
3. Exchange the authorization code at
   `POST /open_api/v1.3/tt_user/oauth2/token/`; store the access token and
   refresh token in the vault. Refresh through
   `/tt_user/oauth2/refresh_token/` before expiry.
4. Read the TikTok account identity/open ID and account type. Call the
   capability endpoint before enabling the channel; reject accounts without
   messaging capability.
5. Register/subscribe the TikTok webhook, verify the `TikTok-Signature` HMAC
   with the app secret over the raw body, and test delivery.
6. Activate only after a real inbound/echo test. A TikTok account with closed
   DMs, no Advanced Access, or an unsupported region stays `restricted` with a
   customer-action message.

**Messaging rules.**

- Outbound is limited to the conversation and capabilities TikTok permits.
  Do not build arbitrary proactive DMs; welcome/follow/comment-to-message
  features are capability-gated and must be independently enabled.
- Store the TikTok open ID as a scoped contact identity; do not merge contacts by
  username or display name.
- Use provider message IDs for idempotency; TikTok webhook retries can repeat.
- The TikTok data-security requirements and retention/consent rules apply to
  message content and media; do not send TikTok data to unapproved processors.

### D.6 App-level webhook routing

Meta and TikTok callbacks are **app-level**, not per-org. The existing
per-org/per-channel webhook paths are not valid for these providers.

- Meta: `GET /v1/webhooks/meta` for the verification challenge and
  `POST /v1/webhooks/meta` for events. Validate `hub.mode`, `hub.verify_token`,
  and return the `hub.challenge` value. If separate Meta apps are used per
  environment, include an app key in the path and resolve its app secret.
- TikTok: `POST /v1/webhooks/tiktok` (or `/v1/webhooks/tiktok/{app_key}`).
- Verify Meta `X-Hub-Signature-256` using the raw payload and app secret. Verify
  TikTok's `TikTok-Signature` HMAC-SHA256 with the app secret and reject stale
  timestamps/replays.
- Resolve `org_id` and the send target from the asset in the payload: WhatsApp
  `phone_number_id` → `whatsapp_phone_numbers` → `channel_account_id`; WABA-level
  WhatsApp events (template status, `account_update`) → `whatsapp_business_accounts`
  → connection. WABA-only events do not create or require a send target. Page ID,
  Instagram ID, and TikTok open ID resolve as before. Never accept an org ID from
  the client or from an unsigned field.
- Meta objects are `whatsapp_business_account`, `page`, and `instagram`;
  TikTok uses its Business Messaging event types. Return `200` within five
  seconds and enqueue the raw event for async parsing. Store the provider
  event/message ID for dedupe; delivery may retry and may be out of order, so
  use provider timestamps when applying messages.
- WhatsApp `account_update` events update connection/WABA/phone lifecycle:
  restriction, disable, revocation, permission loss, and disconnection. Record
  `revoked_at`/`disconnected_at` and emit `channel.connection_revoked` or
  `channel.connection_disconnected` plus `channel.account_updated`. A token alone
  is not complete onboarding.
- Unknown/disabled asset IDs are rejected and alerted; they must not create a
  new tenant/account.
- Subscribe WhatsApp WABAs, Messenger Pages, Instagram accounts, and TikTok
  accounts explicitly. For WhatsApp, store `webhook_status`, subscribed fields,
  last verified time, and failure reason on `whatsapp_business_accounts`, not on
  the generic `channel_accounts` row.

### D.7 Channel account model

**WhatsApp hierarchy (normative).** `channel_accounts` is not the WhatsApp
account model. WhatsApp is stored explicitly:

| Level | Table | Scope |
| --- | --- | --- |
| Connection | `whatsapp_connections` | onboarding method/state, Meta business portfolio ID, granted permissions, lifecycle status, revocation/disconnection |
| WABA | `whatsapp_business_accounts` | Meta WABA ID, vault `token_ref`, token type and expiry/refresh metadata, effective permissions, templates, webhook subscription/fields/error, account/review status, Meta payment status |
| Phone number | `whatsapp_phone_numbers` | Meta phone number ID, display/E.164, registration, verification, quality, messaging limit, throughput, calling capability, send status, revocation/disconnection |

- One connection may contain multiple WABAs; one WABA may contain multiple phone
  numbers. `UNIQUE (meta_waba_id)` and `UNIQUE (meta_phone_number_id)` make
  app-level webhook mapping unambiguous across orgs. A connection has no token of
  its own: each WABA row holds its `token_ref`, which may reference a shared
  business-scoped vault secret; rotating a shared secret updates every WABA that
  references it atomically.
- `whatsapp_phone_numbers.channel_account_id` is unique and links the number 1:1
  to the send target. The `channel_accounts` WhatsApp row carries only the stable
  send identity, display name, and a normalized `status`/`capabilities`
  projection; the phone row is authoritative. Never store a WABA ID, token, scope,
  registration, quality, throughput, or calling state on the WhatsApp
  `channel_accounts` row.
- Scope rules: templates, token, permissions, webhook, account status, and the
  Meta billing relationship are WABA-scoped. Registration, verification, quality,
  messaging limit, throughput, calling, opt-in, and the send target are number-scoped.
  A WABA is never a send target; a phone number is. The connection records the
  permissions granted during onboarding; the WABA stores the effective
  permissions used for Graph calls, and the onboarding service reconciles them on
  token refresh or reauthorization.
- The connection/WABA/phone rows are created, updated, and soft-deleted together
  by the onboarding service. Reconnect reuses rows by Meta ID; it does not create
  a second hierarchy.

**Cross-channel send target.** For every channel, `channel_accounts` is the one
row a thread/message/outbound job can reference:

- `channel`: `whatsapp | messenger | instagram | tiktok | email | voice`.
- `display_name`, `status`, and `capabilities`; capability keys include
  `send_text`, `send_media`, `reactions`, `read_receipts`, `templates`,
  `reply_window`, `proactive`, and `comment_to_message`.
- For Messenger, Instagram, and TikTok, the provider identity/credential fields
  remain on `channel_accounts`: `provider`, `external_id`, `parent_external_id`,
  `auth_method`, `token_type`, `scopes`, `webhook_status`, `health`, `secret_ref`,
  `status_detail`, and token metadata. `UNIQUE (channel, external_id)` keeps the
  non-WhatsApp asset lookup unambiguous. For WhatsApp these provider fields are
  null; the explicit tables above are authoritative.
- A credential is stored once at its provider scope and referenced by every
  sendable account it covers: a WhatsApp business token per WABA, a Page token per
  Page (also usable by a linked Instagram fallback), an Instagram user token per
  professional account, and a TikTok token per business account. `secret_ref` may
  be shared for non-WhatsApp accounts; WhatsApp `token_ref` is on the WABA.
  Rotation updates every referencing row atomically.
- Setup sessions are short-lived and are not synced as channel accounts. They
  carry `pending_auth` and `selecting_assets`; the durable onboarding state is on
  `whatsapp_connections`, and the send target begins at `provisioning` only after
  the phone number exists.

| State | Meaning | Desktop behavior |
| --- | --- | --- |
| `provisioning` | Token stored; WABA/Page/IG webhook subscription, phone registration, or send target creation is in progress. | Setup state; no send. |
| `pending_review` | Provider review, business verification, display-name approval, or account eligibility is pending. | Visible; read-only; no send. |
| `pending_provider_billing` | The customer must add a payment method in the provider's billing surface (Meta-owned), or a BSP-managed billing arrangement must be confirmed. | Visible; read-only; no send. |
| `ready` | Webhook verified, number registered, provider accepts sends. | Normal channel. |
| `restricted` | Provider policy, region, or account capability blocks messaging. | Visible with reason; no send. |
| `reauth_required` | Token revoked/expired, permissions lost, or app access removed. | Cached reads; banner; no send. |
| `error` | Retryable setup/webhook/provider failure. | Cached reads; reconnect/retry. |
| `disabled` | Manager/admin paused the channel. | Cached reads; no send. |
| `revoked` | Provider revoked the connection/token; hierarchy is unusable until reauth. | Cached reads; reconnect banner; no send. |
| `disconnected` | Soft-deleted channel; token revoked where possible. | Hidden; cached messages follow retention. |

`threads.channel` and `messages.channel` add `messenger`, `instagram`, and
`tiktok`. `contact_identities.kind` adds `messenger_psid`, `instagram_igsid`,
and `tiktok_open_id`; these provider-scoped values are namespaced as
`${channel_account_id}:${external_user_id}` before insert so the existing
`(org_id, kind, value)` key cannot collide across accounts. They are never
treated as global phone/email identities.

Add channel sync events: `channel.account_updated`, `channel.account_removed`,
`channel.connection_updated`, `channel.connection_revoked`, and
`channel.connection_disconnected`. They carry connection/WABA/number display
metadata, status, capabilities, permissions, webhook health, and last
verification; never tokens, token references, PINs, or raw provider payloads.
The desktop shows the phone numbers, cached threads/messages, and a reauth or
disconnect banner.

### D.8 Message normalization and policy

- Normalize each provider message into the existing `message.created` stream with
  `channel`, `channel_account_id`, provider message ID, sender display name,
  timestamp, content type, and media references. Map delivery/read/echo events to
  `message.status_updated`; never create a duplicate thread for a provider echo.
- Provider message IDs are unique per `(org_id, channel, external_id)`. Store
  raw payloads for audit/retry, but redact message bodies from logs.
- PSID, IGSID, and TikTok open IDs are namespaced by `channel_account_id` in
  `contact_identities`; merge contacts only by verified phone/email or explicit
  user action, never by display name/username.
- WhatsApp keeps the 24-hour customer-service window, opt-in, approved-template,
  quality, and media rules. Messenger/Instagram use Meta's standard messaging
  window and message tags; TikTok is conversation/capability limited. A disabled
  composer must explain the provider policy/window, not silently drop a send.
- Media capability is provider-specific. The cloud downloads/stores incoming
  attachments, scans them, and uses the provider's upload/URL mechanism for
  outbound; the desktop never calls a provider. Enforce per-provider size/type/
  count limits and return an actionable error for unsupported sends.
- Reactions, read receipts, postbacks, story replies, comment-to-message, and
  welcome/follow messages are normalized only when the account capability and
  provider policy allow them. Unsupported features are hidden, not faked.
- Respect provider rate limits and backoff; a rapid outbound burst must not
  disable the inbox. Provider error codes map to user actions, and permanent
  failures do not retry forever.

### D.9 Web-console and desktop behavior

- **Web console.** Channels → WhatsApp shows the connection, its WABAs, and each
  WABA's phone numbers. The connection shows onboarding method/state, Meta
  business portfolio, granted permissions, and revocation/disconnection. A WABA
  shows token type, permissions, templates, webhook subscription/fields,
  account/review status, and Meta payment status. A phone number shows
  registration, verification, quality, messaging limit, throughput, and calling
  capability. IntelluxIQ subscription/billing is shown separately from Meta
  charges. Manager/admin connects and reconnects; sales users only use channels.
- Channels → Social accounts lists Pages, Instagram accounts, and TikTok accounts
  with provider, asset ID, parent, permissions/scopes, token type, status,
  webhook health, and last verification.
- The provider picker states the prerequisite review/verification and the
  expected flow. WhatsApp opens Embedded Signup v4 (or the BSP fallback path);
  Messenger opens Facebook Login for Business; Instagram opens Business Login (or
  Page fallback); TikTok opens OAuth and then shows the eligibility/capability
  result.
- **Desktop.** Channel rail and account switcher show sendable phone numbers
  grouped by WABA, with ready/reauth/restricted/billing-pending states; no
  provider auth UI and no WABA administration. A reauth action opens the correct
  web-console connection. Threads/messages and composer capabilities arrive
  through sync; the desktop never receives a Meta/TikTok token, token reference,
  PIN, or SDK.
- Provider windows/policies are enforced by the cloud at send time. The desktop
  may show a disabled composer and the provider reason; it must not attempt a
  send that the cloud will reject.

### D.10 Acceptance tests

- WhatsApp Embedded Signup v4: FINISH/CANCEL/ERROR, token-code TTL, business
  token exchange, WABA subscription, phone registration PIN, payment-pending
  state, duplicate WABA/phone, revoked token, and no v2/v3 path.
- WhatsApp hierarchy and lifecycle: one connection with multiple WABAs and
  numbers; WABA is never a send target; phone number is 1:1 with
  `channel_accounts`; onboarding state transitions to completed only after
  webhook, registration, and Meta payment method or BSP-managed billing;
  reconnect reuses rows; no duplicate on retry.
- WhatsApp scope and sync: templates are WABA-scoped and reject number scope;
  token/permissions/webhook/status are WABA-scoped; registration, verification,
  quality, throughput, and calling capability are number-scoped and sync without
  exposing secrets.
- WhatsApp revocation/disconnection: `account_update` restriction, permission
  loss, revoked token, and manager disconnect set the correct state and timestamps
  and emit `channel.connection_revoked`/`channel.connection_disconnected` without
  tokens or PINs.
- WhatsApp opt-in scope: STOP/START on one number does not change another number's
  status; marketing eligibility is checked against the sending number.
- WhatsApp billing boundary: Meta charges are not imported into IntelluxIQ
  invoices; `pending_provider_billing` is distinct from IntelluxIQ dunning;
  subscription and optional usage are separately invoiced; BSP-managed Meta
  billing is recorded but never invoiced by IntelluxIQ, and cannot alter the
  boundary.
- BSP fallback: the direct Embedded Signup path works with no BSP configured; a
  BSP-supplied connection maps to the same hierarchy, validates ownership and
  duplicates, and does not block existing sends when the BSP is unavailable.
- Messenger: Page selection, Page permissions/tasks, long-lived token, Page
  webhook subscription, invalidation/reauth, multiple Pages, PSID mapping.
- Instagram Login: professional account, scopes, 60-day token exchange/refresh,
  connected-tools blocker, webhook delivery, and no Page dependency.
- Instagram Page fallback: linked Page, Page token, Instagram webhook, and
  deduplication against an existing Instagram Login account.
- TikTok: app/Business Messaging approval gate, account Advanced Access, DMs
  open, region eligibility, OAuth refresh, `TikTok-Signature` rejection,
  capability check, and no arbitrary proactive send.
- Webhooks: Meta verification/signature, TikTok signature, unknown asset
  rejection, duplicate/retry/out-of-order delivery, tenant isolation, and 200
  within five seconds.
- Desktop: no Meta/TikTok token in cache/logs, account status sync, reauth
  banner, channel capability gating, and no duplicate account on reconnect.

### D.11 Provider references (non-normative)

- WhatsApp Embedded Signup: [v4 implementation](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation), [onboarding as a Tech Provider](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-customers-as-a-tech-provider), and [access tokens](https://developers.facebook.com/documentation/business-messaging/whatsapp/access-tokens).
- Meta login: [Facebook Login for Business](https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business).
- Messenger: [overview](https://developers.facebook.com/documentation/business-messaging/messenger-platform/overview), [webhooks](https://developers.facebook.com/documentation/business-messaging/messenger-platform/webhooks), and [quick start](https://developers.facebook.com/documentation/business-messaging/messenger-platform/getting-started/quick-start).
- Instagram: [Instagram API with Instagram Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login), [Business Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login), [Instagram Messaging](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/get-started), and [Instagram webhooks](https://developers.facebook.com/documentation/instagram-platform/webhooks).
- TikTok: [Access to Business Messaging API](https://business-api.tiktok.com/portal/docs/access-to-business-messaging-api/v1.3), [Business Messaging API authentication](https://business-api.tiktok.com/portal/docs/business-messaging-api-authentication/v1.3), [webhook subscription](https://business-api.tiktok.com/portal/docs/subscribe-to-business-messaging-webhook-events-via-webhooks-api/v1.3), and [webhook verification](https://business-api.tiktok.com/portal/docs/webhook-verification/v1.3).
- Billing: Meta's WhatsApp Business terms and pricing govern the customer's direct Meta charges; IntelluxIQ's subscription terms govern IntelluxIQ invoices. Any BSP billing is governed by the customer's separate agreement with that BSP. This appendix does not make IntelluxIQ a billing intermediary.
