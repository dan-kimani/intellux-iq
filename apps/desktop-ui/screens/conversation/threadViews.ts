import type { Conversation } from "../../data";
import { attachmentFile, imageAttachment, type AttachmentFile } from "../../files/types";
import type { QuoteRow } from "../quotes/data";
import { opportunitiesFor } from "../../state";
import { quoteForOpportunity } from "../opportunities/quotes";
import { messagesFor, overrideFor, type ThreadMessage } from "./message-actions";

/** Files shared in one conversation, in thread order. */
export function attachmentsFor(conversation: Conversation): AttachmentFile[] {
  const files: AttachmentFile[] = [];
  for (const message of messagesFor(conversation)) {
    if (overrideFor(message.id).deleted) continue;
    if (message.kind === "image") {
      files.push(
        imageAttachment(message.fileName ?? "Shared image", message.size ?? "Image", message.image),
      );
    } else if (message.kind === "file") {
      files.push(attachmentFile(message.fileName, message.size));
    } else if (message.kind === "audio") {
      files.push(attachmentFile("Voice message.m4a", message.duration));
    }
  }
  return files;
}

/** Files across every conversation linked to an opportunity, deduplicated. */
export function attachmentsForConversations(conversations: Conversation[]): AttachmentFile[] {
  const seen = new Set<string>();
  return conversations.flatMap((conversation) =>
    attachmentsFor(conversation).filter((file) => {
      if (seen.has(file.id)) return false;
      seen.add(file.id);
      return true;
    }),
  );
}

/** Quotes issued against the opportunities in this conversation. */
export function quotesForConversation(conversation: Conversation): QuoteRow[] {
  const seen = new Set<string>();
  return opportunitiesFor(conversation)
    .map((opportunity) => quoteForOpportunity(opportunity.id))
    .filter((quote): quote is QuoteRow => {
      if (!quote || seen.has(quote.id)) return false;
      seen.add(quote.id);
      return true;
    });
}

export function starredFor(conversation: Conversation): ThreadMessage[] {
  return messagesFor(conversation).filter(
    (message) => overrideFor(message.id).starred && !overrideFor(message.id).deleted,
  );
}
