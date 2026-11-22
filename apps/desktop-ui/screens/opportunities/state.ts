import { signal } from "nsh";

export interface OpportunityDraft {
  conversationId: string;
  sourceMessageId?: string;
}

/** Create flow, optionally anchored to the message that started the deal. */
export const newOpportunityOpen = signal(false);
export const opportunityDraft = signal<OpportunityDraft | null>(null);
export const lostOpportunityId = signal<string | null>(null);

export function openNewOpportunity(conversationId: string, sourceMessageId?: string): void {
  opportunityDraft.set({ conversationId, sourceMessageId });
  newOpportunityOpen.set(true);
}

export function closeNewOpportunity(): void {
  newOpportunityOpen.set(false);
  opportunityDraft.set(null);
}

export function requestLostReason(id: string): void {
  lostOpportunityId.set(id);
}

export function closeLostReason(): void {
  lostOpportunityId.set(null);
}
