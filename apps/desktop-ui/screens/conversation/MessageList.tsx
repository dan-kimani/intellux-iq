import type { JSX } from "nsh";
import { signal, Text, token, View } from "nsh";
import { Icon, withAlpha } from "../../components/ui";
import { Reveal } from "../../components/motion";
import type { Channel, Conversation, Message } from "../../data";
import { FileBubble, ImageBubble } from "./MessageAttachments";
import { MessageActions } from "./MessageActions";
import { statusFor } from "./message-status";
import { BubbleMeta } from "./BubbleMeta";
import { DeletedBubble, PinnedBanner } from "./MessageNotices";
import {
  messageById,
  messageOverrides,
  messagesFor,
  overrideFor,
  pinnedMessages,
  toggleReaction,
  type ThreadMessage,
} from "./message-actions";
import { ReplyQuote } from "./ReplyQuote";
import { WhatsAppTranscript } from "./WhatsAppTranscript";

function AudioBubble(props: {
  message: Extract<Message, { kind: "audio" }>;
  actions?: JSX.Element;
}) {
  const outgoing = props.message.from === "me";
  return (
    <View
      class="max-w-82 gap-1.5 rounded-xl px-3.5 py-2.5"
      style={{
        alignSelf: outgoing ? "flex-end" : "flex-start",
        backgroundColor: outgoing ? token("bubble-out") : token("bubble-in"),
        borderWidth: outgoing ? 0 : 1,
        borderColor: token("border"),
      }}
    >
      <View class="flex-row items-center gap-2">
        <View
          class="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: withAlpha(token("primary"), "26") }}
        >
          <Icon name="mic" size={14} tone={outgoing ? "bubble-out-foreground" : "highlight"} />
        </View>
        <View class="h-4 w-32 flex-row items-center gap-0.5">
          <Each of={[4, 9, 6, 12, 7, 14, 8, 5, 11, 6, 9, 4]}>
            {(height: () => number) => (
              <View
                class="flex-1 rounded-full"
                style={{
                  height: height(),
                  backgroundColor: outgoing
                    ? withAlpha(token("bubble-out-foreground"), "77")
                    : token("muted-foreground"),
                }}
              />
            )}
          </Each>
        </View>
        <Text
          class="text-[9px]"
          style={{
            color: outgoing
              ? withAlpha(token("bubble-out-foreground"), "aa")
              : token("muted-foreground"),
          }}
        >
          {props.message.duration}
        </Text>
      </View>
      <BubbleMeta
        time={props.message.time}
        outgoing={outgoing}
        status={statusFor(props.message)}
        actions={props.actions}
      />
    </View>
  );
}

function TextBubble(props: {
  message: Extract<Message, { kind: "text" }>;
  channel: Channel;
  onContextMenu?: () => void;
  actions?: JSX.Element;
}) {
  const m = props.message;
  const outgoing = m.from === "me";
  return (
    <View
      class="max-w-107.5 gap-1.5 px-4 py-3"
      style={{
        alignSelf: outgoing ? "flex-end" : "flex-start",
        backgroundColor: outgoing ? token("bubble-out") : token("bubble-in"),
        borderWidth: outgoing ? 0 : 1,
        borderColor: token("border"),
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: outgoing ? 12 : 3,
        borderBottomRightRadius: outgoing ? 3 : 12,
      }}
    >
      <If when={m.replyTo}>
        <ReplyQuote replyTo={m.replyTo!} outgoing={outgoing} />
      </If>
      <If
        when={props.channel === "whatsapp"}
        else={
          <Text
            class="text-[13px]"
            style={{
              lineHeight: 20,
              color: outgoing ? token("bubble-out-foreground") : token("bubble-in-foreground"),
            }}
          >
            {m.text}
          </Text>
        }
      >
        <WhatsAppTranscript text={m.text} outgoing={outgoing} onContextMenu={props.onContextMenu} />
      </If>
      <BubbleMeta time={m.time} outgoing={outgoing} status={statusFor(m)} actions={props.actions} />
    </View>
  );
}

function MessageBubble(props: {
  message: ThreadMessage;
  channel: Channel;
  onContextMenu?: () => void;
  actions?: JSX.Element;
}) {
  const message = props.message;
  if (message.kind === "system") {
    return (
      <View class="my-1 items-center">
        <View class="rounded-full border border-border bg-panel px-3 py-1">
          <Text class="text-[9px] text-muted-foreground">{message.text}</Text>
        </View>
      </View>
    );
  }
  if (message.kind === "whisper") {
    return (
      <View class="max-w-140 gap-1 self-start rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-2.5">
        <View class="flex-row items-center gap-1.5">
          <Icon name="shieldCheck" size={10} tone="warning" />
          <Text class="text-[8px] font-semibold uppercase tracking-wide text-warning">
            Internal note · team-visible
          </Text>
        </View>
        <Text class="text-[11.5px] leading-4.5 text-foreground">{message.text}</Text>
        <BubbleMeta time={message.time} />
      </View>
    );
  }
  if (message.kind === "audio") return <AudioBubble message={message} actions={props.actions} />;
  if (message.kind === "image") return <ImageBubble message={message} actions={props.actions} />;
  if (message.kind === "file") return <FileBubble message={message} actions={props.actions} />;
  return (
    <TextBubble
      message={message}
      channel={props.channel}
      onContextMenu={props.onContextMenu}
      actions={props.actions}
    />
  );
}

function MessageRow(props: {
  conversation: Conversation;
  message: ThreadMessage;
  channel: Channel;
}) {
  const m = props.message;
  if (m.kind === "system" || m.kind === "whisper") {
    return <MessageBubble message={m} channel={props.channel} />;
  }
  const override = () => overrideFor(m.id);
  if (override().deleted === "me") return null;
  const menuOpen = signal(false);
  const outgoing = m.from === "me";
  const text = override().text;
  const message = text && m.kind === "text" ? { ...m, text } : m;
  return (
    <View
      class="flex-col gap-1"
      testID={`message-${m.id}`}
      onContextMenu={() => menuOpen.set(true)}
    >
      <If
        when={override().deleted === "everyone"}
        else={
          <MessageBubble
            message={message}
            channel={props.channel}
            onContextMenu={() => menuOpen.set(true)}
            actions={
              <MessageActions
                conversation={props.conversation}
                message={m}
                outgoing={outgoing}
                open={menuOpen}
                setOpen={menuOpen.set}
              />
            }
          />
        }
      >
        <DeletedBubble message={m} />
      </If>
      <If when={override().reaction}>
        <Reveal from="scale" class={outgoing ? "self-end -mt-1.5" : "self-start -mt-1.5"}>
          <View
            role="button"
            accessibilityLabel={`Remove reaction ${override().reaction}`}
            testID={`message-reaction-${m.id}`}
            onPress={() => toggleReaction(m.id, override().reaction!)}
            class="rounded-full border border-border bg-card px-1.5 py-0.5"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text class="text-[11px]">{override().reaction}</Text>
          </View>
        </Reveal>
      </If>
    </View>
  );
}

export function MessageList(props: { conversation: Conversation }) {
  const messages = () => {
    messageOverrides();
    return messagesFor(props.conversation).filter(
      (message) => overrideFor(message.id).deleted !== "me",
    );
  };
  const pinned = () => {
    const id = pinnedMessages()[props.conversation.id];
    if (!id) return null;
    const message = messageById(props.conversation, id);
    return message && overrideFor(id).deleted !== "me" ? message : null;
  };
  return (
    <View class="gap-3 px-5 py-4" testID="message-list">
      <If when={pinned()}>
        <PinnedBanner conversation={props.conversation} message={pinned()!} />
      </If>
      <View class="my-2 flex-row items-center justify-center gap-2">
        <View class="h-px flex-1 bg-border" />
        <Text class="text-[9.5px] font-medium text-muted-foreground">Today</Text>
        <View class="h-px flex-1 bg-border" />
      </View>
      <Each of={messages()}>
        {(message: () => ThreadMessage) =>
          message().id.includes("-forward-") ? (
            <Reveal from="bottom">
              <MessageRow
                conversation={props.conversation}
                message={message()}
                channel={props.conversation.channel}
              />
            </Reveal>
          ) : (
            <MessageRow
              conversation={props.conversation}
              message={message()}
              channel={props.conversation.channel}
            />
          )
        }
      </Each>
    </View>
  );
}
