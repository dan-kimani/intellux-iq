# Migrations

Generate with `bun run db:generate`; apply with `bun run db:migrate`.

Tenant-key rule: every tenant table is keyed by `(org_id, <entity>_id)` and
every tenant FK is `(org_id, parent_id)`. Add/backfill `org_id`, create the
composite unique index, add composite FKs `NOT VALID`, validate after the
cross-tenant orphan check, then drop single-column FKs. Only `orgs`, `users`,
and `plans` are global. See `spec.md` §7.1/§7.3.

Desktop SQLite contains cache/drafts only. It has no SMTP/IMAP credentials or
mailbox state; email protocol work belongs to cloud workers.
