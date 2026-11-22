/**
 * Canonical pipeline stages.
 *
 * Stage order, labels, and default probabilities live here so the inbox,
 * pipeline board, and fixtures cannot drift apart. Probabilities are defaults
 * applied on a stage move; a user can still override them per opportunity.
 */
export const openStages = ["enquiry", "qualified", "quotation", "negotiation", "won"] as const;

export type DealStage = (typeof openStages)[number];

export const stageOrder = [...openStages, "lost"] as const;
export type Stage = (typeof stageOrder)[number];

interface StageDefinition {
  label: string;
  probability: number;
}

const definitions: Record<Stage, StageDefinition> = {
  enquiry: { label: "Enquiry", probability: 20 },
  qualified: { label: "Qualified", probability: 40 },
  quotation: { label: "Quotation", probability: 65 },
  negotiation: { label: "Negotiation", probability: 80 },
  won: { label: "Won", probability: 100 },
  lost: { label: "Lost", probability: 0 },
};

export const stageLabels: { id: Stage; label: string }[] = stageOrder.map((id) => ({
  id,
  label: definitions[id].label,
}));

export function stageLabel(stage: Stage): string {
  return definitions[stage].label;
}

export function stageProbability(stage: Stage): number {
  return definitions[stage].probability;
}

export function stageIndex(stage: Stage): number {
  return stageOrder.indexOf(stage);
}

/** The next open stage, or null at a terminal stage. */
export function nextStage(stage: Stage): DealStage | null {
  const index = stageOrder.indexOf(stage);
  if (index < 0 || index >= openStages.length - 1) return null;
  return openStages[index + 1];
}

/**
 * The only moves an opportunity may make. Forward moves follow the pipeline;
 * `lost` can close an open opportunity, and reopening returns to qualified.
 * Terminal stages do not silently accept arbitrary jumps.
 */
export const stageTransitions: Record<Stage, readonly Stage[]> = {
  enquiry: ["qualified", "lost"],
  qualified: ["quotation", "lost"],
  quotation: ["negotiation", "won", "lost"],
  negotiation: ["won", "lost"],
  won: ["qualified"],
  lost: ["qualified"],
};

export function allowedTransitions(stage: Stage): Stage[] {
  return [...stageTransitions[stage]];
}

export function canTransition(from: Stage, to: Stage): boolean {
  return stageTransitions[from].includes(to);
}
