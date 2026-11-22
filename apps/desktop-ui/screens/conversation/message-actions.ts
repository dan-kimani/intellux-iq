import { LayoutAnimation, reduceMotion, signal, type ViewRef } from "nsh";
import type { Conversation, Message, ReplyPreview } from "../../data";

export type ThreadMessage = Message & { id: string };
export type ActionableMessage = Exclude<Message, { kind: "system" }> & { id: string };
export type DeleteScope = "me" | "everyone";

export interface MessageOverride {
  deleted?: DeleteScope;
  starred?: boolean;
  reaction?: string;
  text?: string;
}

export interface ReplyTarget {
  conversationId: string;
  messageId: string;
  from: string;
  text: string;
}

export interface MessageRef {
  conversationId: string;
  messageId: string;
}

export const messageOverrides = signal<Record<string, MessageOverride>>({});
export const focusMessage = signal<MessageRef | null>(null);
export const pinnedMessages = signal<Record<string, string>>({});
export const replyTarget = signal<ReplyTarget | null>(null);
export const sentReplyTo = signal<ReplyPreview | null>(null);
export const messageInfo = signal<MessageRef | null>(null);
export const editingMessage = signal<MessageRef | null>(null);
export const forwardingMessage = signal<MessageRef | null>(null);
export const forwardedMessages = signal<Record<string, Message[]>>({});
export const composerFocusRequest = signal(0);

const messageViews = new Map<string, ViewRef>();

export function trackMessageView(id: string, node: ViewRef): void {
  messageViews.set(id, node);
}

export function revealMessageView(id: string): void {
  messageViews.get(id)?.reveal({ vertical: "center", animated: true });
}

export function openMessageRef(conversationId: string, messageId: string): void {
  focusMessage.set({ conversationId, messageId });
}

export function overrideFor(id: string): MessageOverride {
  return messageOverrides()[id] ?? {};
}

export function updateMessageOverride(id: string, patch: Partial<MessageOverride>): void {
  messageOverrides.set({ ...messageOverrides(), [id]: { ...overrideFor(id), ...patch } });
}

/** The thread's messages, including forwards, always with a stable id. */
export function messagesFor(conversation: Conversation): ThreadMessage[] {
  const extras = forwardedMessages()[conversation.id] ?? [];
  return [...conversation.messages, ...extras].map((message, index) => ({
    ...message,
    id: message.id ?? `${conversation.id}-m${index + 1}`,
  }));
}

export function messageById(conversation: Conversation, id: string): ThreadMessage | undefined {
  return messagesFor(conversation).find((message) => message.id === id);
}

export function messagePreview(message: Message): string {
  switch (message.kind) {
    case "text":
      return message.text;
    case "image":
      return message.caption ?? "Photo";
    case "file":
      return message.fileName;
    case "audio":
      return `Voice message · ${message.duration}`;
    case "system":
    case "whisper":
      return message.text;
  }
}

export function messageKindLabel(message: Message): string {
  switch (message.kind) {
    case "text":
      return "Text";
    case "image":
      return "Photo";
    case "file":
      return "Document";
    case "audio":
      return "Voice message";
    case "system":
      return "System";
    case "whisper":
      return "Internal note";
  }
}

export function startReply(conversation: Conversation, message: ActionableMessage): void {
  replyTarget.set({
    conversationId: conversation.id,
    messageId: message.id,
    from: message.from === "me" ? "You" : conversation.name,
    text: overrideFor(message.id).text ?? messagePreview(message),
  });
  composerFocusRequest.set(composerFocusRequest() + 1);
}

export function clearReply(): void {
  replyTarget.set(null);
}

export function toggleReaction(id: string, emoji: string): string | null {
  const next = overrideFor(id).reaction === emoji ? null : emoji;
  updateMessageOverride(id, { reaction: next ?? undefined });
  return next;
}

export function toggleStar(id: string): boolean {
  const starred = !overrideFor(id).starred;
  updateMessageOverride(id, { starred });
  return starred;
}

export function pinMessage(conversationId: string, messageId: string): void {
  pinnedMessages.set({ ...pinnedMessages(), [conversationId]: messageId });
}

export function unpinMessage(conversationId: string): void {
  const next = { ...pinnedMessages() };
  delete next[conversationId];
  pinnedMessages.set(next);
}

export function deleteMessage(
  conversation: Conversation,
  message: ActionableMessage,
  scope: DeleteScope,
): void {
  if (scope === "me" && !reduceMotion()) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }
  updateMessageOverride(message.id, { deleted: scope, reaction: undefined });
  if (pinnedMessages()[conversation.id] === message.id) unpinMessage(conversation.id);
  if (replyTarget()?.messageId === message.id) clearReply();
  if (editingMessage()?.messageId === message.id) editingMessage.set(null);
}

export function forwardMessage(message: ActionableMessage, target: Conversation): void {
  const text = message.kind === "text" ? overrideFor(message.id).text : undefined;
  const forwarded: ActionableMessage = {
    ...message,
    ...(text ? { text } : {}),
    id: `${message.id}-forward-${Date.now()}`,
    from: "me",
    time: "Just now",
    status: "sent",
    replyTo: undefined,
  };
  forwardedMessages.set({
    ...forwardedMessages(),
    [target.id]: [...(forwardedMessages()[target.id] ?? []), forwarded],
  });
}
