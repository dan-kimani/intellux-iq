import type { IconName } from "../../components/icon";

export type SignalSeverity = "urgent" | "high" | "medium" | "low";
export type SignalStatus = "open" | "acknowledged";

export interface RecoverySignal {
  id: string;
  rule: string;
  title: string;
  entity: string;
  entityType: "conversation" | "opportunity" | "quote";
  severity: SignalSeverity;
  owner: string;
  age: string;
  value: string;
  evidence: string[];
  recommended: string;
  icon: IconName;
  tone: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";
  status: SignalStatus;
}

export const recoverySignals: RecoverySignal[] = [
  {
    id: "sig-1042",
    rule: "lead_unanswered",
    title: "Inbound enquiry has no reply",
    entity: "Sarah Wanjiku · ABC Enterprises",
    entityType: "conversation",
    severity: "urgent",
    owner: "David Mwangi",
    age: "48m",
    value: "KES 248,500",
    evidence: [
      "First inbound 48 minutes ago",
      "No outbound reply yet",
      "First-response SLA is 30 minutes",
      "Customer viewed quote 2× before writing",
    ],
    recommended: "Reply with the revised quote and confirm the delivery window.",
    icon: "messageCircle",
    tone: "chart-4",
    status: "open",
  },
  {
    id: "sig-1038",
    rule: "quote_no_follow_up",
    title: "Sent quote has no follow-up",
    entity: "QT-2025-0045 · ABC Enterprises",
    entityType: "quote",
    severity: "high",
    owner: "David Mwangi",
    age: "3d",
    value: "KES 248,500",
    evidence: [
      "Quote sent 3 days ago",
      "Viewed 2× by the buyer",
      "No reply and no follow-up task",
      "Expires in 2 days",
    ],
    recommended: "Create a follow-up task and reference the buyer’s last question.",
    icon: "fileText",
    tone: "chart-2",
    status: "open",
  },
  {
    id: "sig-1031",
    rule: "opportunity_inactive",
    title: "Qualified opportunity has gone quiet",
    entity: "OPP-2025-0107 · Summit Traders",
    entityType: "opportunity",
    severity: "high",
    owner: "James Njoroge",
    age: "7d",
    value: "KES 420,000",
    evidence: [
      "No stage change for 7 days",
      "No customer message for 6 days",
      "No follow-up scheduled",
      "Owner has 4 active opportunities",
    ],
    recommended: "Confirm distributor terms and schedule the next conversation.",
    icon: "briefcase",
    tone: "chart-1",
    status: "open",
  },
  {
    id: "sig-1026",
    rule: "customer_went_silent",
    title: "Customer stopped responding",
    entity: "Mary Atieno · Atieno Interiors",
    entityType: "conversation",
    severity: "medium",
    owner: "Moses Otieno",
    age: "4d",
    value: "KES 72,400",
    evidence: [
      "Last outbound message 4 days ago",
      "No inbound reply",
      "Quote accepted earlier",
      "Delivery question is unresolved",
    ],
    recommended: "Send a short delivery update and ask for a confirmation.",
    icon: "bell",
    tone: "chart-5",
    status: "acknowledged",
  },
  {
    id: "sig-1019",
    rule: "conversation_unanswered_burst",
    title: "Three inbound messages without a reply",
    entity: "Kijani Foods · WhatsApp",
    entityType: "conversation",
    severity: "urgent",
    owner: "Unassigned",
    age: "22m",
    value: "KES 412,000",
    evidence: [
      "3 consecutive inbound messages",
      "No outbound reply",
      "Keywords: bulk, tender",
      "Conversation is unassigned",
    ],
    recommended: "Assign the conversation to a senior closer and reply now.",
    icon: "zap",
    tone: "chart-4",
    status: "open",
  },
  {
    id: "sig-1012",
    rule: "follow_up_overdue",
    title: "Follow-up task is overdue",
    entity: "OPP-2025-0127 · TechWorld Ltd",
    entityType: "opportunity",
    severity: "medium",
    owner: "Amina Kimani",
    age: "1d",
    value: "KES 84,000",
    evidence: [
      "Task due 1 day ago",
      "No completed follow-up",
      "Quote is still in draft",
      "Customer viewed the accessory list",
    ],
    recommended: "Complete the follow-up and move the quote out of draft.",
    icon: "calendarClock",
    tone: "chart-3",
    status: "open",
  },
];

export const recoveredThisWeek = [
  { title: "Quote accepted after follow-up", detail: "Ochieng & Sons · KES 96,750", time: "Today" },
  {
    title: "Lead replied after reassignment",
    detail: "GreenMart Supplies · KES 72,000",
    time: "Yesterday",
  },
  {
    title: "Opportunity advanced to negotiation",
    detail: "Nairobi Office Co. · KES 96,750",
    time: "2d ago",
  },
  { title: "Overdue follow-up completed", detail: "Kamau Retail · KES 189,900", time: "3d ago" },
];

export const severityStyles: Record<
  SignalSeverity,
  { label: string; color: string; variant: "warning" | "primary" | "outline" | "success" }
> = {
  urgent: { label: "Urgent", color: "chart-4", variant: "warning" },
  high: { label: "High", color: "chart-1", variant: "primary" },
  medium: { label: "Medium", color: "chart-2", variant: "outline" },
  low: { label: "Low", color: "muted-foreground", variant: "outline" },
};
