import { expect, test } from "nsh/test";
import {
  allowedTransitions,
  canTransition,
  nextStage,
  openStages,
  stageIndex,
  stageLabel,
  stageProbability,
} from "./domain/stages";
import type { OpportunityLink } from "./data";
import {
  moveOpportunityToStage,
  opportunityIdsFor,
  opportunityLinks,
  unlinkOpportunity,
  updateOpportunityLink,
} from "./state/inbox";
import { conversations } from "./data";
import { dealRows } from "./screens/deals/state";
import { setOpportunityStage } from "./screens/opportunities/actions";

const opportunityId = "OPP-2025-0123";

function opportunity(): OpportunityLink {
  const row = opportunityLinks().find((item) => item.id === opportunityId);
  if (!row) throw new Error(`Missing fixture ${opportunityId}`);
  return row;
}

function restoreOpportunity(original: OpportunityLink): void {
  opportunityLinks.set(opportunityLinks().map((row) => (row.id === original.id ? original : row)));
}

test("uses one canonical table for stage order, labels, and probabilities", () => {
  expect(openStages).toEqual(["enquiry", "qualified", "quotation", "negotiation", "won"]);
  expect(stageProbability("enquiry")).toBe(20);
  expect(stageProbability("qualified")).toBe(40);
  expect(stageProbability("quotation")).toBe(65);
  expect(stageProbability("negotiation")).toBe(80);
  expect(stageProbability("won")).toBe(100);
  expect(stageProbability("lost")).toBe(0);
  expect(stageLabel("lost")).toBe("Lost");
  expect(stageIndex("lost")).toBe(5);
});

test("advances through open stages and stops at a terminal stage", () => {
  expect(nextStage("enquiry")).toBe("qualified");
  expect(nextStage("quotation")).toBe("negotiation");
  expect(nextStage("negotiation")).toBe("won");
  expect(nextStage("won")).toBeNull();
  expect(nextStage("lost")).toBeNull();
});

test("moves once and preserves an edited probability on a same-stage no-op", () => {
  const original = opportunity();
  try {
    const moved = moveOpportunityToStage(opportunityId, "negotiation");
    expect(moved).toMatchObject({ stage: "negotiation", probability: 80 });

    updateOpportunityLink(opportunityId, { probability: 72 });
    expect(moveOpportunityToStage(opportunityId, "negotiation")).toBeNull();
    expect(opportunity().probability).toBe(72);
  } finally {
    restoreOpportunity(original);
  }
});

test("refuses a sales user who does not own the opportunity", () => {
  const original = opportunity();
  try {
    const denied = moveOpportunityToStage(opportunityId, "won", {
      name: "Aiko Tanaka",
      role: "sales",
    });
    expect(denied).toBeNull();
    expect(opportunity().stage).toBe(original.stage);

    const owner = moveOpportunityToStage(opportunityId, "negotiation", {
      name: original.owner,
      role: "sales",
    });
    expect(owner?.stage).toBe("negotiation");

    const admin = moveOpportunityToStage(opportunityId, "won", {
      name: "Admin",
      role: "admin",
    });
    expect(admin?.stage).toBe("won");
  } finally {
    restoreOpportunity(original);
  }
});

test("mirrors a stage move onto the linked deal", () => {
  const original = opportunity();
  const originalDeal = dealRows().find((row) => row.id === opportunityId);
  try {
    const moved = setOpportunityStage(opportunityId, "won");
    expect(moved).toMatchObject({ stage: "won", probability: 100 });
    expect(dealRows().find((row) => row.id === opportunityId)).toMatchObject({
      stage: "won",
      probability: 100,
    });
  } finally {
    restoreOpportunity(original);
    if (originalDeal) {
      dealRows.set(dealRows().map((row) => (row.id === opportunityId ? originalDeal : row)));
    }
  }
});

test("maps the valid stage transitions", () => {
  expect(allowedTransitions("enquiry")).toEqual(["qualified", "lost"]);
  expect(canTransition("enquiry", "negotiation")).toBe(false);
  expect(canTransition("quotation", "won")).toBe(true);
  expect(canTransition("won", "qualified")).toBe(true);
});

test("refuses an invalid stage jump", () => {
  const original = opportunity();
  try {
    expect(moveOpportunityToStage(opportunityId, "enquiry")).toBeNull();
    expect(opportunity().stage).toBe(original.stage);
  } finally {
    restoreOpportunity(original);
  }
});

test("never detaches the last conversation from an opportunity", () => {
  const conversation = conversations.find((row) => row.id === "david");
  if (!conversation) throw new Error("Missing Alex fixture");
  const onlyId = opportunityIdsFor(conversation)[0];
  expect(unlinkOpportunity(conversation, onlyId)).toBe(false);
  expect(opportunityIdsFor(conversation)).toContain(onlyId);
});
