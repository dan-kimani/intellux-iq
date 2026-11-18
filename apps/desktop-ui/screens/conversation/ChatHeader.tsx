import { Text, token, View } from "nsh";
import { Avatar, Badge, Icon, IconButton, Verified } from "../../components/ui";
import { ActionMenu } from "../../components/ActionMenu";
import type { Conversation } from "../../data";
import {
  assignmentDialogOpen,
  assignmentFor,
  detailsPanelOpen,
  isAssignedToMe,
  markConversationUnread,
  reminderDialogOpen,
  showToast,
  tagDialogOpen,
} from "../../state";

export function ChatHeader(props: { conversation: Conversation }) {
  const c = props.conversation;
  const owner = () => assignmentFor(c);
  const primary = c.opportunities[0];
  return (
    <View class="h-19.5 shrink-0 flex-row items-center gap-3 border-b border-border bg-background px-5">
      <Avatar
        photo={c.photo}
        initials={c.initials}
        tone={c.tone}
        size={44}
        online={c.presence !== "offline"}
      />
      <View class="min-w-0 flex-1 gap-1">
        <View class="flex-row items-center gap-1.5">
          <Text class="text-[17px] font-semibold text-foreground" style={{ numberOfLines: 1 }}>
            {c.name}
          </Text>
          <If when={c.verified}>
            <Verified size={13} />
          </If>
          <View tooltip={<Text class="text-xs text-foreground">{c.channelAccount}</Text>}>
            <Badge variant={c.channel === "whatsapp" ? "success" : "primary"} class="ml-1">
              <Text
                class="text-[9px] font-semibold"
                style={{
                  color: c.channel === "whatsapp" ? token("success") : token("accent-foreground"),
                }}
              >
                {c.channel === "whatsapp" ? "WhatsApp" : "Email"}
              </Text>
            </Badge>
          </View>
          <If when={c.typing}>
            <Text class="text-[9px] font-medium text-highlight">typing…</Text>
          </If>
        </View>
        <View class="flex-row items-center gap-1.5">
          <Text class="text-[11.5px] text-muted-foreground" style={{ numberOfLines: 1 }}>
            {c.company}
            {primary ? ` · ${primary.name}` : " · No opportunity linked"}
          </Text>
          <View
            role="button"
            accessibilityLabel={`Owner: ${owner() ? owner()!.name : "Unassigned"}`}
            testID="conversation-assignment"
            onPress={() => assignmentDialogOpen.set(true)}
            class="h-4.5 flex-row items-center gap-1 rounded border border-border px-1.5"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <If when={owner() && !isAssignedToMe(c)}>
              <Icon name="users" size={8} tone="muted-foreground" />
            </If>
            <Text
              class="text-[7.5px] font-medium"
              style={{
                color: owner() && !isAssignedToMe(c) ? token("warning") : token("muted-foreground"),
              }}
            >
              {owner()
                ? isAssignedToMe(c)
                  ? "Assigned to you"
                  : `Assigned to ${owner()!.name}`
                : "Unassigned"}
            </Text>
          </View>
        </View>
      </View>

      <View class="flex-row items-center gap-0.5">
        <ActionMenu
          testID="conversation-actions-menu"
          trigger={
            <View
              role="button"
              accessibilityLabel="More conversation actions"
              testID="conversation-more"
              class="h-9 w-9 items-center justify-center rounded-md"
              hoverStyle={{ backgroundColor: token("accent") }}
              focusVisibleStyle={{
                outlineWidth: 2,
                outlineColor: token("ring"),
                outlineOffset: -2,
              }}
            >
              <Icon name="ellipsis" size={16} tone="muted-foreground" />
            </View>
          }
          groups={[
            [
              {
                id: "unread",
                label: "Mark as unread",
                icon: "check",
                onSelect: () => {
                  markConversationUnread(c.id);
                  showToast("Conversation marked unread.");
                },
              },
              {
                id: "follow-up",
                label: "Create follow-up",
                icon: "calendarClock",
                onSelect: () => reminderDialogOpen.set(true),
              },
              {
                id: "tags",
                label: "Edit tags",
                icon: "funnel",
                onSelect: () => tagDialogOpen.set(true),
              },
            ],
            [
              {
                id: "owner",
                label: "Reassign conversation",
                icon: "users",
                onSelect: () => assignmentDialogOpen.set(true),
              },
            ],
          ]}
        />
        <View class="mx-1 h-5 w-px bg-border" />
        <IconButton
          icon="panelRight"
          label="Toggle contact panel"
          size={36}
          active={detailsPanelOpen()}
          onPress={() => detailsPanelOpen.set(!detailsPanelOpen())}
        />
      </View>
    </View>
  );
}
