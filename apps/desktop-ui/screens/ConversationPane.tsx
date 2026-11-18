import { Scroll, type ScrollRef, View } from "nsh";
import type { Conversation } from "../data";
import { ChatHeader } from "./conversation/ChatHeader";
import { ConversationStatusBar } from "../components/ConversationStatusBar";
import { Composer } from "./conversation/Composer";
import { MessageList } from "./conversation/MessageList";
import { SentBubble } from "./conversation/SentBubble";
import { PipelineStrip } from "./conversation/PipelineStrip";

export function ConversationPane(props: { conversation: Conversation }) {
  const c = props.conversation;
  let chatScroll: ScrollRef | undefined;
  return (
    <View class="min-w-0 flex-1 flex-col bg-chat">
      <ChatHeader conversation={c} />
      <ConversationStatusBar conversation={c} />
      <PipelineStrip conversation={c} />
      <Scroll
        class="flex-1 min-h-0"
        scrollbar={false}
        ref={(node) => {
          chatScroll = node;
        }}
      >
        <MessageList conversation={c} />
        <SentBubble />
      </Scroll>
      <Composer
        onSent={() =>
          setTimeout(() => {
            chatScroll?.scrollTo({ y: 999999, animated: true });
          }, 120)
        }
      />
    </View>
  );
}
