import { Text, View } from "nsh";
import { Icon } from "../../components/ui";
import type { Conversation } from "../../data";
import { ConversationEmpty } from "./ConversationEmpty";
import { messagePreview, overrideFor, type ThreadMessage } from "./message-actions";
import { starredFor } from "./threadViews";

function sender(message: ThreadMessage, conversation: Conversation): string {
  if (message.kind === "system" || message.kind === "whisper") return "System";
  return message.from === "me" ? "You" : conversation.name;
}

export function StarredTab(props: { conversation: Conversation }) {
  const starred = starredFor(props.conversation);
  return (
    <View class="gap-2 p-5">
      <If
        when={starred.length > 0}
        else={
          <ConversationEmpty
            icon="star"
            title="No starred messages"
            detail="Star a message from its actions menu to keep it close in this view."
          />
        }
      >
        <Each of={starred}>
          {(message: () => ThreadMessage) => (
            <View class="gap-1 rounded-xl border border-border bg-panel p-3">
              <View class="flex-row items-center gap-1.5">
                <Icon name="star" size={10} tone="warning" />
                <Text class="flex-1 text-[11px] font-medium text-muted-foreground">
                  {sender(message(), props.conversation)}
                </Text>
                <Text class="text-[11px] text-muted-foreground">{message().time}</Text>
              </View>
              <Text class="text-[12px] leading-4.5 text-foreground" style={{ numberOfLines: 3 }}>
                {overrideFor(message().id).text ?? messagePreview(message())}
              </Text>
            </View>
          )}
        </Each>
      </If>
    </View>
  );
}
