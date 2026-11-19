import { effect, Scroll, type ScrollRef, View } from "nsh";
import type { Conversation } from "../data";
import { ChatHeader } from "./conversation/ChatHeader";
import { ConversationStatusBar } from "../components/ConversationStatusBar";
import { Composer } from "./conversation/Composer";
import { MessageList } from "./conversation/MessageList";
import { SentBubble } from "./conversation/SentBubble";
import { PipelineStrip } from "./conversation/PipelineStrip";
import { MessageInfoDialog } from "./conversation/MessageInfoDialog";
import { ForwardDialog } from "./conversation/ForwardDialog";
import { forwardingMessage, messageById, messageInfo } from "./conversation/message-actions";
import { selectedId } from "../state";

export function ConversationPane(props: { conversation: Conversation }) {
  const c = props.conversation;
  let chatScroll: ScrollRef | undefined;
  let initialScrollDone = false;
  effect(() => {
    if (selectedId() !== c.id) return;
    const first = setTimeout(() => chatScroll?.scrollToEnd({ animated: false }), 0);
    const settled = setTimeout(() => chatScroll?.scrollToEnd({ animated: false }), 120);
    return () => {
      clearTimeout(first);
      clearTimeout(settled);
    };
  });
  return (
    <View class="min-w-0 flex-1 flex-col bg-chat">
      <ChatHeader conversation={c} />
      <ConversationStatusBar conversation={c} />
      <PipelineStrip conversation={c} />
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
            setTimeout(() => chatScroll?.scrollToEnd({ animated: false }), 0);
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
