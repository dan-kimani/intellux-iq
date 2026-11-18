import { describe, expect, it } from "bun:test";
import { getTableConfig } from "drizzle-orm/pg-core";
import * as schema from "../src/schema";

const tenantTables = [
  ["memberships", schema.memberships],
  ["channel_accounts", schema.channelAccounts],
  ["products", schema.products],
  ["contacts", schema.contacts],
  ["threads", schema.threads],
  ["opportunities", schema.opportunities],
  ["opportunity_conversations", schema.opportunityConversations],
  ["opportunity_products", schema.opportunityProducts],
  ["opportunity_stage_history", schema.opportunityStageHistory],
  ["conversation_metrics", schema.conversationMetrics],
  ["messages", schema.messages],
  ["devices", schema.devices],
  ["events", schema.events],
  ["outbound_jobs", schema.outboundJobs],
  ["feature_flags", schema.featureFlags],
  ["intelligence_rules", schema.intelligenceRules],
  ["sales_signals", schema.salesSignals],
  ["follow_up_tasks", schema.followUpTasks],
  ["sales_metrics_daily", schema.salesMetricsDaily],
] as const;

describe("tenant-scoped primary keys", () => {
  for (const [name, table] of tenantTables) {
    it(`${name} includes org_id`, () => {
      const config = getTableConfig(table);
      const primaryKey = config.primaryKeys[0];
      const columns = primaryKey?.columns.map((column) => column.name) ?? [];

      expect(columns).toContain("org_id");
    });
  }
});
