import { reduceMotion, Text, View } from "nsh";
import { Icon, IconButton } from "../../components/ui";
import { Reveal, useAfter } from "../../components/motion";
import type { Conversation } from "../../data";
import { BubbleMeta } from "./BubbleMeta";
import { statusFor } from "./message-status";
import {
  messagePreview,
  overrideFor,
  unpinMessage,
  type ActionableMessage,
  type ThreadMessage,
} from "./message-actions";

export function DeletedBubble(props: { message: ActionableMessage }) {
  const outgoing = props.message.from === "me";
  const entered = useAfter(16);
  return (
    <View
      class="max-w-107.5 gap-1.5 rounded-xl border border-dashed border-border bg-panel px-4 py-3"
      style={{
        alignSelf: outgoing ? "flex-end" : "flex-start",
        opacity: entered() ? 1 : 0,
        transform: entered() ? "scale(1)" : "scale(0.96)",
        transitionProperty: "opacity, transform",
        transitionDuration: reduceMotion() ? 0 : 170,
        transitionTimingFunction: "ease-out",
      }}
    >
      <View class="flex-row items-center gap-1.5">
        <Icon name="close" size={10} tone="muted-foreground" />
        <Text class="text-[12px] italic text-muted-foreground">This message was deleted</Text>
      </View>
      <BubbleMeta time={props.message.time} outgoing={outgoing} status={statusFor(props.message)} />
    </View>
  );
}

export function PinnedBanner(props: { conversation: Conversation; message: ThreadMessage }) {
  return (
    <Reveal
      from="top"
      class="flex-row items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2"
      testID="pinned-message"
    >
      <Icon name="pin" size={11} tone="highlight" />
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Pinned message
        </Text>
        <Text class="text-[12px] text-foreground" style={{ numberOfLines: 2 }}>
          {overrideFor(props.message.id).text ?? messagePreview(props.message)}
        </Text>
      </View>
      <IconButton
        icon="close"
        label="Unpin message"
        size={24}
        onPress={() => unpinMessage(props.conversation.id)}
      />
    </Reveal>
  );
}
