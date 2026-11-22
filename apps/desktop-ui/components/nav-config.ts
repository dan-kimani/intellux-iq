import type { NavItem } from "../state";
import { activeNav, activeNavChild, allConversations } from "../state";
import { quoteRows } from "../screens/quotes/state";
import { followUpRows } from "../screens/home/state";
import { recoveryRows } from "../screens/recovery/state";
import { runLogOpen } from "../screens/automations/state";
import type { IconName } from "./ui";

export interface NavModule {
  id: string;
  label: string;
  page: NavItem;
  icon: IconName;
  count?: number | (() => number);
  action?: () => void;
}

export interface NavSection {
  id: string;
  label: string;
  icon: IconName;
  modules: NavModule[];
}

function openRunLog() {
  runLogOpen.set(true);
}

export const navTopItems: NavModule[] = [
  {
    id: "home",
    label: "Home",
    page: "Home",
    icon: "gauge",
  },
  {
    id: "tasks",
    label: "Tasks",
    page: "Tasks",
    icon: "checkCheck",
    count: () => followUpRows().filter((task) => !task.done).length,
  },
  {
    id: "inbox",
    label: "Inbox",
    page: "Inbox",
    icon: "inbox",
    count: () => allConversations().length,
  },
  {
    id: "recovery",
    label: "Recovery",
    page: "Recovery",
    icon: "bell",
    count: () => recoveryRows().length,
  },
];

export const navSections: NavSection[] = [
  {
    id: "customers",
    label: "Customers",
    icon: "users",
    modules: [
      {
        id: "contacts",
        label: "Contacts",
        page: "Contacts",
        icon: "users",
        count: 248,
      },
      {
        id: "segments",
        label: "Segments",
        page: "Segments",
        icon: "funnel",
        count: 4,
      },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: "briefcase",
    modules: [
      {
        id: "deals",
        label: "Pipeline",
        page: "Deals",
        icon: "briefcase",
        count: 8,
      },
      {
        id: "quotes",
        label: "Quotes & Proposals",
        page: "Quotes",
        icon: "fileText",
        count: () => quoteRows().length,
      },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    icon: "chart",
    modules: [{ id: "analytics", label: "Analytics", page: "Analytics", icon: "chart" }],
  },
  {
    id: "business",
    label: "Business",
    icon: "package",
    modules: [
      {
        id: "catalog",
        label: "Catalogue",
        page: "Catalog",
        icon: "package",
        count: 86,
      },
      {
        id: "automations",
        label: "Automations",
        page: "Automations",
        icon: "workflow",
        count: 4,
      },
      {
        id: "automations-runs",
        label: "Audit & Activity Logs",
        page: "Automations",
        icon: "checkCheck",
        count: 42,
        action: openRunLog,
      },
    ],
  },
];

export function moduleCount(module: NavModule): number | undefined {
  return typeof module.count === "function" ? module.count() : module.count;
}

export function sectionCount(section: NavSection): number {
  return section.modules.reduce((sum, module) => sum + (moduleCount(module) ?? 0), 0);
}

export function standaloneIsActive(module: NavModule): boolean {
  return (
    activeNav() === module.page && (activeNavChild() === module.id || activeNavChild() === null)
  );
}

export function firstModuleForPage(section: NavSection): NavModule | undefined {
  return section.modules.find((module) => module.page === activeNav());
}

export function moduleIsActive(section: NavSection, module: NavModule): boolean {
  if (activeNav() !== module.page) return false;
  if (activeNavChild() === module.id) return true;
  return activeNavChild() === null && firstModuleForPage(section)?.id === module.id;
}

export function sectionIsActive(section: NavSection): boolean {
  return section.modules.some((module) => module.page === activeNav());
}

export function selectModule(module: NavModule): void {
  activeNavChild.set(module.id);
  activeNav.set(module.page);
  module.action?.();
}
