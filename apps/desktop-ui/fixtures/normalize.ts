import { deals } from "../screens/deals/data";
import { stageProbability } from "../domain/stages";
import type {
  AssignmentSource,
  Conversation,
  ConversationAssignment,
  ConversationMetrics,
  ConversationSeed,
  Message,
  OpportunityLink,
  Presence,
} from "./types";

const contactIds: Record<string, string | null> = {
  sarah: "c1",
  david: "c2",
  james: "c4",
  mary: "c5",
  peter: "c6",
};

const owners: Record<string, { userId: string; name: string; source: AssignmentSource } | null> = {
  sarah: { userId: "u-david", name: "David Mwangi", source: "manual" },
  techworld: { userId: "u-david", name: "David Mwangi", source: "manual" },
  david: { userId: "u-david", name: "David Mwangi", source: "manual" },
  greenmart: { userId: "u-amina", name: "Amina Kimani", source: "round_robin" },
  james: { userId: "u-david", name: "David Mwangi", source: "manual" },
  globalretail: null,
  mary: { userId: "u-david", name: "David Mwangi", source: "manual" },
  summit: { userId: "u-yasir", name: "Yasir Noori", source: "vip" },
  peter: { userId: "u-david", name: "David Mwangi", source: "manual" },
  kenyafix: null,
};

const tags: Record<string, string[]> = {
  sarah: ["VIP", "BulkOrder"],
  techworld: ["PricePushback"],
  david: ["Wholesale"],
  greenmart: ["Repeat"],
  james: ["VIP"],
  globalretail: ["Tender"],
  mary: ["Repeat"],
  summit: ["Distributor"],
  peter: ["Accessories"],
  kenyafix: ["New"],
};

const slaMinutes: Record<string, number> = {
  sarah: 186,
  techworld: 52,
  david: -35,
  greenmart: 226,
  james: 118,
  globalretail: -82,
  mary: 291,
  summit: 74,
  peter: 18,
  kenyafix: 154,
};

const windowMinutes: Record<string, number | null> = {
  sarah: 728,
  techworld: 94,
  david: 1210,
  greenmart: 42,
  james: 486,
  globalretail: -27,
  mary: 1380,
  summit: 12,
  peter: 612,
  kenyafix: 954,
};

const presence: Record<string, Presence> = {
  david: "idle",
  peter: "in_call",
  mary: "online",
};

const ageDays: Record<string, number> = {
  sarah: 4,
  techworld: 2,
  david: 9,
  greenmart: 1,
  james: 6,
  globalretail: 12,
  mary: 3,
  summit: 8,
  peter: 2,
  kenyafix: 1,
};

const lastActivityDays: Record<string, number> = {
  sarah: 0,
  techworld: 0,
  david: 2,
  greenmart: 0,
  james: 1,
  globalretail: 7,
  mary: 0,
  summit: 4,
  peter: 0,
  kenyafix: 3,
};

const quoteAgeDays: Record<string, number | null> = {
  sarah: 2,
  techworld: 4,
  david: null,
  greenmart: null,
  james: 6,
  globalretail: 8,
  mary: null,
  summit: null,
  peter: null,
  kenyafix: null,
};

const followUps: Record<string, { completed: number; due: number; overdue: boolean }> = {
  sarah: { completed: 2, due: 3, overdue: false },
  techworld: { completed: 1, due: 2, overdue: false },
  david: { completed: 1, due: 3, overdue: true },
  greenmart: { completed: 2, due: 2, overdue: false },
  james: { completed: 1, due: 1, overdue: false },
  globalretail: { completed: 0, due: 2, overdue: true },
  mary: { completed: 3, due: 3, overdue: false },
  summit: { completed: 2, due: 3, overdue: false },
  peter: { completed: 1, due: 2, overdue: false },
  kenyafix: { completed: 0, due: 1, overdue: true },
};

const opportunityNames: Record<string, string> = {
  "OPP-2025-0123": "Acme Kenya — Q4 packaging",
  "OPP-2025-0118": "TechWorld — retail display",
  "OPP-2025-0124": "Ochieng & Sons — office audio",
  "OPP-2025-0126": "GreenMart — annual supply",
  "OPP-2025-0119": "Kamau Retail — POS rollout",
  "OPP-2025-0121": "Global Retail — Q1 assortment",
  "OPP-2025-0122": "Atieno Interiors — lighting",
  "OPP-2025-0120": "Summit — distributor terms",
  "OPP-2025-0125": "Mwangi Hardware — accessory bundle",
};

const emailSubjects: Record<string, string> = {
  james: "Re: Revised quotation QT-2025-0045",
  peter: "Catalogue and accessory list",
};

function messageFrom(message: Message): "them" | "me" | null {
  return "from" in message ? message.from : null;
}

function lastMessage(messages: Message[], from: "them" | "me"): string {
  const match = messages.toReversed().find((message) => messageFrom(message) === from);
  return match?.time ?? "—";
}

function responsibilities(seed: ConversationSeed): ConversationAssignment | null {
  const owner = owners[seed.id];
  if (!owner) return null;
  return {
    ...owner,
    at: "Today 09:12",
    by: owner.source === "manual" ? "David Mwangi" : "Routing engine",
  };
}

function linkedOpportunities(seed: ConversationSeed): OpportunityLink[] {
  if (seed.id === "kenyafix" || !seed.opportunityId || seed.opportunityId === "—") return [];
  const owner = owners[seed.id]?.name ?? "Unassigned";
  const matched = deals.find(
    (deal) =>
      deal.id === seed.opportunityId &&
      (deal.contact === seed.name || deal.company === seed.company),
  );
  const primary: OpportunityLink = {
    id: seed.opportunityId,
    name:
      matched?.name ?? opportunityNames[seed.opportunityId] ?? `${seed.company} — new opportunity`,
    stage: matched?.stage ?? seed.opportunityStage,
    value: matched?.value ?? seed.opportunityValue,
    probability: matched?.probability ?? stageProbability(seed.opportunityStage),
    owner: matched?.owner ?? owner,
  };
  if (seed.id === "sarah") {
    const accessory = deals.find((deal) => deal.id === "OPP-2025-0131");
    return [
      primary,
      {
        id: "OPP-2025-0131",
        name: accessory?.name ?? "Acme Kenya — accessory bundle",
        stage: accessory?.stage ?? "enquiry",
        value: accessory?.value ?? "$2,400",
        probability: accessory?.probability ?? stageProbability("enquiry"),
        owner: accessory?.owner ?? owner,
      },
    ];
  }
  return [primary];
}

function metricsFor(seed: ConversationSeed): ConversationMetrics {
  const response = Number.parseInt(seed.responseTime, 10);
  const followUp = followUps[seed.id] ?? { completed: 0, due: 1, overdue: false };
  return {
    firstResponseMinutes: Number.isFinite(response) ? response : 15,
    responseGapCount: seed.id === "david" || seed.id === "globalretail" ? 2 : 0,
    unansweredInboundCount: seed.unread,
    lastInboundAt: lastMessage(seed.messages, "them"),
    lastOutboundAt: lastMessage(seed.messages, "me"),
    followUpsCompleted: followUp.completed,
    followUpsDue: followUp.due,
    followUpOverdue: followUp.overdue,
    ageDays: ageDays[seed.id] ?? 1,
    lastActivityDays: lastActivityDays[seed.id] ?? 0,
    quoteAgeDays: quoteAgeDays[seed.id] ?? null,
    lastMessageFrom:
      messageFrom(seed.messages.at(-1) ?? { kind: "system", text: "", time: "" }) === "me"
        ? "me"
        : "them",
  };
}

function normalizedMessages(seed: ConversationSeed): Message[] {
  const messages = seed.messages.map((message) => {
    if (
      seed.id === "sarah" &&
      message.kind === "text" &&
      message.from === "me" &&
      message.text.startsWith("Sure")
    ) {
      return {
        ...message,
        replyTo: {
          from: "Sarah Wanjiku",
          text: "Can you share the latest pricing for 50 units?",
        },
      };
    }
    return message;
  });
  if (seed.id === "david") {
    return messages.map((message) =>
      message.kind === "text" && message.from === "me"
        ? { ...message, read: false, status: "failed" as const }
        : message,
    );
  }
  if (seed.id === "mary") {
    messages.push({ kind: "audio", from: "them", duration: "0:19", time: "2:58 PM" });
  }
  return messages;
}

export function normalizeConversation(seed: ConversationSeed): Conversation {
  const assignment = responsibilities(seed);
  return {
    id: seed.id,
    contactId: contactIds[seed.id] ?? null,
    name: seed.name,
    company: seed.company,
    photo: seed.photo,
    initials: seed.initials,
    tone: seed.tone,
    channel: seed.channel,
    channelAccount:
      seed.channel === "whatsapp" ? "WhatsApp · +254 700 100 200" : "sales@acmetrading.co.ke",
    subject: emailSubjects[seed.id],
    preview: seed.preview,
    time: seed.time,
    unread: seed.unread,
    verified: seed.verified,
    vip: seed.vip,
    engagement: seed.engagement,
    interest: seed.interest,
    presence: presence[seed.id] ?? (seed.online ? "online" : "offline"),
    typing: seed.id === "mary",
    phone: seed.phone,
    email: seed.email,
    location: seed.location,
    opportunities: linkedOpportunities(seed),
    assignment,
    tags: tags[seed.id] ?? [],
    slaMinutes: slaMinutes[seed.id] ?? 240,
    windowMinutes: seed.channel === "whatsapp" ? (windowMinutes[seed.id] ?? 300) : null,
    metrics: metricsFor(seed),
    messages: normalizedMessages(seed),
  };
}
