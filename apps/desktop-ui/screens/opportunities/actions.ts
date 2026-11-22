import { activeNav, activeNavChild, allConversations } from "../../state";
import {
  currentMember,
  linkOpportunity,
  makePrimaryOpportunity,
  moveOpportunityToStage,
  opportunityIdsFor,
  opportunityLinks,
  opportunitySources,
  setOpportunitySource,
  teamMembers,
  unlinkOpportunity,
  updateOpportunityLink,
} from "../../state/inbox";
import { allowedTransitions, stageLabel, stageOrder, stageProbability } from "../../domain/stages";
import type { Conversation, OpportunityLink, Stage } from "../../data";
import {
  dealRows,
  dealSearch,
  dealStageFilter,
  dealOwnerFilter,
  pipelineScope,
} from "../deals/state";
import { dealDetail } from "../deals/state";
import type { Deal } from "../deals/data";

export const opportunityStages: OpportunityLink["stage"][] = [...stageOrder];

export function transitionOptions(stage: OpportunityLink["stage"]): OpportunityLink["stage"][] {
  return allowedTransitions(stage);
}

export function setOpportunityStage(
  id: string,
  stage: OpportunityLink["stage"],
  note?: string,
): OpportunityLink | null {
  const moved = moveOpportunityToStage(id, stage, currentMember, note);
  if (!moved) return null;
  const deal = dealRows().find((row) => row.id === id);
  if (!deal) return moved;
  const updated: Deal = {
    ...deal,
    stage: moved.stage,
    probability: moved.probability,
    ...(stage === "won"
      ? { expectedClose: "Won" }
      : stage === "lost"
        ? { expectedClose: "Lost" }
        : deal.stage === "won" || deal.stage === "lost"
          ? { expectedClose: "Not set" }
          : {}),
  };
  dealRows.set(dealRows().map((row) => (row.id === id ? updated : row)));
  if (dealDetail()?.id === id) dealDetail.set(updated);
  return moved;
}

export function setOpportunityOwner(id: string, owner: string): void {
  updateOpportunityLink(id, { owner });
  const deal = dealRows().find((row) => row.id === id);
  if (!deal) return;
  const updated: Deal = { ...deal, owner };
  dealRows.set(dealRows().map((row) => (row.id === id ? updated : row)));
  if (dealDetail()?.id === id) dealDetail.set(updated);
}

export function setOpportunityValue(id: string, value: string, probability: number): void {
  updateOpportunityLink(id, { value, probability });
  const deal = dealRows().find((row) => row.id === id);
  if (!deal) return;
  const updated: Deal = { ...deal, value, probability };
  dealRows.set(dealRows().map((row) => (row.id === id ? updated : row)));
  if (dealDetail()?.id === id) dealDetail.set(updated);
}

export function openPipelineForOpportunity(id: string): void {
  dealSearch.set(id);
  dealStageFilter.set("all");
  dealOwnerFilter.set("All owners");
  pipelineScope.set("all");
  activeNavChild.set("deals");
  activeNav.set("Deals");
}

export function unlinkConversationOpportunity(conversation: Conversation, id: string): boolean {
  if (opportunitySources()[id]?.conversationId === conversation.id) return false;
  return unlinkOpportunity(conversation, id);
}

export function makePrimary(conversation: Conversation, id: string): void {
  makePrimaryOpportunity(conversation, id);
}

export function linkDeal(conversation: Conversation, deal: Deal): void {
  const link: OpportunityLink = {
    id: deal.id,
    name: deal.name,
    stage: deal.stage,
    value: deal.value,
    probability: deal.probability,
    owner: deal.owner,
  };
  linkOpportunity(conversation, link);
}

export function unlinkedDeals(conversation: Conversation): Deal[] {
  const linked = opportunityIdsFor(conversation);
  return dealRows().filter((deal) => {
    if (linked.includes(deal.id)) return false;
    return deal.contact === conversation.name || deal.company === conversation.company;
  });
}

export function opportunityOwnerOptions(): string[] {
  return [
    currentMember.name,
    ...teamMembers.filter((m) => m.id !== currentMember.id).map((m) => m.name),
  ];
}

export function opportunityMeta(id: string): string {
  const deal = dealRows().find((row) => row.id === id);
  return deal ? `${stageLabel(deal.stage)} · ${deal.expectedClose}` : "";
}

export function allLinkedOpportunityIds(): string[] {
  return opportunityLinks().map((row) => row.id);
}

export interface OpportunityListRow {
  id: string;
  name: string;
  stage: Stage;
  value: string;
  owner: string;
  lastActivity: string;
  linked: boolean;
}

function listRowFor(id: string, linkedIds: string[]): OpportunityListRow | null {
  const link = opportunityLinks().find((row) => row.id === id);
  const deal = dealRows().find((row) => row.id === id);
  if (!link && !deal) return null;
  return {
    id,
    name: deal?.name ?? link!.name,
    stage: deal?.stage ?? link!.stage,
    value: deal?.value ?? link!.value,
    owner: deal?.owner ?? link!.owner,
    lastActivity: deal?.lastActivity ?? "Earlier",
    linked: linkedIds.includes(id),
  };
}

/** Opportunities in this conversation, or every opportunity for the contact. */
export function opportunityRowsFor(
  conversation: Conversation,
  scope: "conversation" | "contact",
): OpportunityListRow[] {
  const linkedIds = opportunityIdsFor(conversation);
  const linked = linkedIds
    .map((id) => listRowFor(id, linkedIds))
    .filter((row): row is OpportunityListRow => Boolean(row));
  if (scope === "conversation") return linked;
  const linkedAnywhere = new Set(opportunityLinks().map((link) => link.id));
  const contact = dealRows()
    .filter(
      (deal) =>
        (deal.contact === conversation.name || deal.company === conversation.company) &&
        linkedAnywhere.has(deal.id),
    )
    .map((deal) => listRowFor(deal.id, linkedIds))
    .filter((row): row is OpportunityListRow => Boolean(row));
  const seen = new Set(contact.map((row) => row.id));
  return [...contact, ...linked.filter((row) => !seen.has(row.id))];
}

function nextOpportunityId(): string {
  const highest = dealRows().reduce((value, deal) => {
    const match = /^OPP-\d{4}-(\d+)$/.exec(deal.id);
    return match ? Math.max(value, Number(match[1])) : value;
  }, 0);
  return `OPP-2025-${String(highest + 1).padStart(4, "0")}`;
}

export function createOpportunity(input: {
  conversation: Conversation;
  name: string;
  value: string;
  product: string;
  stage: Stage;
  owner: string;
  expectedClose: string;
  nextStep: string;
  sourceMessageId?: string;
}): Deal {
  const conversation = input.conversation;
  const deal: Deal = {
    id: nextOpportunityId(),
    name: input.name.trim(),
    company: conversation.company,
    value: input.value.trim() || "$0",
    owner: input.owner,
    age: "Just now",
    stage: input.stage,
    product: input.product.trim() || "Catalog selection",
    contact: conversation.name,
    email: conversation.email,
    phone: conversation.phone,
    probability: stageProbability(input.stage),
    expectedClose: input.expectedClose.trim() || "Not set",
    quoteId: "—",
    lastActivity: "Just now",
    nextStep: input.nextStep.trim() || "Qualify the opportunity",
    notes: "Created from the conversation.",
  };
  dealRows.set([deal, ...dealRows()]);
  linkDeal(conversation, deal);
  if (input.sourceMessageId) {
    setOpportunitySource(deal.id, {
      conversationId: conversation.id,
      messageId: input.sourceMessageId,
    });
  }
  return deal;
}

export function updateOpportunityDetails(
  id: string,
  patch: Partial<
    Pick<Deal, "value" | "probability" | "product" | "expectedClose" | "nextStep" | "owner">
  >,
): void {
  const deal = dealRows().find((row) => row.id === id);
  if (deal) {
    const updated: Deal = { ...deal, ...patch };
    dealRows.set(dealRows().map((row) => (row.id === id ? updated : row)));
    if (dealDetail()?.id === id) dealDetail.set(updated);
    updateOpportunityLink(id, {
      value: updated.value,
      probability: updated.probability,
      owner: updated.owner,
    });
    return;
  }
  updateOpportunityLink(id, {
    ...(patch.value === undefined ? {} : { value: patch.value }),
    ...(patch.probability === undefined ? {} : { probability: patch.probability }),
    ...(patch.owner === undefined ? {} : { owner: patch.owner }),
    ...(patch.product === undefined ? {} : { product: patch.product }),
    ...(patch.expectedClose === undefined ? {} : { expectedClose: patch.expectedClose }),
    ...(patch.nextStep === undefined ? {} : { nextStep: patch.nextStep }),
  });
}

export function conversationsForOpportunity(id: string): Conversation[] {
  return allConversations().filter((conversation) => opportunityIdsFor(conversation).includes(id));
}
