import { effect, Scroll, type ScrollRef, signal, View } from "nsh";
import { AnimatedSwap } from "../components/motion";
import type { Conversation } from "../data";
import { ChatHeader } from "./conversation/ChatHeader";
import { ConversationStatusBar } from "../components/ConversationStatusBar";
import { ConversationTabs, type ThreadTab } from "./conversation/ConversationTabs";
import { Composer } from "./conversation/Composer";
import { FilesTab } from "./conversation/FilesTab";
import { MessageList } from "./conversation/MessageList";
import { QuotesTab } from "./conversation/QuotesTab";
import { SentBubble } from "./conversation/SentBubble";
import { StarredTab } from "./conversation/StarredTab";
import { MessageInfoDialog } from "./conversation/MessageInfoDialog";
import { ForwardDialog } from "./conversation/ForwardDialog";
import {
  focusMessage,
  forwardingMessage,
  messageById,
  messageInfo,
  revealMessageView,
} from "./conversation/message-actions";
import { selectedId } from "../state";

export function ConversationPane(props: { conversation: Conversation }) {
  const c = props.conversation;
  const tab = signal<ThreadTab>("conversation");
  let chatScroll: ScrollRef | undefined;
  let initialScrollDone = false;
  effect(() => {
    if (selectedId() !== c.id) return;
    const first = setTimeout(() => chatScroll?.scrollToEnd({ animated: false }), 220);
    const settled = setTimeout(() => chatScroll?.scrollToEnd({ animated: false }), 300);
    return () => {
      clearTimeout(first);
      clearTimeout(settled);
    };
  });
  effect(() => {
    if (tab() !== "conversation") return;
    const timer = setTimeout(() => chatScroll?.scrollToEnd({ animated: false }), 220);
    return () => clearTimeout(timer);
  });
  effect(() => {
    const target = focusMessage();
    if (!target || target.conversationId !== c.id) return;
    if (tab() !== "conversation") {
      tab.set("conversation");
      return;
    }
    const first = setTimeout(() => revealMessageView(target.messageId), 60);
    const settled = setTimeout(() => revealMessageView(target.messageId), 220);
    const clear = setTimeout(() => focusMessage.set(null), 2600);
    return () => {
      clearTimeout(first);
      clearTimeout(settled);
      clearTimeout(clear);
    };
  });
  return (
    <View class="min-w-0 flex-1 flex-col bg-chat">
      <ChatHeader conversation={c} />
      <ConversationStatusBar conversation={c} />
      <ConversationTabs conversation={c} value={tab()} onChange={tab.set} />
      <AnimatedSwap swapKey={tab()} class="relative min-h-0 flex-1">
        {(key) =>
          key === "conversation" ? (
            <View class="h-full min-h-0 flex-col">
              <Scroll
                class="flex-1 min-h-0"
                scrollbar={false}
                testID="conversation-thread"
                ref={(node) => {
                  chatScroll = node;
                }}
              >
                <View
                  onLayout={() => {
                    if (initialScrollDone) return;
                    initialScrollDone = true;
                    setTimeout(() => chatScroll?.scrollToEnd({ animated: false }), 220);
                  }}
                >
                  <MessageList conversation={c} />
                  <SentBubble />
                </View>
              </Scroll>
              <Composer
                onSent={() =>
                  setTimeout(() => {
                    chatScroll?.scrollTo({ y: 999999, animated: true });
                  }, 120)
                }
              />
            </View>
          ) : (
            <Scroll class="h-full min-h-0" scrollbar={false} testID={`conversation-${key}`}>
              <If when={key === "files"}>
                <FilesTab conversation={c} />
              </If>
              <If when={key === "quotes"}>
                <QuotesTab conversation={c} />
              </If>
              <If when={key === "starred"}>
                <StarredTab conversation={c} />
              </If>
            </Scroll>
          )
        }
      </AnimatedSwap>
      <If when={messageInfo()?.conversationId === c.id}>
        <MessageInfoFor conversation={c} />
      </If>
      <If when={forwardingMessage()?.conversationId === c.id}>
        <ForwardFor conversation={c} />
      </If>
    </View>
  );
}

function MessageInfoFor(props: { conversation: Conversation }) {
  const ref = messageInfo();
  if (!ref || ref.conversationId !== props.conversation.id) return null;
  const message = messageById(props.conversation, ref.messageId);
  return message && message.kind !== "system" ? (
    <MessageInfoDialog conversation={props.conversation} message={message} />
  ) : null;
}

function ForwardFor(props: { conversation: Conversation }) {
  const ref = forwardingMessage();
  if (!ref || ref.conversationId !== props.conversation.id) return null;
  const message = messageById(props.conversation, ref.messageId);
  return message && message.kind !== "system" ? (
    <ForwardDialog conversation={props.conversation} message={message} />
  ) : null;
}
