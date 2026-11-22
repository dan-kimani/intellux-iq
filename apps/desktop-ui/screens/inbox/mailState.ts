import { signal } from "nsh";
import { mailCompose, mailDetail, searchQuery, showToast, syncOpen } from "../../state";
import { mailRows, type MailFolder, type MailItem } from "./mail";
import { requestConfirmation } from "../../components/ConfirmationDialog";
import { mailPartyName, mailThreadKey } from "./mailIdentity";

export type MailSort = "Recent" | "Oldest" | "Sender";

export const mailSelectedIds = signal<string[]>([]);
export const mailSort = signal<MailSort>("Recent");
export const mailUnreadOnly = signal(false);
export const mailAttachmentsOnly = signal(false);
export const mailStarredOnly = signal(false);
export const mailSearch = signal("");
export const mailReadingOpen = signal(true);
export const mailSyncing = signal(false);
export const mailLastSynced = signal("Synced 2m ago");

export interface MailThread {
  key: string;
  messages: MailItem[];
  latest: MailItem;
  unread: boolean;
}

function threadKey(item: MailItem): string {
  return item.threadId ?? mailThreadKey(item.subject);
}

function queryMatches(item: MailItem, query: string): boolean {
  if (!query) return true;
  return `${item.subject} ${item.from} ${item.to} ${item.preview} ${item.body.join(" ")}`
    .toLowerCase()
    .includes(query);
}

function mailParty(item: MailItem): string {
  return mailPartyName(item.folder === "Sent" || item.folder === "Drafts" ? item.to : item.from);
}

export function mailThreadGroups(folder: MailFolder, accountId: string): MailThread[] {
  const globalQuery = searchQuery().trim().toLowerCase();
  const localQuery = mailSearch().trim().toLowerCase();
  const groups = new Map<string, MailItem[]>();
  for (const item of mailRows()) {
    if (item.account !== accountId) continue;
    const key = threadKey(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const result = [...groups]
    .filter(([, messages]) =>
      messages.some((item) => {
        if (folder === "Priority" ? !item.starred : item.folder !== folder) return false;
        if (mailUnreadOnly() && item.read) return false;
        if (mailAttachmentsOnly() && item.attachments.length === 0) return false;
        if (mailStarredOnly() && !item.starred) return false;
        return queryMatches(item, globalQuery) && queryMatches(item, localQuery);
      }),
    )
    .map(([key, messages]) => ({
      key,
      messages,
      latest: messages[0],
      unread: messages.some((message) => !message.read),
    }));
  if (mailSort() === "Oldest") return result.toReversed();
  if (mailSort() === "Sender") {
    return result.toSorted((a, b) => mailParty(a.latest).localeCompare(mailParty(b.latest)));
  }
  return result;
}

export function mailThreadMessages(item: MailItem): MailItem[] {
  const key = threadKey(item);
  return mailRows().filter((row) => row.account === item.account && threadKey(row) === key);
}

export function clearMailSelection(): void {
  mailSelectedIds.set([]);
}

export function toggleMailSelected(id: string): void {
  const selected = mailSelectedIds();
  mailSelectedIds.set(
    selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id],
  );
}

export function selectAllMail(ids: string[]): void {
  const selected = mailSelectedIds();
  const every = ids.length > 0 && ids.every((id) => selected.includes(id));
  mailSelectedIds.set(
    every ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])],
  );
}

function patchMail(ids: string[], patch: Partial<MailItem>): void {
  mailRows.set(mailRows().map((row) => (ids.includes(row.id) ? { ...row, ...patch } : row)));
}

export function setMailRead(ids: string[], read: boolean): void {
  patchMail(ids, { read });
  mailSelectedIds.set([]);
  showToast(
    `${ids.length} ${ids.length === 1 ? "message" : "messages"} marked ${read ? "read" : "unread"}.`,
  );
}

export function moveMail(ids: string[], folder: MailFolder): void {
  patchMail(ids, { folder });
  mailSelectedIds.set([]);
  showToast(`${ids.length} ${ids.length === 1 ? "message" : "messages"} moved to ${folder}.`);
}

function removeMail(ids: string[]): void {
  mailRows.set(mailRows().filter((row) => !ids.includes(row.id)));
  if (mailDetail() && ids.includes(mailDetail()!.id)) mailDetail.set(null);
  if (mailCompose()?.item && ids.includes(mailCompose()!.item!.id)) mailCompose.set(null);
  mailSelectedIds.set([]);
  showToast(`${ids.length} ${ids.length === 1 ? "message" : "messages"} deleted.`);
}

export function deleteMail(ids: string[]): void {
  if (ids.length === 0) return;
  requestConfirmation({
    title: ids.length === 1 ? "Delete this email?" : `Delete ${ids.length} emails?`,
    description:
      ids.length === 1
        ? "This email will be permanently removed from the mailbox."
        : "These emails will be permanently removed from the mailbox.",
    confirmLabel: "Delete",
    icon: "trash",
    onConfirm: () => removeMail(ids),
  });
}

export function toggleMailStar(id: string): void {
  const item = mailRows().find((row) => row.id === id);
  if (!item) return;
  patchMail([id], { starred: !item.starred });
  showToast(item.starred ? "Removed from Priority." : "Added to Priority.");
}

export function toggleMailReading(): void {
  mailReadingOpen.set(!mailReadingOpen());
}

export function refreshMail(): void {
  if (mailSyncing()) return;
  mailSyncing.set(true);
  setTimeout(() => {
    mailSyncing.set(false);
    mailLastSynced.set("Updated just now");
    showToast("Mailbox refreshed.");
  }, 650);
}

export function openMailOutbox(): void {
  syncOpen.set(true);
}

export function openMailItem(item: MailItem): void {
  patchMail([item.id], { read: true });
  mailDetail.set({ ...item, read: true });
  mailCompose.set(null);
  mailReadingOpen.set(true);
}
