import {
  bigint,
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { channelAccounts, contacts, memberships, orgs } from "./core";

export const threads = pgTable(
  "threads",
  {
    orgId: uuid("org_id").notNull(),
    threadId: uuid("thread_id").notNull(),
    contactId: uuid("contact_id"),
    contactName: text("contact_name"),
    assignedUserId: uuid("assigned_user_id"),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    assignedBy: uuid("assigned_by"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.threadId] }),
    orgFk: foreignKey({ columns: [table.orgId], foreignColumns: [orgs.orgId] }),
    contactFk: foreignKey({
      columns: [table.orgId, table.contactId],
      foreignColumns: [contacts.orgId, contacts.contactId],
    }),
    assigneeFk: foreignKey({
      columns: [table.orgId, table.assignedUserId],
      foreignColumns: [memberships.orgId, memberships.userId],
    }),
    assignedByFk: foreignKey({
      columns: [table.orgId, table.assignedBy],
      foreignColumns: [memberships.orgId, memberships.userId],
    }),
  }),
);

export const messages = pgTable(
  "messages",
  {
    orgId: uuid("org_id").notNull(),
    messageId: uuid("message_id").notNull(),
    threadId: uuid("thread_id").notNull(),
    channelAccountId: uuid("channel_account_id"),
    senderUserId: uuid("sender_user_id"),
    externalId: text("external_id"),
    channel: text("channel").notNull(),
    senderType: text("sender_type").notNull(),
    contentType: text("content_type").notNull(),
    bodyText: text("body_text"),
    deliveryStatus: text("delivery_status").notNull().default("queued"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.messageId] }),
    orgFk: foreignKey({ columns: [table.orgId], foreignColumns: [orgs.orgId] }),
    threadFk: foreignKey({
      columns: [table.orgId, table.threadId],
      foreignColumns: [threads.orgId, threads.threadId],
    }),
    channelFk: foreignKey({
      columns: [table.orgId, table.channelAccountId],
      foreignColumns: [channelAccounts.orgId, channelAccounts.channelAccountId],
    }),
    senderFk: foreignKey({
      columns: [table.orgId, table.senderUserId],
      foreignColumns: [memberships.orgId, memberships.userId],
    }),
    external: uniqueIndex("messages_org_channel_external_idx").on(
      table.orgId,
      table.channel,
      table.externalId,
    ),
  }),
);

export const devices = pgTable(
  "devices",
  {
    orgId: uuid("org_id").notNull(),
    deviceId: uuid("device_id").notNull(),
    userId: uuid("user_id"),
    name: text("name"),
    os: text("os"),
    appVersion: text("app_version"),
    status: text("status").notNull().default("linked"),
    wipeStatus: text("wipe_status").default("none"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    linkedAt: timestamp("linked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.deviceId] }),
    orgFk: foreignKey({ columns: [table.orgId], foreignColumns: [orgs.orgId] }),
    userFk: foreignKey({
      columns: [table.orgId, table.userId],
      foreignColumns: [memberships.orgId, memberships.userId],
    }),
  }),
);

export const events = pgTable(
  "events",
  {
    orgId: uuid("org_id").notNull(),
    seq: bigint("seq", { mode: "number" }).notNull(),
    eventId: uuid("event_id").notNull(),
    type: text("type").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    schemaVersion: integer("schema_version").notNull(),
    payload: jsonb("payload").notNull(),
    actorUserId: uuid("actor_user_id"),
    actorDeviceId: uuid("actor_device_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.seq] }),
    eventIdUnique: uniqueIndex("events_org_event_id_idx").on(table.orgId, table.eventId),
  }),
);

export const outboundJobs = pgTable(
  "outbound_jobs",
  {
    orgId: uuid("org_id").notNull(),
    jobId: uuid("job_id").notNull(),
    channel: text("channel").notNull(),
    channelAccountId: uuid("channel_account_id"),
    status: text("status").notNull().default("queued"),
    attempts: integer("attempts").notNull().default(0),
    idempotencyKey: text("idempotency_key").notNull(),
    payload: jsonb("payload").notNull(),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.jobId] }),
    orgFk: foreignKey({ columns: [table.orgId], foreignColumns: [orgs.orgId] }),
    channelFk: foreignKey({
      columns: [table.orgId, table.channelAccountId],
      foreignColumns: [channelAccounts.orgId, channelAccounts.channelAccountId],
    }),
    idempotency: uniqueIndex("outbound_jobs_org_idempotency_idx").on(
      table.orgId,
      table.idempotencyKey,
    ),
  }),
);

export const featureFlags = pgTable(
  "feature_flags",
  {
    orgId: uuid("org_id").notNull(),
    key: text("key").notNull(),
    enabled: boolean("enabled").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.key] }),
    orgFk: foreignKey({ columns: [table.orgId], foreignColumns: [orgs.orgId] }),
  }),
);

export const conversationMetrics = pgTable(
  "conversation_metrics",
  {
    orgId: uuid("org_id").notNull(),
    conversationId: uuid("conversation_id").notNull(),
    firstInboundAt: timestamp("first_inbound_at", { withTimezone: true }),
    firstOutboundAt: timestamp("first_outbound_at", { withTimezone: true }),
    firstResponseSeconds: bigint("first_response_seconds", { mode: "number" }),
    lastInboundAt: timestamp("last_inbound_at", { withTimezone: true }),
    lastOutboundAt: timestamp("last_outbound_at", { withTimezone: true }),
    responseGapCount: integer("response_gap_count").notNull().default(0),
    unansweredInboundCount: integer("unanswered_inbound_count").notNull().default(0),
    followUpDueAt: timestamp("follow_up_due_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.conversationId] }),
    conversationFk: foreignKey({
      columns: [table.orgId, table.conversationId],
      foreignColumns: [threads.orgId, threads.threadId],
    }),
  }),
);
