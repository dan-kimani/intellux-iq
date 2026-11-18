import { Text, token, View } from "nsh";
import { Icon, withAlpha } from "../../components/ui";
import type { Channel, Conversation, Message, ReplyPreview } from "../../data";
import { BubbleMeta } from "./BubbleMeta";
import { FileBubble, ImageBubble } from "./MessageAttachments";
import { statusFor } from "./message-status";
import { WhatsAppTranscript } from "./WhatsAppTranscript";

function ReplyQuote(props: { replyTo: ReplyPreview; outgoing?: boolean }) {
  return (
    <View
      class="gap-0.5 border-l-2 pl-2"
      style={{
        borderColor: props.outgoing ? token("bubble-out-foreground") : token("primary"),
      }}
    >
      <Text
        class="text-[8.5px] font-semibold"
        style={{
          color: props.outgoing
            ? withAlpha(token("bubble-out-foreground"), "cc")
            : token("highlight"),
        }}
      >
        {props.replyTo.from}
      </Text>
      <Text
        class="text-[9px]"
        style={{
          color: props.outgoing
            ? withAlpha(token("bubble-out-foreground"), "aa")
            : token("muted-foreground"),
          numberOfLines: 1,
        }}
      >
        {props.replyTo.text}
      </Text>
    </View>
  );
}

function AudioBubble(props: { message: Extract<Message, { kind: "audio" }> }) {
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
      <BubbleMeta time={props.message.time} outgoing={outgoing} status={statusFor(props.message)} />
    </View>
  );
}

function TextBubble(props: { message: Extract<Message, { kind: "text" }>; channel: Channel }) {
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
        <WhatsAppTranscript text={m.text} outgoing={outgoing} />
      </If>
      <BubbleMeta time={m.time} outgoing={outgoing} status={statusFor(m)} />
    </View>
  );
}

function MessageBubble(props: { message: Message; channel: Channel }) {
  const m = props.message;
  if (m.kind === "system") {
    return (
      <View class="my-1 items-center">
        <View class="rounded-full border border-border bg-panel px-3 py-1">
          <Text class="text-[9px] text-muted-foreground">{m.text}</Text>
        </View>
      </View>
    );
  }
  if (m.kind === "whisper") {
    return (
      <View class="max-w-140 gap-1 self-start rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-2.5">
        <View class="flex-row items-center gap-1.5">
          <Icon name="shieldCheck" size={10} tone="warning" />
          <Text class="text-[8px] font-semibold uppercase tracking-wide text-warning">
            Internal note · team-visible
          </Text>
        </View>
        <Text class="text-[11.5px] leading-4.5 text-foreground">{m.text}</Text>
        <BubbleMeta time={m.time} />
      </View>
    );
  }
  if (m.kind === "audio") return <AudioBubble message={m} />;
  if (m.kind === "image") return <ImageBubble message={m} />;
  if (m.kind === "file") return <FileBubble message={m} />;
  return <TextBubble message={m} channel={props.channel} />;
}

export function MessageList(props: { conversation: Conversation }) {
  return (
    <View class="gap-3 px-5 py-4">
      <View class="my-2 flex-row items-center justify-center gap-2">
        <View class="h-px flex-1 bg-border" />
        <Text class="text-[9.5px] font-medium text-muted-foreground">Today</Text>
        <View class="h-px flex-1 bg-border" />
      </View>
      <Each of={props.conversation.messages}>
        {(message: () => Message) => (
          <MessageBubble message={message()} channel={props.conversation.channel} />
        )}
      </Each>
    </View>
  );
}
