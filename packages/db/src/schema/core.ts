import {
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
  bigint,
} from "drizzle-orm/pg-core";

export const orgs = pgTable("orgs", {
  orgId: uuid("org_id").primaryKey(),
  name: text("name").notNull(),
  baseCurrency: text("base_currency").notNull().default("KES"),
  defaultLocale: text("default_locale").notNull().default("en"),
  timezone: text("timezone").notNull().default("Africa/Nairobi"),
  status: text("status").notNull().default("active"),
  dataRegion: text("data_region").notNull().default("eu"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  userId: uuid("user_id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  locale: text("locale").notNull().default("en"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const memberships = pgTable(
  "memberships",
  {
    orgId: uuid("org_id").notNull(),
    userId: uuid("user_id").notNull(),
    role: text("role").notNull(),
    status: text("status").notNull(),
    maxActiveChats: integer("max_active_chats").notNull().default(15),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.userId] }),
    orgFk: foreignKey({ columns: [table.orgId], foreignColumns: [orgs.orgId] }),
    userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.userId] }),
  }),
);

export const channelAccounts = pgTable(
  "channel_accounts",
  {
    orgId: uuid("org_id").notNull(),
    channelAccountId: uuid("channel_account_id").notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    externalId: text("external_id"),
    displayName: text("display_name"),
    status: text("status").notNull(),
    health: jsonb("health"),
    secretRef: text("secret_ref"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.channelAccountId] }),
    orgFk: foreignKey({ columns: [table.orgId], foreignColumns: [orgs.orgId] }),
    external: uniqueIndex("channel_accounts_org_type_external_idx").on(
      table.orgId,
      table.type,
      table.externalId,
    ),
  }),
);

export const contacts = pgTable(
  "contacts",
  {
    orgId: uuid("org_id").notNull(),
    contactId: uuid("contact_id").notNull(),
    displayName: text("display_name"),
    companyName: text("company_name"),
    locale: text("locale"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.contactId] }),
    orgFk: foreignKey({ columns: [table.orgId], foreignColumns: [orgs.orgId] }),
  }),
);

export const products = pgTable(
  "products",
  {
    orgId: uuid("org_id").notNull(),
    productId: uuid("product_id").notNull(),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    category: text("category"),
    unitPriceMinor: bigint("unit_price_minor", { mode: "number" }).notNull().default(0),
    currency: text("currency").notNull().default("KES"),
    isActive: boolean("is_active").notNull().default(true),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.productId] }),
    orgFk: foreignKey({ columns: [table.orgId], foreignColumns: [orgs.orgId] }),
    sku: uniqueIndex("products_org_sku_idx").on(table.orgId, table.sku),
  }),
);
