import {
  boolean,
  date,
  foreignKey,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { memberships } from "./core";
import { threads } from "./conversations";
import { opportunities } from "./opportunities";

export const intelligenceRules = pgTable(
  "intelligence_rules",
  {
    orgId: uuid("org_id").notNull(),
    ruleKey: text("rule_key").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    thresholds: jsonb("thresholds").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.ruleKey] }),
  }),
);

export const salesSignals = pgTable(
  "sales_signals",
  {
    orgId: uuid("org_id").notNull(),
    signalId: uuid("signal_id").notNull(),
    ruleKey: text("rule_key").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    conversationId: uuid("conversation_id"),
    opportunityId: uuid("opportunity_id"),
    ownerUserId: uuid("owner_user_id"),
    severity: text("severity").notNull(),
    status: text("status").notNull().default("open"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    metadata: jsonb("metadata").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.signalId] }),
    conversationFk: foreignKey({
      columns: [table.orgId, table.conversationId],
      foreignColumns: [threads.orgId, threads.threadId],
    }),
    opportunityFk: foreignKey({
      columns: [table.orgId, table.opportunityId],
      foreignColumns: [opportunities.orgId, opportunities.opportunityId],
    }),
    ownerFk: foreignKey({
      columns: [table.orgId, table.ownerUserId],
      foreignColumns: [memberships.orgId, memberships.userId],
    }),
  }),
);

export const followUpTasks = pgTable(
  "follow_up_tasks",
  {
    orgId: uuid("org_id").notNull(),
    taskId: uuid("task_id").notNull(),
    conversationId: uuid("conversation_id"),
    opportunityId: uuid("opportunity_id"),
    ownerUserId: uuid("owner_user_id").notNull(),
    sourceSignalId: uuid("source_signal_id"),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("open"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    note: text("note"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.taskId] }),
    conversationFk: foreignKey({
      columns: [table.orgId, table.conversationId],
      foreignColumns: [threads.orgId, threads.threadId],
    }),
    opportunityFk: foreignKey({
      columns: [table.orgId, table.opportunityId],
      foreignColumns: [opportunities.orgId, opportunities.opportunityId],
    }),
    ownerFk: foreignKey({
      columns: [table.orgId, table.ownerUserId],
      foreignColumns: [memberships.orgId, memberships.userId],
    }),
    signalFk: foreignKey({
      columns: [table.orgId, table.sourceSignalId],
      foreignColumns: [salesSignals.orgId, salesSignals.signalId],
    }),
  }),
);

export const salesMetricsDaily = pgTable(
  "sales_metrics_daily",
  {
    orgId: uuid("org_id").notNull(),
    metricDate: date("metric_date").notNull(),
    scopeType: text("scope_type").notNull(),
    scopeId: uuid("scope_id").notNull(),
    metricKey: text("metric_key").notNull(),
    valueNumeric: numeric("value_numeric", { precision: 18, scale: 4 }).notNull(),
    currency: text("currency"),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.orgId, table.metricDate, table.scopeType, table.scopeId, table.metricKey],
    }),
  }),
);
