import { allConversations } from "../../state";
import { contacts } from "../contacts/data";
import { dealRows } from "../deals/state";
import { mailRows } from "../inbox/mail";
import { quoteRows } from "../quotes/state";
import type { FollowUpKind } from "../home/data";
import { companyLink, contactLink, conversationLink, emailThreadLink, messageLink } from "./links";
import type { WorkLink } from "./types";

function pushUnique(links: WorkLink[], link: WorkLink | null): void {
  if (!link) return;
  if (links.some((row) => row.type === link.type && row.id === link.id)) return;
  links.push(link);
}

function contactRecord(name: string, email?: string, contactId?: string | null) {
  return contacts.find(
    (row) =>
      (contactId && row.id === contactId) ||
      row.name.trim().toLowerCase() === name.trim().toLowerCase() ||
      (email ? row.email.toLowerCase() === email.toLowerCase() : false),
  );
}

function addCustomer(links: WorkLink[], company: string, name: string, email?: string) {
  const contact = contactRecord(name, email);
  if (contact) pushUnique(links, contactLink(contact));
  pushUnique(links, companyLink(company));
}

export function contextLinksFor(link?: WorkLink): WorkLink[] {
  if (!link) return [];
  const links: WorkLink[] = [];
  if (link.type === "conversation" || link.type === "message") {
    const conversationId = link.type === "message" ? link.id.split("::")[0] : link.id;
    const conversation = allConversations().find((row) => row.id === conversationId);
    if (conversation) {
      addCustomer(links, conversation.company, conversation.name, conversation.email);
      pushUnique(links, conversationLink(conversation));
      const deal = dealRows().find((row) => row.id === conversation.opportunities[0]?.id);
      if (deal) {
        pushUnique(links, {
          type: "opportunity",
          id: deal.id,
          label: deal.name,
          detail: `${deal.company} · ${deal.value}`,
        });
      }
      if (link.type === "message") {
        const message = conversation.messages.find(
          (row) => `${conversation.id}::${row.id}` === link.id,
        );
        if (message) pushUnique(links, messageLink(conversation, message));
      }
    }
  } else if (link.type === "email") {
    const mail = mailRows().find((row) => row.id === link.id);
    if (mail) {
      const contact = contactRecord(mail.from, mail.from);
      if (contact) {
        pushUnique(links, contactLink(contact));
        pushUnique(links, companyLink(contact.company));
      }
      pushUnique(links, emailThreadLink(mail));
    } else {
      pushUnique(links, link);
    }
  } else if (link.type === "quote") {
    const quote = quoteRows().find((row) => row.id === link.id);
    if (quote) {
      const deal = dealRows().find((row) => row.name === quote.opportunity);
      if (deal) addCustomer(links, quote.customer, deal.contact, deal.email);
      else pushUnique(links, companyLink(quote.customer));
      pushUnique(links, link);
      if (deal) {
        pushUnique(links, {
          type: "opportunity",
          id: deal.id,
          label: deal.name,
          detail: `${deal.company} · ${deal.value}`,
        });
      }
    } else {
      pushUnique(links, link);
    }
  } else if (link.type === "opportunity") {
    const deal = dealRows().find((row) => row.id === link.id);
    if (deal) {
      addCustomer(links, deal.company, deal.contact, deal.email);
      pushUnique(links, link);
    }
  } else if (link.type === "contact") {
    const contact = contacts.find((row) => row.id === link.id);
    pushUnique(links, link);
    if (contact) pushUnique(links, companyLink(contact.company));
  } else {
    pushUnique(links, link);
  }
  return links.slice(0, 8);
}

export function suggestedAction(links: WorkLink[]): FollowUpKind {
  if (links.some((link) => link.type === "quote")) return "quote";
  const conversation = links.find((link) => link.type === "conversation");
  if (conversation) {
    const row = allConversations().find((item) => item.id === conversation.id);
    if (row?.channel === "whatsapp") return "whatsapp";
    if (row?.channel === "email") return "email";
  }
  if (links.some((link) => link.type === "email")) return "email";
  return "task";
}
