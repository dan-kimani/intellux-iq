import type { Tokens } from "nsh";
import type { IconName } from "../../components/ui";
import { allConversations, isUnread } from "../../state";
import { dealRows } from "../deals/state";
import { quoteRows } from "../quotes/state";
import { recoveryRows } from "../recovery/state";
import { amountOf, isKes, money, pipelineTotals } from "./data";
import { overdueTasks, todayTasks } from "./state";

export interface HomeKpi {
  id: string;
  label: string;
  value: string;
  detail: string;
  delta: string;
  deltaTone: "success" | "warning" | "muted-foreground";
  icon: IconName;
  tone: keyof Tokens;
  spark: number[];
  page: "Inbox" | "Deals" | "Recovery";
  child: string;
}

export function homeKpis(): HomeKpi[] {
  const leads = allConversations().length;
  const totals = pipelineTotals();
  const won = dealRows().filter((deal) => deal.stage === "won");
  const missed = recoveryRows().filter((row) => row.status === "open").length;

  return [
    {
      id: "leads",
      label: "Total leads",
      value: `${leads}`,
      detail: "active conversations",
      delta: "↑ 12%",
      deltaTone: "success",
      icon: "users",
      tone: "series-1",
      page: "Inbox",
      child: "inbox",
      spark: [18, 22, 20, 27, 25, 31, 29, 36, 34, 40],
    },
    {
      id: "opportunities",
      label: "Opportunities",
      value: `${totals.openCount}`,
      detail: `${money(totals.openValue)} open`,
      delta: "↑ 18%",
      deltaTone: "success",
      icon: "briefcase",
      tone: "series-2",
      page: "Deals",
      child: "deals",
      spark: [14, 17, 15, 20, 22, 21, 26, 24, 30, 33],
    },
    {
      id: "missed",
      label: "Missed opportunities",
      value: `${missed}`,
      detail: "recovery signals open",
      delta: "↓ 32%",
      deltaTone: "success",
      icon: "zap",
      tone: "warning",
      page: "Recovery",
      child: "recovery",
      spark: [13, 12, 14, 11, 10, 11, 9, 8, 7, 6],
    },
    {
      id: "closed",
      label: "Closed deals",
      value: `${won.length}`,
      detail: "won this month",
      delta: "↑ 20%",
      deltaTone: "success",
      icon: "checkCheck",
      tone: "series-3",
      page: "Deals",
      child: "deals",
      spark: [4, 5, 4, 6, 5, 7, 7, 8, 9, 10],
    },
    {
      id: "revenue",
      label: "Revenue (MTD)",
      value: money(totals.wonValue),
      detail: "closed-won this month",
      delta: "↑ 28%",
      deltaTone: "success",
      icon: "chart",
      tone: "series-4",
      page: "Deals",
      child: "deals",
      spark: [10, 12, 11, 15, 14, 18, 20, 19, 24, 27],
    },
  ];
}

export interface WinRate {
  rate: number;
  won: number;
  total: number;
  spark: number[];
}

export function winRate(): WinRate {
  const rows = dealRows();
  const won = rows.filter((deal) => deal.stage === "won").length;
  const rate = rows.length ? Math.round((won / rows.length) * 100) : 0;
  return {
    rate,
    won,
    total: rows.length,
    spark: [4, 5, 4, 6, 7, 6, 8, 7, 9, Math.max(rate, 1)],
  };
}

export function dateBits(): { date: string; time: string } {
  const now = new Date();
  return {
    date: new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(now),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now),
  };
}

export interface MyDayRow {
  id: "follow-ups" | "unread" | "review" | "approval";
  label: string;
  note: string;
  count: number;
  icon: IconName;
  tone: keyof Tokens;
  page: "Tasks" | "Recovery" | "Inbox" | "Deals" | "Quotes";
  child: string;
}

export function myDayRows(): MyDayRow[] {
  const due = todayTasks().length;
  const overdue = overdueTasks().length;
  const unread = allConversations().filter(isUnread).length;
  const review = dealRows().filter(
    (deal) => deal.stage === "enquiry" || deal.stage === "qualified",
  ).length;
  const approvals = quoteRows().filter((row) => row.approvalStatus === "pending").length;

  return [
    {
      id: "follow-ups",
      label: "Tasks due",
      note: overdue > 0 ? `${overdue} overdue` : `${due} due today`,
      count: due + overdue,
      icon: "calendarClock",
      tone: overdue > 0 ? "warning" : "series-4",
      page: "Tasks",
      child: "tasks",
    },
    {
      id: "unread",
      label: "Unread chats",
      note: unread > 0 ? "waiting for a reply" : "inbox is clear",
      count: unread,
      icon: "messageCircle",
      tone: "series-1",
      page: "Inbox",
      child: "inbox",
    },
    {
      id: "review",
      label: "Deals to review",
      note: "early stage",
      count: review,
      icon: "briefcase",
      tone: "series-2",
      page: "Deals",
      child: "deals",
    },
    {
      id: "approval",
      label: "Quote approvals",
      note: approvals > 0 ? "needs a manager" : "nothing waiting",
      count: approvals,
      icon: "shieldCheck",
      tone: "series-3",
      page: "Quotes",
      child: "quotes",
    },
  ];
}

export interface QuoteRisk {
  rows: ReturnType<typeof quoteRows>;
  count: number;
  value: number;
}

export function quotesAtRisk(): QuoteRisk {
  const rows = quoteRows().filter((row) => row.status === "sent" || row.status === "expired");
  return {
    rows,
    count: rows.length,
    value: rows.reduce((sum, row) => sum + amountOf(row.value), 0),
  };
}

export interface OwnerPerformance {
  owner: string;
  open: number;
  won: number;
  total: number;
  deals: number;
  wonShare: number;
}

export function ownerPerformance(limit = 4, only?: string): OwnerPerformance[] {
  const owners = new Map<string, { owner: string; open: number; won: number; deals: number }>();
  for (const deal of dealRows()) {
    if (only && deal.owner !== only) continue;
    const row = owners.get(deal.owner) ?? { owner: deal.owner, open: 0, won: 0, deals: 0 };
    if (isKes(deal.value)) {
      if (deal.stage === "won") row.won += amountOf(deal.value);
      else if (deal.stage !== "lost") row.open += amountOf(deal.value);
    }
    row.deals += 1;
    owners.set(deal.owner, row);
  }
  return [...owners.values()]
    .map((row) => ({
      ...row,
      total: row.open + row.won,
      wonShare: row.open + row.won ? Math.round((row.won / (row.open + row.won)) * 100) : 0,
    }))
    .toSorted((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function topOwner(): OwnerPerformance | null {
  return (
    ownerPerformance(8)
      .filter((row) => row.won > 0)
      .toSorted((a, b) => b.won - a.won)[0] ?? null
  );
}
