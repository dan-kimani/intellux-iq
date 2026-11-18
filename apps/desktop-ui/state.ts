import { signal } from "nsh";
import { type AvatarTone, type Channel, type Conversation, conversations } from "./data";
import { assignmentFor, currentMember, inboxScope } from "./state/inbox";
export * from "./state/inbox";

export type NavItem =
  | "Inbox"
  | "Recovery"
  | "Contacts"
  | "Deals"
  | "Quotes"
  | "Catalog"
  | "Analytics"
  | "Automations"
  | "Segments"
  | "Settings";

export const activeNav = signal<NavItem>("Inbox");
export const activeNavChild = signal<string | null>("inbox");
export const sidebarCollapsed = signal(false);
export const selectedId = signal("sarah");
export const extraConversations = signal<Conversation[]>([]);

export function allConversations(): Conversation[] {
  return [...extraConversations(), ...conversations];
}

export function createConversation(input: {
  contactId: string | null;
  name: string;
  company: string;
  initials: string;
  tone: AvatarTone;
  channel: Channel;
  phone: string;
  email: string;
  location: string;
  text: string;
}): Conversation {
  const id = `conversation-${extraConversations().length + 1}`;
  const conversation: Conversation = {
    id,
    contactId: input.contactId,
    name: input.name,
    company: input.company,
    initials: input.initials,
    tone: input.tone,
    channel: input.channel,
    channelAccount:
      input.channel === "whatsapp" ? "WhatsApp · +254 700 100 200" : "sales@acmetrading.co.ke",
    subject: input.channel === "email" ? "New email conversation" : undefined,
    preview: input.text,
    time: "Now",
    unread: 0,
    verified: false,
    vip: false,
    engagement: 20,
    interest: "New",
    presence: "offline",
    typing: false,
    phone: input.phone,
    email: input.email,
    location: input.location,
    opportunities: [],
    assignment: {
      userId: currentMember.id,
      name: currentMember.name,
      at: "Just now",
      by: currentMember.name,
      source: "manual",
    },
    tags: ["New"],
    slaMinutes: 240,
    windowMinutes: input.channel === "whatsapp" ? 1440 : null,
    metrics: {
      firstResponseMinutes: 0,
      responseGapCount: 0,
      unansweredInboundCount: 0,
      lastInboundAt: "—",
      lastOutboundAt: "Now",
      followUpsCompleted: 0,
      followUpsDue: 0,
      followUpOverdue: false,
      ageDays: 0,
      lastActivityDays: 0,
      quoteAgeDays: null,
      lastMessageFrom: "me",
    },
    messages: [
      {
        id: `${id}-m1`,
        kind: "text",
        from: "me",
        text: input.text,
        time: "Just now",
        status: "sending",
      },
    ],
  };
  extraConversations.set([conversation, ...extraConversations()]);
  return conversation;
}

export const channelFilter = signal<"all" | Channel>("all");
export const searchQuery = signal("");
export const inboxUnreadOnly = signal(false);
export const inboxSort = signal("Recent");
export const sentMessage = signal<string | null>(null);
export const toastMessage = signal<string | null>(null);

let toastTimer: number | undefined;

export function selectedConversation(): Conversation {
  return (
    allConversations().find((conversation) => conversation.id === selectedId()) ?? conversations[0]
  );
}

export function selectConversation(id: string): void {
  selectedId.set(id);
  sentMessage.set(null);
  markConversationRead(id);
}

export function showToast(message: string): void {
  toastMessage.set(message);
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastMessage.set(null), 2800);
}

export function matchesFilter(conversation: Conversation): boolean {
  const filter = channelFilter();
  if (filter !== "all" && conversation.channel !== filter) return false;
  if (inboxScope() === "mine" && assignmentFor(conversation)?.userId !== currentMember.id) {
    return false;
  }
  if (inboxUnreadOnly() && !isUnread(conversation)) return false;
  const query = searchQuery().trim().toLowerCase();
  if (!query) return true;
  const messageMatch = conversation.messages.some((message) => {
    if (message.kind === "text" || message.kind === "whisper" || message.kind === "system") {
      return message.text.toLowerCase().includes(query);
    }
    if (message.kind === "file") return message.fileName.toLowerCase().includes(query);
    return false;
  });
  return (
    conversation.name.toLowerCase().includes(query) ||
    conversation.company.toLowerCase().includes(query) ||
    conversation.preview.toLowerCase().includes(query) ||
    conversation.channelAccount.toLowerCase().includes(query) ||
    conversation.tags.some((tag) => tag.toLowerCase().includes(query)) ||
    messageMatch
  );
}

export function visibleConversations(): Conversation[] {
  const list = allConversations().filter(matchesFilter);
  const sort = inboxSort();
  if (sort === "Oldest") return list.toReversed();
  if (sort === "Unread first")
    return list.toSorted(
      (a, b) => Number(isUnread(b)) - Number(isUnread(a)) || b.unread - a.unread,
    );
  return list;
}

export function visibleCount(): number {
  return visibleConversations().length;
}

export const unreadIds = signal<string[]>([]);
export const readIds = signal<string[]>([]);

export function isUnread(conversation: Conversation): boolean {
  if (unreadIds().includes(conversation.id)) return true;
  if (readIds().includes(conversation.id)) return false;
  return conversation.unread > 0;
}

export function markConversationUnread(id: string): void {
  unreadIds.set([...new Set([...unreadIds(), id])]);
  readIds.set(readIds().filter((item) => item !== id));
}

export function markConversationRead(id: string): void {
  readIds.set([...new Set([...readIds(), id])]);
  unreadIds.set(unreadIds().filter((item) => item !== id));
}

export const notificationsRead = signal(false);
export const commandOpen = signal(false);
export const accountOpen = signal(false);
export const newMessageOpen = signal(false);
export const detailsPanelOpen = signal(true);

export type AttachmentKind = "file" | "image" | "voice";
export const attachmentOpen = signal(false);
export const attachmentPreset = signal<AttachmentKind | null>(null);
export const composerAttachment = signal<string | null>(null);

export const locked = signal(false);

export const currentUser = "David Mwangi";
export const online = signal(true);
export type OutboxStatus = "queued" | "sending" | "sent" | "failed";
export interface OutboxItem {
  id: string;
  text: string;
  status: OutboxStatus;
  time: string;
}
export const outbox = signal<OutboxItem[]>([
  { id: "ob-1", text: "Quotation_QT-2025-0045.pdf", status: "sent", time: "9:27 AM" },
  {
    id: "ob-2",
    text: "Thanks — I'll confirm the delivery window.",
    status: "sent",
    time: "9:41 AM",
  },
]);

let outboxTimer: number | undefined;
export function enqueueMessage(text: string): string {
  const item: OutboxItem = {
    id: `ob-${Date.now()}`,
    text,
    status: online() ? "sending" : "queued",
    time: "Just now",
  };
  outbox.set([item, ...outbox()]);
  sentOutboxId.set(item.id);
  if (outboxTimer) clearTimeout(outboxTimer);
  if (online()) {
    outboxTimer = setTimeout(() => {
      outbox.set(outbox().map((row) => (row.id === item.id ? { ...row, status: "sent" } : row)));
    }, 1500);
  }
  return item.id;
}

export function drainOutbox(): void {
  if (!online()) return;
  outbox.set(
    outbox().map((row) =>
      row.status === "queued" || row.status === "sending" ? { ...row, status: "sent" } : row,
    ),
  );
}
export function retryOutbox(): void {
  outbox.set(outbox().map((row) => (row.status === "failed" ? { ...row, status: "queued" } : row)));
  if (online()) {
    outbox.set(outbox().map((row) => (row.status === "queued" ? { ...row, status: "sent" } : row)));
  }
}
export const syncOpen = signal(false);

export const templateOpen = signal(false);

export interface AppliedTemplate {
  id: string;
  name: string;
  language: string;
  variables: string[];
}
export const appliedTemplate = signal<AppliedTemplate | null>(null);
export const sentTemplate = signal<AppliedTemplate | null>(null);
export const sentKind = signal<"message" | "note">("message");
export const sentOutboxId = signal<string | null>(null);

export const emailFolder = signal<import("./screens/inbox/mail").MailFolder>("Inbox");
export const mailDetail = signal<import("./screens/inbox/mail").MailItem | null>(null);
export const mailAccountOpen = signal(false);
export const channelConnectOpen = signal(false);
export const mailAccount = signal("sales");
export type MailComposeMode = "reply" | "replyAll" | "forward" | "new";
export const mailDraft = signal<{
  key: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  bodyHtml?: string;
} | null>(null);
export const mailCompose = signal<{
  mode: MailComposeMode;
  item?: import("./screens/inbox/mail").MailItem;
} | null>(null);
