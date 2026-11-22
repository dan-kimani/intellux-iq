import { signal, type AnimatedValue } from "nsh";
import { canTransition, nextStage, stageLabel } from "../../domain/stages";
import {
  currentUser,
  opportunityLinks,
  recordOpportunityStageChange,
  updateOpportunityLink,
} from "../../state";
import { deals, type Deal, type DealStage } from "./data";
import { moneyText } from "../../lib/money";

export { stageLabel };

export const dealRows = signal<Deal[]>(deals);
export const dealDetail = signal<Deal | null>(null);
export interface DealAnchor {
  left: number;
  top: number;
  width: number;
  height: number;
  side: "left" | "right";
  cardLeft: number;
  cardTop: number;
  cardWidth: number;
  cardHeight: number;
}
export const JOIN_CUT = 20;
export const dealAnchor = signal<DealAnchor | null>(null);
export interface DealDragState {
  deal: Deal;
  left: number;
  top: number;
  width: number;
  x: AnimatedValue;
  y: AnimatedValue;
}
export const dealDrag = signal<DealDragState | null>(null);
export const newDealOpen = signal(false);
export const dealStageFilter = signal<DealStage | "all">("all");
export const dealOwnerFilter = signal("All owners");
export const dealSearch = signal("");
export type PipelineScope = "all" | "my" | "team";
export const pipelineScope = signal<PipelineScope>("all");
export const pipelineView = signal<"table" | "board">("table");

export function moveDealToStage(id: string, stage: DealStage, force = false): Deal | null {
  const source = dealRows().find((row) => row.id === id);
  if (!source || (!force && !canTransition(source.stage, stage))) return null;
  const updated: Deal = { ...source, stage };
  dealRows.set(dealRows().map((row) => (row.id === id ? updated : row)));
  if (dealDetail()?.id === id) dealDetail.set(updated);
  const link = opportunityLinks().find((row) => row.id === id);
  if (link && link.stage !== stage) {
    updateOpportunityLink(id, { stage, probability: updated.probability });
    recordOpportunityStageChange(
      id,
      link.stage,
      stage,
      currentUser,
      "Moved from the pipeline board.",
    );
  }
  return updated;
}

export function advanceDealRow(id: string): Deal | null {
  const deal = dealRows().find((row) => row.id === id);
  if (!deal) return null;
  const next = nextStage(deal.stage);
  return next ? moveDealToStage(id, next) : null;
}

export function filteredDeals(): Deal[] {
  const stage = dealStageFilter();
  const owner = dealOwnerFilter();
  const scope = pipelineScope();
  const query = dealSearch().trim().toLowerCase();
  return dealRows()
    .filter((deal) => {
      if (stage !== "all" && deal.stage !== stage) return false;
      if (scope === "my" && deal.owner !== currentUser) return false;
      if (scope === "team" && deal.owner === "Unassigned") return false;
      if (owner !== "All owners" && deal.owner !== owner) return false;
      if (
        query &&
        !`${deal.id} ${deal.name} ${deal.company} ${deal.product}`.toLowerCase().includes(query)
      )
        return false;
      return true;
    })
    .map((deal) => ({ ...deal, value: moneyText(deal.value) }));
}

export function pipelineScopeCounts(): Record<PipelineScope, number> {
  const rows = dealRows();
  return {
    all: rows.length,
    my: rows.filter((deal) => deal.owner === currentUser).length,
    team: rows.filter((deal) => deal.owner !== "Unassigned").length,
  };
}

export function activeDealFilterCount(): number {
  return (
    (dealStageFilter() === "all" ? 0 : 1) +
    (dealOwnerFilter() === "All owners" ? 0 : 1) +
    (dealSearch().trim() ? 1 : 0)
  );
}
