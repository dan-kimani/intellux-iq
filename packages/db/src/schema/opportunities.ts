import {
  bigint,
  boolean,
  date,
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { contacts, memberships, orgs, products } from "./core";
import { threads } from "./conversations";

export const opportunities = pgTable(
  "opportunities",
  {
    orgId: uuid("org_id").notNull(),
    opportunityId: uuid("opportunity_id").notNull(),
    contactId: uuid("contact_id").notNull(),
    ownerUserId: uuid("owner_user_id"),
    name: text("name").notNull(),
    stage: text("stage").notNull().default("enquiry"),
    source: text("source"),
    estimatedValueMinor: bigint("estimated_value_minor", { mode: "number" }).notNull().default(0),
    currency: text("currency").notNull().default("KES"),
    probabilityBps: integer("probability_bps"),
    expectedCloseDate: date("expected_close_date"),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
    nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
    qualifiedAt: timestamp("qualified_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    wonAt: timestamp("won_at", { withTimezone: true }),
    lostAt: timestamp("lost_at", { withTimezone: true }),
    lostReason: text("lost_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.opportunityId] }),
    orgFk: foreignKey({ columns: [table.orgId], foreignColumns: [orgs.orgId] }),
    contactFk: foreignKey({
      columns: [table.orgId, table.contactId],
      foreignColumns: [contacts.orgId, contacts.contactId],
    }),
    ownerFk: foreignKey({
      columns: [table.orgId, table.ownerUserId],
      foreignColumns: [memberships.orgId, memberships.userId],
    }),
  }),
);

export const opportunityConversations = pgTable(
  "opportunity_conversations",
  {
    orgId: uuid("org_id").notNull(),
    opportunityId: uuid("opportunity_id").notNull(),
    conversationId: uuid("conversation_id").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    linkedAt: timestamp("linked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.opportunityId, table.conversationId] }),
    opportunityFk: foreignKey({
      columns: [table.orgId, table.opportunityId],
      foreignColumns: [opportunities.orgId, opportunities.opportunityId],
    }),
    conversationFk: foreignKey({
      columns: [table.orgId, table.conversationId],
      foreignColumns: [threads.orgId, threads.threadId],
    }),
  }),
);

export const opportunityProducts = pgTable(
  "opportunity_products",
  {
    orgId: uuid("org_id").notNull(),
    opportunityProductId: uuid("opportunity_product_id").notNull(),
    opportunityId: uuid("opportunity_id").notNull(),
    productId: uuid("product_id").notNull(),
    quantityMilli: bigint("quantity_milli", { mode: "number" }).notNull().default(1000),
    targetPriceMinor: bigint("target_price_minor", { mode: "number" }),
    currency: text("currency"),
    notes: text("notes"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.opportunityProductId] }),
    opportunityFk: foreignKey({
      columns: [table.orgId, table.opportunityId],
      foreignColumns: [opportunities.orgId, opportunities.opportunityId],
    }),
    productFk: foreignKey({
      columns: [table.orgId, table.productId],
      foreignColumns: [products.orgId, products.productId],
    }),
  }),
);

export const opportunityStageHistory = pgTable(
  "opportunity_stage_history",
  {
    orgId: uuid("org_id").notNull(),
    stageEventId: uuid("stage_event_id").notNull(),
    opportunityId: uuid("opportunity_id").notNull(),
    fromStage: text("from_stage"),
    toStage: text("to_stage").notNull(),
    changedBy: uuid("changed_by"),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull(),
    note: text("note"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.stageEventId] }),
    opportunityFk: foreignKey({
      columns: [table.orgId, table.opportunityId],
      foreignColumns: [opportunities.orgId, opportunities.opportunityId],
    }),
    actorFk: foreignKey({
      columns: [table.orgId, table.changedBy],
      foreignColumns: [memberships.orgId, memberships.userId],
    }),
  }),
);
