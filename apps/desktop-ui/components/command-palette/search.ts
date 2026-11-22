import { newMessageOpen, type NavItem } from "../../state";
import { newDealOpen } from "../../screens/deals/state";
import { openWorkDialog } from "../../screens/work/state";
import { quoteBuilderOpen } from "../../screens/quotes/state";
import { contactDetail, contactRows } from "../../screens/contacts/state";
import { dealDetail, dealRows } from "../../screens/deals/state";
import { quoteDetail, quoteRows } from "../../screens/quotes/state";
import { productDetail, productRows } from "../../screens/catalog/state";
import type { IconName } from "../ui";
import type { ShortcutId } from "../../screens/settings/shortcuts";

export interface PaletteResult {
  key: string;
  label: string;
  detail: string;
  group: string;
  kind: string;
  icon: IconName;
  nav?: NavItem;
  shortcutId?: ShortcutId;
  action?: () => void;
}

const suggestions: PaletteResult[] = [
  {
    key: "new-message",
    label: "New message",
    detail: "Start a conversation with a customer",
    group: "Suggestions",
    kind: "Command",
    icon: "messageCircle",
    shortcutId: "new-message",
    action: () => newMessageOpen.set(true),
  },
  {
    key: "new-deal",
    label: "New opportunity",
    detail: "Add a deal to the pipeline",
    group: "Suggestions",
    kind: "Command",
    icon: "briefcase",
    nav: "Deals",
    action: () => newDealOpen.set(true),
  },
  {
    key: "new-quote",
    label: "New quote",
    detail: "Draft a quotation for a customer",
    group: "Suggestions",
    kind: "Command",
    icon: "fileText",
    shortcutId: "new-quote",
    nav: "Quotes",
    action: () => quoteBuilderOpen.set(true),
  },
  {
    key: "new-task",
    label: "New task",
    detail: "Plan internal follow-up work",
    group: "Suggestions",
    kind: "Command",
    icon: "checkCheck",
    action: () => openWorkDialog({ mode: "task" }),
  },
  {
    key: "log-activity",
    label: "Log activity",
    detail: "Record a call, meeting, email, or note",
    group: "Suggestions",
    kind: "Command",
    icon: "fileText",
    action: () => openWorkDialog({ mode: "activity" }),
  },
  {
    key: "set-reminder",
    label: "Set reminder",
    detail: "Return to a record at a chosen time",
    group: "Suggestions",
    kind: "Command",
    icon: "calendarClock",
    action: () => openWorkDialog({ mode: "reminder" }),
  },
];

const navResults: PaletteResult[] = [
  {
    key: "go-inbox",
    label: "Inbox",
    detail: "Conversations, messages, assignments",
    group: "Go to",
    kind: "Screen",
    icon: "inbox",
    nav: "Inbox",
  },
  {
    key: "go-tasks",
    label: "Tasks",
    detail: "Tasks, activity, and reminders",
    group: "Go to",
    kind: "Screen",
    icon: "checkCheck",
    nav: "Tasks",
  },
  {
    key: "go-contacts",
    label: "Contacts",
    detail: "People, companies, segments",
    group: "Go to",
    kind: "Screen",
    icon: "users",
    nav: "Contacts",
  },
  {
    key: "go-deals",
    label: "Pipeline",
    detail: "Opportunities, stages, value",
    group: "Go to",
    kind: "Screen",
    icon: "briefcase",
    nav: "Deals",
  },
  {
    key: "go-quotes",
    label: "Quotes & Proposals",
    detail: "Quotations, templates, health",
    group: "Go to",
    kind: "Screen",
    icon: "fileText",
    nav: "Quotes",
  },
  {
    key: "go-catalog",
    label: "Catalogue",
    detail: "Products, stock, media",
    group: "Go to",
    kind: "Screen",
    icon: "package",
    nav: "Catalog",
  },
  {
    key: "go-analytics",
    label: "Analytics",
    detail: "Outcomes, pipeline, team",
    group: "Go to",
    kind: "Screen",
    icon: "chart",
    nav: "Analytics",
  },
  {
    key: "go-automations",
    label: "Automation & Workflows",
    detail: "Rules and run log",
    group: "Go to",
    kind: "Screen",
    icon: "workflow",
    nav: "Automations",
  },
  {
    key: "go-settings",
    label: "Settings",
    detail: "Workspace, devices, shortcuts, access",
    group: "Go to",
    kind: "Screen",
    icon: "settings",
    nav: "Settings",
  },
];

export function resultsFor(query: string): PaletteResult[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...suggestions, ...navResults];
  const results = [...suggestions, ...navResults].filter((item) =>
    `${item.label} ${item.detail} ${item.kind}`.toLowerCase().includes(needle),
  );
  for (const contact of contactRows()) {
    if (`${contact.name} ${contact.company} ${contact.email}`.toLowerCase().includes(needle)) {
      results.push({
        key: `contact-${contact.id}`,
        label: contact.name,
        detail: `${contact.company} · ${contact.status}`,
        group: "Contacts",
        kind: "Contact",
        icon: "users",
        nav: "Contacts",
        action: () => contactDetail.set(contact),
      });
    }
  }
  for (const deal of dealRows()) {
    if (`${deal.name} ${deal.company} ${deal.id}`.toLowerCase().includes(needle)) {
      results.push({
        key: `deal-${deal.id}`,
        label: deal.name,
        detail: `${deal.value} · ${deal.stage}`,
        group: "Deals",
        kind: "Opportunity",
        icon: "briefcase",
        nav: "Deals",
        action: () => dealDetail.set(deal),
      });
    }
  }
  for (const quote of quoteRows()) {
    if (`${quote.id} ${quote.customer} ${quote.opportunity}`.toLowerCase().includes(needle)) {
      results.push({
        key: `quote-${quote.id}`,
        label: quote.id,
        detail: `${quote.customer} · ${quote.value}`,
        group: "Quotes",
        kind: "Quote",
        icon: "fileText",
        nav: "Quotes",
        action: () => quoteDetail.set(quote),
      });
    }
  }
  for (const product of productRows()) {
    if (`${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(needle)) {
      results.push({
        key: `product-${product.id}`,
        label: product.name,
        detail: `${product.sku} · ${product.price}`,
        group: "Catalog",
        kind: "Product",
        icon: "package",
        nav: "Catalog",
        action: () => productDetail.set(product),
      });
    }
  }
  return results.slice(0, 18);
}
