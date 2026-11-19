import { Clipboard, reduceMotion, Text, token, View } from "nsh";
import { Popover } from "nsh/base";
import { Icon, type IconName } from "../../components/ui";
import type { Conversation } from "../../data";
import { setDraftFor, showToast } from "../../state";
import {
  clearReply,
  deleteMessage,
  editingMessage,
  forwardingMessage,
  messageInfo,
  messagePreview,
  overrideFor,
  pinMessage,
  pinnedMessages,
  startReply,
  toggleReaction,
  toggleStar,
  unpinMessage,
  type ActionableMessage,
} from "./message-actions";

const reactions = [
  { key: "like", emoji: "👍" },
  { key: "love", emoji: "❤️" },
  { key: "laugh", emoji: "😂" },
  { key: "wow", emoji: "😮" },
  { key: "sad", emoji: "😢" },
  { key: "pray", emoji: "🙏" },
];

function ActionRow(props: {
  id: string;
  label: string;
  icon: IconName;
  danger?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      testID={`message-action-${props.id}`}
      disabled={props.disabled}
      onPress={props.onPress}
      class="h-8 flex-row items-center gap-2.5 rounded-md px-2 transition-colors duration-150 motion-reduce:transition-none"
      hoverStyle={{ backgroundColor: token("accent") }}
      disabledStyle={{ opacity: 0.38 }}
    >
      <Icon name={props.icon} size={13} tone={props.danger ? "destructive" : "muted-foreground"} />
      <Text
        class="flex-1 text-[11.5px]"
        style={{ color: token(props.danger ? "destructive" : "foreground") }}
      >
        {props.label}
      </Text>
    </View>
  );
}

export function MessageActions(props: {
  conversation: Conversation;
  message: ActionableMessage;
  outgoing: boolean;
  open: () => boolean;
  setOpen: (open: boolean) => void;
}) {
  const override = () => overrideFor(props.message.id);
  const pinned = () => pinnedMessages()[props.conversation.id] === props.message.id;
  const starred = () => Boolean(override().starred);
  const canCopy = props.message.kind === "text";

  const chooseReaction = (emoji: string) => {
    const next = toggleReaction(props.message.id, emoji);
    props.setOpen(false);
    showToast(next ? `Reacted ${emoji}.` : "Reaction removed.");
  };

  const copy = () => {
    if (props.message.kind !== "text") return;
    props.setOpen(false);
    void Clipboard.write({ text: override().text ?? props.message.text })
      .then(() => showToast("Message copied."))
      .catch(() => showToast("Could not copy the message."));
  };

  return (
    <Popover
      open={props.open()}
      onOpenChange={({ open: next }) => props.setOpen(next)}
      placement="top"
      align={props.outgoing ? "end" : "start"}
      offset={6}
      popupClass="rounded-xl border border-border bg-popover p-1 shadow-2xl transition duration-150 ease-out motion-reduce:transition-none"
      popupStartingClass="opacity-0 translate-y-1 scale-95"
      popupEndingClass="opacity-0 scale-95"
      popupStyle={{ width: 226 }}
      trigger={
        <View
          role="button"
          accessibilityLabel={`Message actions: ${messagePreview(props.message)}`}
          testID={`message-actions-${props.message.id}`}
          class="h-6 flex-row items-center gap-0.5 rounded-full px-1 transition-colors duration-150 motion-reduce:transition-none"
          hoverStyle={{ backgroundColor: token("accent") }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
        >
          <View
            class="overflow-hidden"
            style={{
              width: 12,
              height: 10,
              opacity: starred() ? 1 : 0,
              transform: starred() ? "scale(1)" : "scale(0.5)",
              transitionProperty: "opacity, transform",
              transitionDuration: reduceMotion() ? 0 : 160,
              transitionTimingFunction: "ease-out",
            }}
          >
            <Icon name="star" size={9} tone="warning" />
          </View>
          <Icon
            name="chevronDown"
            size={10}
            tone={props.outgoing ? "bubble-out-foreground" : "muted-foreground"}
          />
        </View>
      }
    >
      <View class="gap-0.5" testID="message-action-menu">
        <View class="flex-row items-center justify-between px-1 py-1">
          <Each of={reactions}>
            {(reaction: () => (typeof reactions)[number]) => (
              <View
                role="button"
                accessibilityLabel={`React with ${reaction().emoji}`}
                testID={`message-react-${reaction().key}`}
                onPress={() => chooseReaction(reaction().emoji)}
                class="h-7 w-7 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    override().reaction === reaction().emoji ? token("accent") : "transparent",
                }}
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <Text class="text-[14px]">{reaction().emoji}</Text>
              </View>
            )}
          </Each>
        </View>
        <View class="my-0.5 h-px bg-border" />
        <ActionRow
          id="reply"
          label="Reply"
          icon="reply"
          onPress={() => {
            startReply(props.conversation, props.message);
            props.setOpen(false);
            showToast("Reply started.");
          }}
        />
        <ActionRow id="copy" label="Copy" icon="copy" disabled={!canCopy} onPress={copy} />
        <If when={props.outgoing && props.message.kind === "text"}>
          <ActionRow
            id="edit"
            label="Edit"
            icon="pencil"
            onPress={() => {
              setDraftFor(
                props.conversation.id,
                override().text ?? (props.message.kind === "text" ? props.message.text : ""),
              );
              clearReply();
              editingMessage.set({
                conversationId: props.conversation.id,
                messageId: props.message.id,
              });
              props.setOpen(false);
              showToast("Editing message.");
            }}
          />
        </If>
        <ActionRow
          id="forward"
          label="Forward"
          icon="forward"
          onPress={() => {
            forwardingMessage.set({
              conversationId: props.conversation.id,
              messageId: props.message.id,
            });
            props.setOpen(false);
          }}
        />
        <ActionRow
          id="pin"
          label={pinned() ? "Unpin message" : "Pin message"}
          icon="pin"
          onPress={() => {
            if (pinned()) {
              unpinMessage(props.conversation.id);
              showToast("Message unpinned.");
            } else {
              pinMessage(props.conversation.id, props.message.id);
              showToast("Message pinned.");
            }
            props.setOpen(false);
          }}
        />
        <ActionRow
          id="star"
          label={starred() ? "Unstar message" : "Star message"}
          icon="star"
          onPress={() => {
            const next = toggleStar(props.message.id);
            showToast(next ? "Message starred." : "Message unstarred.");
            props.setOpen(false);
          }}
        />
        <ActionRow
          id="info"
          label="Message info"
          icon="info"
          onPress={() => {
            messageInfo.set({
              conversationId: props.conversation.id,
              messageId: props.message.id,
            });
            props.setOpen(false);
          }}
        />
        <View class="my-0.5 h-px bg-border" />
        <ActionRow
          id="delete-me"
          label="Delete for me"
          icon="trash"
          danger
          onPress={() => {
            props.setOpen(false);
            deleteMessage(props.conversation, props.message, "me");
            showToast("Message deleted for you.");
          }}
        />
        <If when={props.outgoing}>
          <ActionRow
            id="delete-everyone"
            label="Delete for everyone"
            icon="trash"
            danger
            onPress={() => {
              props.setOpen(false);
              deleteMessage(props.conversation, props.message, "everyone");
              showToast("Message deleted for everyone.");
            }}
          />
        </If>
      </View>
    </Popover>
  );
}
