import type { IconName } from "../../components/ui";
import { currentMember } from "../../state";
import { money as formatMoney } from "../../lib/money";
import { dealRows } from "../deals/state";
import type { WorkLink } from "../work/types";
import { dueLabel } from "../work/time";

export type FollowUpKind =
  | "call"
  | "email"
  | "whatsapp"
  | "meeting"
  | "quote"
  | "proposal"
  | "task";
export type FollowUpPriority = "high" | "normal";
export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";

export interface FollowUpTask {
  id: string;
  title: string;
  context: string;
  kind: FollowUpKind;
  priority: FollowUpPriority;
  due: string;
  dueInMinutes: number;
  dueAtMs?: number;
  owner: string;
  ownerId?: string;
  status?: TaskStatus;
  visibility?: "org" | "private";
  notes?: string;
  outcome?: string;
  cancelled?: boolean;
  completedAt?: string;
  done: boolean;
  conversationId?: string;
  opportunityId?: string;
  source: "signal" | "manual" | "quote";
  links?: WorkLink[];
}

export const taskKindLabel: Record<FollowUpKind, string> = {
  call: "Call",
  email: "Send email",
  whatsapp: "WhatsApp message",
  meeting: "Meeting",
  quote: "Quote follow-up",
  proposal: "Prepare proposal",
  task: "General task",
};

export const taskKindIcon: Record<FollowUpKind, IconName> = {
  call: "phone",
  email: "mail",
  whatsapp: "whatsapp",
  quote: "fileText",
  meeting: "calendarClock",
  proposal: "presentation",
  task: "check",
};

const owner = currentMember.name;

const seededTasks: FollowUpTask[] = [
  {
    id: "task-1",
    title: "Call Maya about the packaging artwork",
    context: "Acme Inc. — Q4 packaging",
    kind: "call",
    priority: "high",
    due: "Overdue · 2h 15m",
    dueInMinutes: -135,
    owner,
    done: false,
    conversationId: "sarah",
    opportunityId: "OPP-2025-0123",
    source: "signal",
  },
  {
    id: "task-2",
    title: "Send the revised quote to TechWorld",
    context: "TechWorld — accessory bundle",
    kind: "quote",
    priority: "high",
    due: "Today · 11:00",
    dueInMinutes: 40,
    owner,
    done: false,
    conversationId: "techworld",
    opportunityId: "OPP-2025-0127",
    source: "quote",
  },
  {
    id: "task-3",
    title: "Confirm the delivery window with Alex",
    context: "Harbor & Co. — office audio",
    kind: "email",
    priority: "normal",
    due: "Today · 12:30",
    dueInMinutes: 130,
    owner,
    done: false,
    conversationId: "david",
    source: "signal",
  },
  {
    id: "task-4",
    title: "Qualify Summit distributor terms",
    context: "Summit — distributor terms",
    kind: "call",
    priority: "normal",
    due: "Today · 15:00",
    dueInMinutes: 280,
    owner,
    done: false,
    conversationId: "summit",
    opportunityId: "OPP-2025-0120",
    source: "manual",
  },
  {
    id: "task-5",
    title: "Review the Acme accessory bundle",
    context: "Acme Inc. — accessory bundle",
    kind: "task",
    priority: "high",
    due: "Tomorrow · 09:00",
    dueInMinutes: 1380,
    owner,
    done: false,
    conversationId: "sarah",
    opportunityId: "OPP-2025-0131",
    source: "manual",
  },
  {
    id: "task-6",
    title: "Check GreenMart restock timing",
    context: "GreenMart — annual supply",
    kind: "email",
    priority: "normal",
    due: "Tomorrow · 14:00",
    dueInMinutes: 1680,
    owner,
    done: false,
    conversationId: "greenmart",
    source: "signal",
  },
  {
    id: "task-7",
    title: "Send the onboarding pack to James",
    context: "Continental — annual supply",
    kind: "task",
    priority: "normal",
    due: "Thu · 10:00",
    dueInMinutes: 2880,
    owner: "Aiko Tanaka",
    ownerId: "u-amina",
    done: false,
    conversationId: "james",
    source: "manual",
  },
  {
    id: "task-8",
    title: "Log the call notes with Mary",
    context: "Lumen Interiors — lighting",
    kind: "call",
    priority: "normal",
    due: "Yesterday",
    dueInMinutes: -1440,
    owner,
    done: true,
    conversationId: "mary",
    source: "manual",
  },
];

export const seedTasks: FollowUpTask[] = seededTasks.map((task) => {
  const dueAtMs = Date.now() + task.dueInMinutes * 60_000;
  return {
    ...task,
    dueAtMs,
    due: dueLabel(dueAtMs),
    ownerId: task.ownerId ?? (task.owner === currentMember.name ? currentMember.id : undefined),
  };
});

export function isKes(value: string): boolean {
  return /^(?:\$|€|£|KSh|KES|USD|EUR|GBP)/.test(value.trim());
}

export function amountOf(value: string): number {
  return Number(value.replace(/\D/g, "")) || 0;
}

export function money(total: number): string {
  return formatMoney(total);
}

export function openDeals() {
  return dealRows().filter((deal) => deal.stage !== "won" && deal.stage !== "lost");
}

export function pipelineTotals() {
  const open = openDeals().filter((deal) => isKes(deal.value));
  return {
    openCount: open.length,
    openValue: open.reduce((sum, deal) => sum + amountOf(deal.value), 0),
    weighted: open.reduce((sum, deal) => sum + (amountOf(deal.value) * deal.probability) / 100, 0),
    wonValue: dealRows()
      .filter((deal) => deal.stage === "won" && isKes(deal.value))
      .reduce((sum, deal) => sum + amountOf(deal.value), 0),
  };
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
