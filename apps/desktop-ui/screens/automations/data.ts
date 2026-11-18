export interface AutomationRule {
  id: string;
  title: string;
  description: string;
  trigger: string;
  action: string;
  runs: string;
  tone: "chart-1" | "chart-2" | "chart-3" | "chart-4";
  enabled: boolean;
  lastRun: string;
  successRate: string;
  category: string;
}

export const automationRules: AutomationRule[] = [
  {
    id: "r1",
    title: "Unanswered lead recovery",
    description: "Escalate a new lead when no one replies inside the response SLA.",
    trigger: "No reply for 30 min",
    action: "Reassign + notify manager",
    runs: "18 this month",
    tone: "chart-1",
    enabled: true,
    lastRun: "4m ago",
    successRate: "98%",
    category: "Lead recovery",
  },
  {
    id: "r2",
    title: "Quote follow-up",
    description: "Nudge the owner when a sent quote has no response after three days.",
    trigger: "Quote sent 3 days ago",
    action: "Create follow-up task",
    runs: "12 this month",
    tone: "chart-2",
    enabled: true,
    lastRun: "18m ago",
    successRate: "100%",
    category: "Quotes",
  },
  {
    id: "r3",
    title: "Opportunity inactivity",
    description: "Flag opportunities that have not moved or received a message for a week.",
    trigger: "No activity for 7 days",
    action: "Add intelligence signal",
    runs: "9 this month",
    tone: "chart-4",
    enabled: true,
    lastRun: "1h ago",
    successRate: "96%",
    category: "Pipeline",
  },
  {
    id: "r4",
    title: "Follow-up due",
    description: "Remind the owner when a follow-up task reaches its due time.",
    trigger: "Task due now",
    action: "Desktop notification",
    runs: "31 this month",
    tone: "chart-3",
    enabled: true,
    lastRun: "42m ago",
    successRate: "99%",
    category: "Follow-ups",
  },
];

export const recentRuns = [
  {
    name: "Unanswered lead recovery",
    detail: "Reassigned Grace Wanjiku to Yasir Noori",
    time: "4m ago",
    tone: "chart-1" as const,
    status: "success",
    duration: "1.2s",
  },
  {
    name: "Quote follow-up",
    detail: "Created a task for QT-2025-0045",
    time: "18m ago",
    tone: "chart-2" as const,
    status: "success",
    duration: "0.8s",
  },
  {
    name: "Follow-up due",
    detail: "Notified Moses Otieno",
    time: "42m ago",
    tone: "chart-3" as const,
    status: "success",
    duration: "0.4s",
  },
  {
    name: "Opportunity inactivity",
    detail: "Flagged Kijani Foods",
    time: "1h ago",
    tone: "chart-4" as const,
    status: "skipped",
    duration: "0.1s",
  },
];
