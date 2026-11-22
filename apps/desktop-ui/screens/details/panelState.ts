import { signal } from "nsh";
import { detailsPanelOpen } from "../../state";

export type DetailTab = "contact" | "opportunities" | "work" | "insights";

/** The side-panel tab, kept global so the chat header can open it. */
export const detailTab = signal<DetailTab>("contact");

/** When set, the panel shows one opportunity instead of the tabbed home. */
export const panelOpportunityId = signal<string | null>(null);
export const panelConversationId = signal<string | null>(null);

export function opportunityOpenFor(conversationId: string): boolean {
  return panelOpportunityId() !== null && panelConversationId() === conversationId;
}

/** The opportunity list keeps its scope when the detail view opens and closes. */
export const opportunityScope = signal<"conversation" | "contact">("conversation");

export function openOpportunitiesTab(): void {
  detailTab.set("opportunities");
  panelOpportunityId.set(null);
  panelConversationId.set(null);
  detailsPanelOpen.set(true);
}

export function openOpportunityPanel(id: string, conversationId: string): void {
  detailTab.set("opportunities");
  panelOpportunityId.set(id);
  panelConversationId.set(conversationId);
  detailsPanelOpen.set(true);
}

export function closeOpportunityPanel(): void {
  panelOpportunityId.set(null);
  panelConversationId.set(null);
}
