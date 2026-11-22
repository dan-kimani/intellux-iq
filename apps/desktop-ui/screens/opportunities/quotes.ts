import { activeNav, activeNavChild } from "../../state";
import { opportunityLinks, updateOpportunityLink } from "../../state/inbox";
import type { Conversation, OpportunityLink } from "../../data";
import type { Deal } from "../deals/data";
import { dealDetail, dealRows } from "../deals/state";
import type { QuoteRow } from "../quotes/data";
import {
  quoteBuilderOpen,
  quoteCustomerPrefill,
  quoteDetail,
  quotePdf,
  quoteRows,
  quoteTab,
} from "../quotes/state";

export function createQuoteFromOpportunity(
  conversation: Conversation,
  opportunity: OpportunityLink,
): void {
  quoteCustomerPrefill.set({ customer: conversation.company, opportunity: opportunity.name });
  quoteBuilderOpen.set(true);
}

export function quoteForOpportunity(id: string): QuoteRow | null {
  const deal = dealRows().find((row) => row.id === id);
  const link = opportunityLinks().find((row) => row.id === id);
  const quoteId = deal && deal.quoteId !== "—" ? deal.quoteId : link?.quoteId;
  if (!quoteId) return null;
  return quoteRows().find((quote) => quote.id === quoteId) ?? null;
}

/** Links a newly drafted quote back to the opportunity it names. */
export function linkQuoteToOpportunity(quote: QuoteRow): void {
  const deal = dealRows().find((row) => row.name === quote.opportunity);
  if (deal) {
    const updated: Deal = { ...deal, quoteId: quote.id, lastActivity: "Just now" };
    dealRows.set(dealRows().map((row) => (row.id === deal.id ? updated : row)));
    if (dealDetail()?.id === deal.id) dealDetail.set(updated);
  }
  const link = opportunityLinks().find((row) => row.name === quote.opportunity);
  if (link) updateOpportunityLink(link.id, { quoteId: quote.id });
}

export function openQuoteForOpportunity(id: string): void {
  const quote = quoteForOpportunity(id);
  if (!quote) return;
  openQuoteRecord(quote);
}

export function openQuoteRecord(quote: QuoteRow): void {
  quoteTab.set("all");
  activeNavChild.set("quotes");
  activeNav.set("Quotes");
  quoteDetail.set(quote);
  quotePdf.set(null);
}
