import { activeNav, activeNavChild } from "../../state";
import {
  currentMember,
  linkOpportunity,
  makePrimaryOpportunity,
  moveOpportunityToStage,
  opportunityIdsFor,
  opportunityLinks,
  teamMembers,
  unlinkOpportunity,
  updateOpportunityLink,
} from "../../state/inbox";
import { stageLabel, stageOrder } from "../../domain/stages";
import type { Conversation, OpportunityLink } from "../../data";
import type { QuoteRow } from "../quotes/data";
import {
  dealRows,
  dealSearch,
  dealStageFilter,
  dealOwnerFilter,
  pipelineScope,
} from "../deals/state";
import { dealDetail } from "../deals/state";
import type { Deal } from "../deals/data";
import {
  quoteBuilderOpen,
  quoteCustomerPrefill,
  quoteDetail,
  quotePdf,
  quoteRows,
  quoteTab,
} from "../quotes/state";

export const opportunityStages: OpportunityLink["stage"][] = [...stageOrder];

export function setOpportunityStage(
  id: string,
  stage: OpportunityLink["stage"],
): OpportunityLink | null {
  const moved = moveOpportunityToStage(id, stage);
  if (!moved) return null;
  const deal = dealRows().find((row) => row.id === id);
  if (!deal) return moved;
  const updated: Deal = { ...deal, stage: moved.stage, probability: moved.probability };
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

export function createQuoteFromOpportunity(
  conversation: Conversation,
  opportunity: OpportunityLink,
): void {
  quoteCustomerPrefill.set({ customer: conversation.company, opportunity: opportunity.name });
  quoteTab.set("all");
  activeNavChild.set("quotes");
  activeNav.set("Quotes");
  quoteBuilderOpen.set(true);
}

export function quoteForOpportunity(id: string): QuoteRow | null {
  const deal = dealRows().find((row) => row.id === id);
  if (!deal || deal.quoteId === "—") return null;
  return quoteRows().find((quote) => quote.id === deal.quoteId) ?? null;
}

export function openQuoteForOpportunity(id: string): void {
  const quote = quoteForOpportunity(id);
  if (!quote) return;
  quoteTab.set("all");
  activeNavChild.set("quotes");
  activeNav.set("Quotes");
  quoteDetail.set(quote);
  quotePdf.set(null);
}

export function openPipelineForOpportunity(id: string): void {
  dealSearch.set(id);
  dealStageFilter.set("all");
  dealOwnerFilter.set("All owners");
  pipelineScope.set("all");
  activeNavChild.set("deals");
  activeNav.set("Deals");
}

export function unlinkConversationOpportunity(conversation: Conversation, id: string): void {
  unlinkOpportunity(conversation, id);
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
