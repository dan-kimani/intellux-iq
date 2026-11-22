import {
  activeNav,
  activeNavChild,
  channelFilter,
  emailFolder,
  mailAccount,
  mailCompose,
  mailDetail,
  selectConversation,
} from "../../state";
import { contacts } from "../contacts/data";
import { contactDetail } from "../contacts/state";
import { dealDetail, dealRows } from "../deals/state";
import { products } from "../catalog/data";
import { productDetail } from "../catalog/state";
import { mailRows } from "../inbox/mail";
import { quoteRows, quoteTab, openQuote } from "../quotes/state";
import type { WorkLink } from "./types";

function findMail(id: string) {
  return mailRows().find((item) => item.id === id);
}

/** Opens the entity behind a work-item link in its native workspace. */
export function openWorkLink(link: WorkLink): void {
  if (link.type === "conversation" || link.type === "message") {
    const conversationId =
      link.type === "conversation" ? link.id : (link.id.split("::")[0] ?? link.id);
    selectConversation(conversationId);
    activeNavChild.set("inbox");
    activeNav.set("Inbox");
    channelFilter.set("all");
    mailDetail.set(null);
    mailCompose.set(null);
    return;
  }

  if (link.type === "email") {
    const item = findMail(link.id);
    if (!item) return;
    activeNavChild.set("inbox");
    activeNav.set("Inbox");
    channelFilter.set("email");
    mailAccount.set(item.account);
    emailFolder.set(item.folder);
    mailCompose.set(null);
    mailDetail.set(item);
    return;
  }

  if (link.type === "contact") {
    const contact = contacts.find((row) => row.id === link.id);
    if (!contact) return;
    activeNavChild.set("contacts");
    activeNav.set("Contacts");
    contactDetail.set(contact);
    return;
  }

  if (link.type === "company") {
    activeNavChild.set("contacts");
    activeNav.set("Contacts");
    const contact = contacts.find((row) => row.company === link.label);
    contactDetail.set(contact ?? null);
    return;
  }

  if (link.type === "opportunity") {
    const deal = dealRows().find((row) => row.id === link.id);
    if (!deal) return;
    activeNavChild.set("deals");
    activeNav.set("Deals");
    dealDetail.set(deal);
    return;
  }

  if (link.type === "quote") {
    const quote = quoteRows().find((row) => row.id === link.id);
    if (!quote) return;
    activeNavChild.set("quotes");
    activeNav.set("Quotes");
    quoteTab.set("all");
    openQuote(quote);
    return;
  }

  if (link.type === "product") {
    const product = products.find((row) => row.id === link.id);
    if (!product) return;
    activeNavChild.set("catalog");
    activeNav.set("Catalog");
    productDetail.set(product);
  }
}
