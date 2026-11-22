import { signal } from "nsh";
import { canTransition, nextStage, stageProbability } from "../domain/stages";
import {
  type Conversation,
  type ConversationAssignment,
  type OpportunityLink,
  type Stage,
  conversations,
} from "../data";

export const inboxScope = signal<"all" | "mine">("all");

export const currentMember = {
  id: "u-david",
  name: "Alex Morgan",
  role: "manager" as const,
  title: "Sales Manager",
};

export const teamMembers = [
  currentMember,
  { id: "u-amina", name: "Aiko Tanaka", role: "sales" as const, title: "Account Executive" },
  { id: "u-yasir", name: "Priya Shah", role: "sales" as const, title: "Senior Closer" },
  { id: "u-moses", name: "Sam Okafor", role: "sales" as const, title: "Field Sales" },
  { id: "u-james", name: "Leo Brandt", role: "sales" as const, title: "Account Executive" },
];

export const assignments = signal<Record<string, ConversationAssignment | null>>(
  Object.fromEntries(
    conversations.map((conversation) => [conversation.id, conversation.assignment]),
  ),
);

export function assignmentFor(conversation: Conversation): ConversationAssignment | null {
  return assignments()[conversation.id] ?? conversation.assignment;
}

export function isAssignedToMe(conversation: Conversation): boolean {
  return assignmentFor(conversation)?.userId === currentMember.id;
}

export function canWriteConversation(conversation: Conversation): boolean {
  return (
    isAssignedToMe(conversation) ||
    currentMember.role === "manager" ||
    currentMember.role === "admin"
  );
}

export function assignConversationTo(conversationId: string, userId: string | null): void {
  const member = userId ? teamMembers.find((row) => row.id === userId) : null;
  assignments.set({
    ...assignments(),
    [conversationId]: member
      ? {
          userId: member.id,
          name: member.name,
          at: "Just now",
          by: currentMember.name,
          source: "manual",
        }
      : null,
  });
}

export const opportunityLinks = signal<OpportunityLink[]>(
  conversations.flatMap((conversation) => conversation.opportunities),
);

export interface StageEvent {
  from: Stage | null;
  to: Stage;
  at: string;
  by: string;
  note?: string;
}

/**
 * Every stage move is recorded so the panel can show an honest timeline and
 * analytics can be computed from history rather than current rows.
 */
export const opportunityStageHistory = signal<Record<string, StageEvent[]>>(
  Object.fromEntries(
    conversations.flatMap((conversation) =>
      conversation.opportunities.map((opportunity) => [
        opportunity.id,
        [
          {
            from: null,
            to: opportunity.stage,
            at: "Earlier",
            by: opportunity.owner,
            note: "Linked from the pipeline.",
          },
        ],
      ]),
    ),
  ),
);

export function historyFor(id: string): StageEvent[] {
  return opportunityStageHistory()[id] ?? [];
}

function recordStageEvent(id: string, event: StageEvent): void {
  opportunityStageHistory.set({
    ...opportunityStageHistory(),
    [id]: [...historyFor(id), event],
  });
}

/** Records a stage move from any surface (panel, recovery, pipeline board). */
export function recordOpportunityStageChange(
  id: string,
  from: Stage,
  to: Stage,
  by: string,
  note?: string,
): void {
  recordStageEvent(id, { from, to, at: "Just now", by, note });
}

export interface OpportunitySource {
  conversationId: string;
  messageId: string;
}

/** The message an opportunity was created from, when the user started there. */
export const opportunitySources = signal<Record<string, OpportunitySource>>({
  "OPP-2025-0123": { conversationId: "sarah", messageId: "sarah-m1" },
});

export function setOpportunitySource(id: string, source: OpportunitySource): void {
  opportunitySources.set({ ...opportunitySources(), [id]: source });
}

export const conversationOpportunityIds = signal<Record<string, string[]>>(
  Object.fromEntries(
    conversations.map((conversation) => [
      conversation.id,
      conversation.opportunities.map((opportunity) => opportunity.id),
    ]),
  ),
);

export function opportunityIdsFor(conversation: Conversation): string[] {
  return conversationOpportunityIds()[conversation.id] ?? [];
}

export function opportunitiesFor(conversation: Conversation): OpportunityLink[] {
  return opportunityIdsFor(conversation)
    .map((id) => opportunityLinks().find((row) => row.id === id))
    .filter((row): row is OpportunityLink => Boolean(row));
}

export type OpportunityActor = {
  name: string;
  role: "sales" | "manager" | "admin";
};

export function canEditOpportunity(
  opportunity: OpportunityLink,
  actor: OpportunityActor = currentMember,
): boolean {
  return actor.role === "manager" || actor.role === "admin" || opportunity.owner === actor.name;
}

export function updateOpportunityLink(id: string, patch: Partial<OpportunityLink>): void {
  opportunityLinks.set(
    opportunityLinks().map((row) => (row.id === id ? { ...row, ...patch } : row)),
  );
}

/**
 * Moves an opportunity to a new stage and returns the updated row, or null when
 * there is nothing to do (unknown id, same stage, or the actor lacks permission).
 * Moving a stage resets probability to that stage's default.
 */
export function moveOpportunityToStage(
  id: string,
  stage: OpportunityLink["stage"],
  actor: OpportunityActor = currentMember,
  note?: string,
): OpportunityLink | null {
  const opportunity = opportunityLinks().find((row) => row.id === id);
  if (
    !opportunity ||
    opportunity.stage === stage ||
    !canTransition(opportunity.stage, stage) ||
    !canEditOpportunity(opportunity, actor)
  ) {
    return null;
  }
  const updated: OpportunityLink = {
    ...opportunity,
    stage,
    probability: stageProbability(stage),
  };
  opportunityLinks.set(opportunityLinks().map((row) => (row.id === id ? updated : row)));
  recordOpportunityStageChange(id, opportunity.stage, stage, actor.name, note);
  return updated;
}

export function advanceOpportunity(
  id: string,
  actor: OpportunityActor = currentMember,
): OpportunityLink | null {
  const opportunity = opportunityLinks().find((row) => row.id === id);
  if (!opportunity) return null;
  const next = nextStage(opportunity.stage);
  return next ? moveOpportunityToStage(id, next, actor) : null;
}

export function linkOpportunity(conversation: Conversation, opportunity: OpportunityLink): void {
  if (!opportunityLinks().some((row) => row.id === opportunity.id)) {
    opportunityLinks.set([opportunity, ...opportunityLinks()]);
  }
  const ids = opportunityIdsFor(conversation);
  if (!ids.includes(opportunity.id)) {
    conversationOpportunityIds.set({
      ...conversationOpportunityIds(),
      [conversation.id]: [...ids, opportunity.id],
    });
  }
  if (historyFor(opportunity.id).length === 0) {
    recordStageEvent(opportunity.id, {
      from: null,
      to: opportunity.stage,
      at: "Just now",
      by: currentMember.name,
      note: "Linked to this conversation.",
    });
  }
}

export function unlinkOpportunity(conversation: Conversation, opportunityId: string): boolean {
  const ids = opportunityIdsFor(conversation);
  if (!ids.includes(opportunityId) || ids.length <= 1) return false;
  conversationOpportunityIds.set({
    ...conversationOpportunityIds(),
    [conversation.id]: ids.filter((id) => id !== opportunityId),
  });
  return true;
}

export function makePrimaryOpportunity(conversation: Conversation, opportunityId: string): void {
  const ids = opportunityIdsFor(conversation).filter((id) => id !== opportunityId);
  conversationOpportunityIds.set({
    ...conversationOpportunityIds(),
    [conversation.id]: [opportunityId, ...ids],
  });
}

export const conversationTags = signal<Record<string, string[]>>(
  Object.fromEntries(conversations.map((conversation) => [conversation.id, conversation.tags])),
);

export function tagsFor(conversation: Conversation): string[] {
  return conversationTags()[conversation.id] ?? conversation.tags;
}

export function addConversationTag(conversation: Conversation, tag: string): void {
  const normalized = tag.trim().replace(/^#/, "");
  if (!normalized) return;
  conversationTags.set({
    ...conversationTags(),
    [conversation.id]: [...new Set([...(conversationTags()[conversation.id] ?? []), normalized])],
  });
}

export function removeConversationTag(conversation: Conversation, tag: string): void {
  conversationTags.set({
    ...conversationTags(),
    [conversation.id]: (conversationTags()[conversation.id] ?? []).filter((row) => row !== tag),
  });
}

export const drafts = signal<Record<string, string>>({});
export function draftFor(conversationId: string): string {
  return drafts()[conversationId] ?? "";
}
export function setDraftFor(conversationId: string, text: string): void {
  drafts.set({ ...drafts(), [conversationId]: text });
}

export const composerPrefill = signal<string | null>(null);
export const assignmentDialogOpen = signal(false);
export const linkOpportunityOpen = signal(false);
export const editOpportunityOpen = signal(false);
export const editingOpportunityId = signal<string | null>(null);
export const tagDialogOpen = signal(false);
export const reminderDialogOpen = signal(false);
export const dismissedSignals = signal<string[]>([]);

export function dismissSignal(id: string): void {
  dismissedSignals.set([...new Set([...dismissedSignals(), id])]);
}
