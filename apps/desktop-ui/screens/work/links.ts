import type { IconName } from "../../components/ui";
import type { Conversation, Message } from "../../data";
import type { Channel } from "../../data";
import type { Deal } from "../deals/data";
import type { ContactRow } from "../contacts/data";
import type { MailItem } from "../inbox/mail";
import type { Product } from "../catalog/data";
import type { QuoteRow } from "../quotes/data";
import type { WorkEntityType, WorkLink } from "./types";

const typeLabels: Record<WorkEntityType, string> = {
  conversation: "Conversation",
  message: "Message",
  email: "Email thread",
  contact: "Contact",
  company: "Company",
  opportunity: "Opportunity",
  quote: "Quote",
  product: "Product",
};

const typeIcons: Record<WorkEntityType, IconName> = {
  conversation: "messageCircle",
  message: "messageCircle",
  email: "mail",
  contact: "users",
  company: "briefcase",
  opportunity: "briefcase",
  quote: "fileText",
  product: "package",
};

const channelLabel: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
};

export function workLinkLabel(type: WorkEntityType): string {
  return typeLabels[type];
}

export function workLinkIcon(type: WorkEntityType): IconName {
  return typeIcons[type];
}

export function linkKey(link: WorkLink): string {
  return `${link.type}:${link.id}`;
}

export function sameLink(a: WorkLink, b: WorkLink): boolean {
  return a.type === b.type && a.id === b.id;
}

/** True when `candidate` is the link itself or lives inside it. */
export function linkMatches(candidate: WorkLink, target: WorkLink): boolean {
  if (sameLink(candidate, target)) return true;
  return (
    target.type === "conversation" &&
    candidate.type === "message" &&
    candidate.id.startsWith(`${target.id}::`)
  );
}

export function conversationLink(conversation: Conversation): WorkLink {
  return {
    type: "conversation",
    id: conversation.id,
    label: `${channelLabel[conversation.channel]} conversation`,
    detail: `${conversation.name} · ${conversation.company}`,
  };
}

export function companyLink(name: string, detail = "Company"): WorkLink {
  return {
    type: "company",
    id: `company-${name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}`,
    label: name,
    detail,
  };
}

export function messageLink(conversation: Conversation, message: Message): WorkLink {
  const label =
    message.kind === "file"
      ? message.fileName
      : message.kind === "image"
        ? "Image"
        : message.kind === "audio"
          ? "Voice note"
          : message.kind === "system" || message.kind === "whisper"
            ? message.text
            : message.text;
  return {
    type: "message",
    id: `${conversation.id}::${message.id}`,
    label: label.length > 64 ? `${label.slice(0, 61)}…` : label,
    detail: `${conversation.name} · ${channelLabel[conversation.channel]}`,
  };
}

export function emailThreadLink(item: MailItem): WorkLink {
  return {
    type: "email",
    id: item.id,
    label: item.subject,
    detail: `${item.from} · ${item.folder}`,
  };
}

export function contactLink(contact: ContactRow): WorkLink {
  return {
    type: "contact",
    id: contact.id,
    label: contact.name,
    detail: `${contact.company} · ${contact.role}`,
  };
}

export function opportunityLink(deal: Deal): WorkLink {
  return {
    type: "opportunity",
    id: deal.id,
    label: deal.name,
    detail: `${deal.company} · ${deal.value}`,
  };
}

export function quoteLink(quote: QuoteRow): WorkLink {
  return {
    type: "quote",
    id: quote.id,
    label: quote.id,
    detail: `${quote.customer} · ${quote.value}`,
  };
}

export function productLink(product: Product): WorkLink {
  return {
    type: "product",
    id: product.id,
    label: product.name,
    detail: `${product.sku} · ${product.category}`,
  };
}

export function createTaskLinkContext(links: WorkLink[]): {
  conversationId?: string;
  opportunityId?: string;
} {
  const conversation = links.find((link) => link.type === "conversation");
  const opportunity = links.find((link) => link.type === "opportunity");
  return {
    ...(conversation ? { conversationId: conversation.id } : {}),
    ...(opportunity ? { opportunityId: opportunity.id } : {}),
  };
}
