import { Text, token, View } from "nsh";
import { Icon, withAlpha } from "../../components/ui";
import { BubbleMeta } from "./BubbleMeta";
import type { DeliveryStatus } from "../../data";
import {
  outbox,
  selectedConversation,
  sentKind,
  sentMessage,
  sentOutboxId,
  sentRevision,
  sentTemplate,
} from "../../state";
import { WhatsAppTranscript } from "./WhatsAppTranscript";
import { ReplyQuote } from "./ReplyQuote";
import { sentReplyTo } from "./message-actions";
import { Reveal } from "../../components/motion";

function sentStatus(): DeliveryStatus {
  const item = outbox().find((row) => row.id === sentOutboxId());
  if (!item) return "sending";
  return item.status;
}

function SentBody() {
  const text = sentMessage();
  const kind = sentKind();
  const template = sentTemplate();
  if (kind === "note") {
    return (
      <View class="gap-1 self-start rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-2.5">
        <View class="flex-row items-center gap-1.5">
          <Icon name="shieldCheck" size={10} tone="warning" />
          <Text class="text-[8px] font-semibold uppercase tracking-wide text-warning">
            Internal note · team-visible
          </Text>
        </View>
        <Text class="text-[11.5px] leading-4.5 text-foreground">{text}</Text>
        <Text class="text-[8.5px] text-muted-foreground">Just now</Text>
      </View>
    );
  }
  return (
    <View
      class="max-w-107.5 gap-1.5 self-end px-4 py-3"
      style={{
        backgroundColor: token("bubble-out"),
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 3,
      }}
    >
      <If when={sentReplyTo()}>
        <ReplyQuote replyTo={sentReplyTo()!} outgoing />
      </If>
      <If when={template}>
        <View class="flex-row items-center gap-1">
          <Icon name="fileText" size={9} tone="bubble-out-foreground" />
          <Text
            class="text-[8px] font-medium"
            style={{ color: withAlpha(token("bubble-out-foreground"), "aa") }}
          >
            Template {template?.name} · {template?.language.toUpperCase()}
          </Text>
        </View>
      </If>
      <If
        when={selectedConversation().channel === "whatsapp"}
        else={
          <Text
            class="text-[13px]"
            style={{ lineHeight: 20, color: token("bubble-out-foreground") }}
          >
            {text}
          </Text>
        }
      >
        <WhatsAppTranscript text={text ?? ""} outgoing />
      </If>
      <BubbleMeta time="Just now" outgoing status={sentStatus()} />
    </View>
  );
}

export function SentBubble() {
  return (
    <View class="px-5 pb-4" android={{ accessibilityLiveRegion: "polite" }}>
      <If when={sentMessage()}>
        <Each of={sentRevision() ? [sentRevision()] : []}>
          {() => (
            <Reveal from="bottom" class="w-full">
              <SentBody />
            </Reveal>
          )}
        </Each>
      </If>
    </View>
  );
}
