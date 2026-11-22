import { allConversations } from "../../state";
import {
  conversationOpportunityIds,
  opportunityLinks,
  opportunitySources,
  opportunityStageHistory,
  type StageEvent,
} from "../../state/inbox";
import type { Conversation, Stage } from "../../data";
import { dealRows } from "../deals/state";

export interface OpportunityDetail {
  id: string;
  name: string;
  stage: Stage;
  value: string;
  probability: number;
  owner: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  product: string;
  expectedClose: string;
  quoteId: string;
  lastActivity: string;
  nextStep: string;
  notes: string;
  age: string;
  source: { conversationId: string; messageId: string } | null;
  history: StageEvent[];
  linkedConversations: Conversation[];
  linked: boolean;
}

export function opportunityDetailFor(id: string): OpportunityDetail | null {
  const deal = dealRows().find((row) => row.id === id);
  const link = opportunityLinks().find((row) => row.id === id);
  if (!deal && !link) return null;
  const linkedConversations = allConversations().filter((conversation) =>
    (conversationOpportunityIds()[conversation.id] ?? []).includes(id),
  );
  const fallback = linkedConversations[0];
  const stage = deal?.stage ?? link!.stage;
  const owner = deal?.owner ?? link!.owner;
  const history = opportunityStageHistory()[id] ?? [
    { from: null, to: stage, at: "Earlier", by: owner, note: "Linked from the pipeline." },
  ];
  return {
    id,
    name: deal?.name ?? link!.name,
    stage,
    value: deal?.value ?? link!.value,
    probability: deal?.probability ?? link!.probability,
    owner,
    company: deal?.company ?? fallback?.company ?? "—",
    contact: deal?.contact ?? fallback?.name ?? "—",
    email: deal?.email ?? fallback?.email ?? "—",
    phone: deal?.phone ?? fallback?.phone ?? "—",
    product: deal?.product ?? link!.product ?? "Catalog selection",
    expectedClose: deal?.expectedClose ?? link!.expectedClose ?? "Not set",
    quoteId: deal?.quoteId ?? link!.quoteId ?? "—",
    lastActivity: deal?.lastActivity ?? "Earlier",
    nextStep: deal?.nextStep ?? link!.nextStep ?? "Qualify the opportunity",
    notes: deal?.notes ?? "",
    age: deal?.age ?? "Earlier",
    source: opportunitySources()[id] ?? null,
    history,
    linkedConversations,
    linked: linkedConversations.length > 0,
  };
}
