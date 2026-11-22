import { mailAccounts, mailRows, type MailFolder } from "./mail";

export function mailCountLabel(count: number): string {
  return `${count} ${count === 1 ? "message" : "messages"}`;
}

export function mailFolderCount(folder: MailFolder, accountId?: string): number {
  return mailRows().filter((item) =>
    folder === "Priority"
      ? item.starred && (!accountId || item.account === accountId)
      : item.folder === folder && (!accountId || item.account === accountId),
  ).length;
}

export function mailUnreadCount(accountId?: string): number {
  return mailRows().filter(
    (item) => item.folder === "Inbox" && !item.read && (!accountId || item.account === accountId),
  ).length;
}

export function mailAccountUnreadCount(accountId: string): number {
  return mailUnreadCount(accountId);
}

export function mailAccountEmail(accountId: string): string {
  return mailAccounts.find((account) => account.id === accountId)?.email ?? mailAccounts[0].email;
}
