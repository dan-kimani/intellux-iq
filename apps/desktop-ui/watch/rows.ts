import type { Conversation } from "../data";
import { allConversations, currentMember, isUnread } from "../state";
import type { FollowUpTask } from "../screens/home/data";
import { followUpRows } from "../screens/home/state";
import { mailAccounts, mailRows, type MailItem } from "../screens/inbox/mail";
import { mailPartyName, mailThreadKey } from "../screens/inbox/mailIdentity";
import {
  isSnoozed,
  watchEntries,
  watchFilter,
  type WatchEntry,
  type WatchRow,
  type WatchSeverity,
} from "./data";

export function watchThreadMessages(entry: WatchEntry): MailItem[] {
  return mailRows().filter(
    (row) =>
      (row.threadId ?? mailThreadKey(row.subject)) === entry.refId &&
      (!entry.account || row.account === entry.account),
  );
}

function isOurs(address: string, account?: string): boolean {
  return mailAccounts
    .filter((row) => !account || row.id === account)
    .some((row) => row.email.toLowerCase() === address.toLowerCase());
}

function conversationSignature(conversation: Conversation): string {
  return `${conversation.messages.length}:${conversation.preview}:${conversation.time}`;
}

function emailSignature(messages: MailItem[]): string | null {
  return messages[0]?.id ?? null;
}

function taskSignature(task: FollowUpTask): string {
  return `${task.done}:${task.cancelled}:${task.dueAtMs ?? task.dueInMinutes}:${task.owner}`;
}

export function watchSignature(entry: WatchEntry): string | null {
  if (entry.kind === "conversation") {
    const conversation = allConversations().find((row) => row.id === entry.refId);
    return conversation ? conversationSignature(conversation) : null;
  }
  if (entry.kind === "email") {
    const messages = watchThreadMessages(entry);
    return emailSignature(messages);
  }
  const task = followUpRows().find((row) => row.id === entry.refId);
  return task ? taskSignature(task) : null;
}

function isNew(entry: WatchEntry, signature: string | null): boolean {
  return signature !== null && entry.seenSignature !== signature;
}

function dueSoonLabel(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  if (total <= 5) return "Due now";
  if (total < 60) return `Due in ${total}m`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest ? `Due in ${hours}h ${rest}m` : `Due in ${hours}h`;
}

function conversationRow(entry: WatchEntry, now: number): WatchRow | null {
  const conversation = allConversations().find((row) => row.id === entry.refId);
  if (!conversation) return null;
  const unread = isUnread(conversation) ? Math.max(conversation.unread, 1) : 0;
  const awaiting = conversation.metrics.lastMessageFrom === "them";
  const severity: WatchSeverity = awaiting || unread > 0 ? "attention" : "quiet";
  const signature = conversationSignature(conversation);
  let label: string | undefined;
  if (awaiting && unread > 0) label = `Awaiting your reply · ${unread} unread`;
  else if (awaiting) label = "Awaiting your reply";
  else if (unread > 0) label = `${unread} unread`;
  return {
    entry,
    kind: "conversation",
    title: conversation.name,
    context: conversation.company,
    event: conversation.preview,
    meta: conversation.time,
    severity,
    attention: severity !== "quiet",
    ...(label ? { attentionLabel: label } : {}),
    newActivity: isNew(entry, signature),
    unread,
    snoozed: isSnoozed(entry, now),
  };
}

function emailRow(entry: WatchEntry, now: number): WatchRow | null {
  const messages = watchThreadMessages(entry);
  const latest = messages[0];
  if (!latest) return null;
  const unread = messages.filter((row) => !row.read).length;
  const failed = messages.some((row) => row.status === "failed" || row.status === "bounced");
  const awaiting = !isOurs(latest.from, entry.account);
  const severity: WatchSeverity = failed
    ? "critical"
    : awaiting || unread > 0
      ? "attention"
      : "quiet";
  const signature = emailSignature(messages);
  let label: string | undefined;
  if (failed) label = "Delivery failed";
  else if (awaiting && unread > 0) label = `Awaiting your reply · ${unread} unread`;
  else if (awaiting) label = "Awaiting your reply";
  else if (unread > 0) label = `${unread} unread`;
  return {
    entry,
    kind: "email",
    title: latest.subject,
    context: `${mailPartyName(latest.from)} · ${latest.folder}`,
    event: latest.preview,
    meta: latest.date,
    severity,
    attention: severity !== "quiet",
    ...(label ? { attentionLabel: label } : {}),
    newActivity: isNew(entry, signature),
    unread,
    snoozed: isSnoozed(entry, now),
  };
}

function taskRow(entry: WatchEntry, now: number): WatchRow | null {
  const task = followUpRows().find((row) => row.id === entry.refId);
  if (!task) return null;
  const overdue =
    !task.done && !task.cancelled && (task.dueInMinutes < 0 || task.due.startsWith("Overdue"));
  const dueSoon = !task.done && !task.cancelled && !overdue && task.dueInMinutes <= 120;
  const severity: WatchSeverity = overdue ? "critical" : dueSoon ? "attention" : "quiet";
  const signature = taskSignature(task);
  return {
    entry,
    kind: "task",
    title: task.title,
    context: task.context,
    event: task.done ? "Completed" : task.cancelled ? "Cancelled" : task.due,
    meta: task.owner === currentMember.name ? "You" : (task.owner.split(" ")[0] ?? task.owner),
    severity,
    attention: severity !== "quiet",
    ...(overdue
      ? { attentionLabel: "Overdue" }
      : dueSoon
        ? { attentionLabel: dueSoonLabel(task.dueInMinutes) }
        : {}),
    newActivity: isNew(entry, signature),
    unread: 0,
    snoozed: isSnoozed(entry, now),
    done: task.done,
  };
}

function rank(row: WatchRow): number {
  if (row.snoozed) return 3;
  if (row.severity === "critical") return 0;
  if (row.severity === "attention") return 1;
  return 2;
}

export function watchRows(): WatchRow[] {
  const now = Date.now();
  return watchEntries()
    .map((entry) =>
      entry.kind === "conversation"
        ? conversationRow(entry, now)
        : entry.kind === "email"
          ? emailRow(entry, now)
          : taskRow(entry, now),
    )
    .filter((row): row is WatchRow => row !== null)
    .toSorted((a, b) => rank(a) - rank(b) || b.entry.watchedAt - a.entry.watchedAt);
}

export function filteredWatchRows(): WatchRow[] {
  const rows = watchRows();
  return watchFilter() === "attention" ? rows.filter((row) => row.attention && !row.snoozed) : rows;
}

export function attentionCount(): number {
  return watchRows().filter((row) => row.attention && !row.snoozed).length;
}

export function watchedCount(): number {
  return watchRows().length;
}
