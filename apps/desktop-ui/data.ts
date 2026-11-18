import { conversationsA } from "./fixtures/conversations-a";
import { conversationsB } from "./fixtures/conversations-b";
import { normalizeConversation } from "./fixtures/normalize";
import type { Conversation } from "./fixtures/types";

export * from "./fixtures/types";

export const conversations: Conversation[] = [...conversationsA, ...conversationsB].map(
  normalizeConversation,
);
