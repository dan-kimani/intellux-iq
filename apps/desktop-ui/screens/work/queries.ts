import { allConversations } from "../../state";
import type { FollowUpTask } from "../home/data";
import { followUpRows } from "../home/state";
import { contacts } from "../contacts/data";
import { dealRows } from "../deals/state";
import { mailRows } from "../inbox/mail";
import { quoteRows } from "../quotes/state";
import { linkMatches } from "./links";
import { taskLinks } from "./state";
import { workActivities, workReminders } from "./state";
import type { WorkActivity, WorkLink, WorkReminder } from "./types";

function scopeMatches(candidate: WorkLink, target: WorkLink): boolean {
  if (linkMatches(candidate, target)) return true;
  if (target.type === "contact") {
    const contact = contacts.find((row) => row.id === target.id);
    if (!contact) return false;
    if (candidate.type === "contact" && candidate.id === contact.id) return true;
    if (candidate.type === "conversation") {
      return allConversations().some(
        (conversation) =>
          conversation.id === candidate.id &&
          (conversation.contactId === contact.id ||
            conversation.name.trim().toLowerCase() === contact.name.trim().toLowerCase()),
      );
    }
    if (candidate.type === "message") {
      const conversationId = candidate.id.split("::")[0];
      return allConversations().some(
        (conversation) =>
          conversation.id === conversationId &&
          (conversation.contactId === contact.id ||
            conversation.name.trim().toLowerCase() === contact.name.trim().toLowerCase()),
      );
    }
    if (candidate.type === "opportunity") {
      const deal = dealRows().find((row) => row.id === candidate.id);
      return Boolean(deal && (deal.contact === contact.name || deal.email === contact.email));
    }
    if (candidate.type === "email") {
      const mail = mailRows().find((row) => row.id === candidate.id);
      return Boolean(mail && contact.email && mail.from.includes(contact.email));
    }
  }
  if (target.type === "opportunity") {
    const deal = dealRows().find((row) => row.id === target.id);
    if (!deal) return false;
    if (candidate.type === "quote") {
      const quote = quoteRows().find((row) => row.id === candidate.id);
      return Boolean(quote && quote.opportunity === deal.name);
    }
    if (candidate.type === "contact") {
      return candidate.id === contacts.find((row) => row.name === deal.contact)?.id;
    }
  }
  if (target.type === "quote") {
    const quote = quoteRows().find((row) => row.id === target.id);
    if (!quote) return false;
    if (candidate.type === "opportunity") {
      return dealRows().some((deal) => deal.id === candidate.id && deal.name === quote.opportunity);
    }
  }
  if (target.type === "conversation") {
    const conversation = allConversations().find((row) => row.id === target.id);
    if (conversation && candidate.type === "contact") {
      return conversation.contactId === candidate.id;
    }
  }
  return false;
}

export function taskMatchesLink(task: FollowUpTask, link: WorkLink): boolean {
  return taskLinks(task).some((candidate) => scopeMatches(candidate, link));
}

export function tasksForLink(link: WorkLink): FollowUpTask[] {
  return followUpRows()
    .filter((task) => !task.done && !task.cancelled && taskMatchesLink(task, link))
    .toSorted((a, b) => a.dueInMinutes - b.dueInMinutes);
}

export function activitiesForLink(link: WorkLink): WorkActivity[] {
  return workActivities().filter((activity) =>
    activity.links.some((candidate) => scopeMatches(candidate, link)),
  );
}

export function remindersForLink(link: WorkLink): WorkReminder[] {
  return workReminders().filter(
    (reminder) =>
      (reminder.status === "scheduled" || reminder.status === "due") &&
      reminder.links.some((candidate) => scopeMatches(candidate, link)),
  );
}
