import { currentMember, allConversations } from "../../state";
import { dealRows } from "../deals/state";
import { conversationLink, opportunityLink } from "./links";
import type { WorkActivity } from "./types";

export function initialActivity(): WorkActivity[] {
  const conversation = allConversations().find((row) => row.id === "sarah");
  const deal = dealRows().find((row) => row.id === "OPP-2025-0123");
  if (!conversation) return [];
  return [
    {
      id: "work-activity-1",
      kind: "call",
      title: "Walked Maya through the revised packaging timeline",
      notes: "She will confirm artwork by Thursday.",
      occurredAt: "Today · 09:10",
      actor: currentMember.name,
      links: [conversationLink(conversation), ...(deal ? [opportunityLink(deal)] : [])],
      source: "manual",
    },
  ];
}
