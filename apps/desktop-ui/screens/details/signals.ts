import type { Conversation } from "../../data";
import { opportunitiesFor } from "../../state";

export type SignalSeverity = "low" | "medium" | "high" | "urgent";

export interface InboxSignal {
  id: string;
  rule: string;
  title: string;
  evidence: string;
  severity: SignalSeverity;
  owner: string;
  age: string;
  opportunityId?: string;
}

export function buildSignals(conversation: Conversation): InboxSignal[] {
  const c = conversation;
  const m = c.metrics;
  const owner = c.assignment?.name ?? "Unassigned";
  const opportunity = opportunitiesFor(c)[0];
  const signals: InboxSignal[] = [];

  if (m.unansweredInboundCount >= 3) {
    signals.push({
      id: `${c.id}-burst`,
      rule: "conversation_unanswered_burst",
      title: "Unanswered message burst",
      evidence: `${m.unansweredInboundCount} inbound messages have no reply.`,
      severity: "urgent",
      owner,
      age: `${m.lastActivityDays}d`,
    });
  } else if (m.unansweredInboundCount > 0) {
    signals.push({
      id: `${c.id}-unanswered`,
      rule: "lead_unanswered",
      title: "Lead unanswered",
      evidence: `${m.unansweredInboundCount} inbound message${m.unansweredInboundCount === 1 ? "" : "s"} waiting · first response ${m.firstResponseMinutes}m.`,
      severity: c.slaMinutes < 0 ? "urgent" : "high",
      owner,
      age: `${c.slaMinutes < 0 ? Math.abs(c.slaMinutes) : m.lastActivityDays}m`,
    });
  }

  if (m.lastMessageFrom === "me" && m.lastActivityDays >= 3) {
    signals.push({
      id: `${c.id}-silent`,
      rule: "customer_went_silent",
      title: "Customer went silent",
      evidence: `Last outbound ${m.lastOutboundAt} · no customer reply for ${m.lastActivityDays} days.`,
      severity: "high",
      owner,
      age: `${m.lastActivityDays}d`,
    });
  }

  if (m.quoteAgeDays !== null && m.quoteAgeDays >= 3) {
    signals.push({
      id: `${c.id}-quote`,
      rule: "quote_no_follow_up",
      title: "Quote needs follow-up",
      evidence: `Quotation sent ${m.quoteAgeDays} days ago with no follow-up.`,
      severity: "medium",
      owner,
      age: `${m.quoteAgeDays}d`,
    });
  }

  const activeStage =
    opportunity && ["qualified", "quotation", "negotiation"].includes(opportunity.stage);
  if (activeStage && m.lastActivityDays >= 7) {
    signals.push({
      id: `${c.id}-inactive`,
      rule: "opportunity_inactive",
      title: "Opportunity inactive",
      evidence: `${opportunity?.name} has had no activity for ${m.lastActivityDays} days.`,
      severity: "medium",
      owner,
      age: `${m.lastActivityDays}d`,
      opportunityId: opportunity?.id,
    });
  }

  if (m.followUpOverdue) {
    signals.push({
      id: `${c.id}-followup`,
      rule: "follow_up_overdue",
      title: "Follow-up overdue",
      evidence: `${m.followUpsDue - m.followUpsCompleted} follow-up still due.`,
      severity: "high",
      owner,
      age: "overdue",
    });
  }

  return signals;
}

export const severityStyles: Record<
  SignalSeverity,
  { label: string; tone: "muted-foreground" | "info" | "warning" | "alert" }
> = {
  low: { label: "Low", tone: "muted-foreground" },
  medium: { label: "Medium", tone: "info" },
  high: { label: "High", tone: "warning" },
  urgent: { label: "Urgent", tone: "alert" },
};
