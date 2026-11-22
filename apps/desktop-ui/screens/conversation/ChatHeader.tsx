import { Text, token, View } from "nsh";
import { Avatar, Badge, Icon, IconButton, Tooltip, Verified } from "../../components/ui";
import { ActionMenu } from "../../components/ActionMenu";
import { workMenuActions } from "../work/actions";
import { conversationLink } from "../work/links";
import type { Conversation, OpportunityLink } from "../../data";
import {
  assignmentDialogOpen,
  assignmentFor,
  detailsPanelOpen,
  isAssignedToMe,
  markConversationUnread,
  opportunitiesFor,
  showToast,
  tagDialogOpen,
} from "../../state";
import { openOpportunitiesTab } from "../details/panelState";
import { currencySymbol } from "../../lib/money";
import { isWatched, toggleWatch } from "../../watch/state";

function currencyOf(value: string): string {
  const match = /^(?:€|£|KSh|\$|[A-Z]{2,3})/.exec(value.trim());
  return match?.[1] ?? "";
}

function openValue(rows: OpportunityLink[]): string {
  if (rows.length === 0) return "";
  const currency = currencyOf(rows[0].value);
  if (!currency || rows.some((row) => currencyOf(row.value) !== currency)) return "";
  const total = rows.reduce((sum, row) => sum + Number(row.value.replace(/\D/g, "")), 0);
  if (total <= 0) return "";
  const compact =
    total >= 1_000_000
      ? `${(total / 1_000_000).toFixed(1)}M`
      : total >= 1000
        ? `${Math.round(total / 1000)}k`
        : `${total}`;
  return `${currencySymbol()}${compact}`;
}

export function ChatHeader(props: { conversation: Conversation }) {
  const c = props.conversation;
  const owner = () => assignmentFor(c);
  const open = () =>
    opportunitiesFor(c).filter((row) => row.stage !== "won" && row.stage !== "lost");
  return (
    <View class="min-h-19.5 shrink-0 flex-row items-center gap-3 border-b border-border bg-background px-5 py-3">
      <Avatar name={c.name} size={44} online={c.presence !== "offline"} />
      <View class="min-w-0 flex-1 gap-1">
        <View class="flex-row flex-wrap items-center gap-1.5">
          <Text class="text-[18px] font-semibold text-foreground" style={{ numberOfLines: 2 }}>
            {c.name}
          </Text>
          <If when={c.verified}>
            <Verified size={13} />
          </If>
          <View tooltip={<Tooltip label={c.channelAccount} />}>
            <Badge variant={c.channel === "whatsapp" ? "success" : "primary"} class="ml-1">
              <Text
                class="text-[11px] font-semibold"
                style={{
                  color: c.channel === "whatsapp" ? token("success") : token("accent-foreground"),
                }}
              >
                {c.channel === "whatsapp" ? "WhatsApp" : "Email"}
              </Text>
            </Badge>
          </View>
          <Text class="shrink-0 text-[11px] capitalize text-muted-foreground">
            {c.typing ? "typing…" : `· ${c.presence.replace("_", " ")}`}
          </Text>
        </View>
        <View class="flex-row flex-wrap items-center gap-1.5">
          <Text class="min-w-0 text-[12px] text-muted-foreground" style={{ numberOfLines: 1 }}>
            {c.company}
          </Text>
          <View
            role="button"
            accessibilityLabel="Open opportunities panel"
            testID="chat-opportunities"
            onPress={() => openOpportunitiesTab()}
            class="h-5 shrink-0 flex-row items-center gap-1 rounded-full border border-border bg-panel px-2"
            hoverStyle={{ backgroundColor: token("accent") }}
            focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
          >
            <Icon name="briefcase" size={8} tone="muted-foreground" />
            <Text class="text-[11px] font-medium text-foreground">
              {opportunitiesFor(c).length === 0
                ? "No opportunity"
                : open().length === 0
                  ? "No open deal"
                  : `${open().length} ${open().length === 1 ? "opportunity" : "opportunities"}`}
            </Text>
            <If when={openValue(open())}>
              <Text class="text-[11px] text-muted-foreground">· {openValue(open())}</Text>
            </If>
          </View>
          <View
            role="button"
            accessibilityLabel={`Owner: ${owner() ? owner()!.name : "Unassigned"}`}
            testID="conversation-assignment"
            onPress={() => assignmentDialogOpen.set(true)}
            class="h-4.5 shrink-0 flex-row items-center gap-1 rounded border border-border px-1.5"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <If when={owner() && !isAssignedToMe(c)}>
              <Icon name="users" size={8} tone="muted-foreground" />
            </If>
            <Text
              class="text-[11px] font-medium"
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
            workMenuActions(conversationLink(c)),
          ]}
        />
        <View class="mx-1 h-5 w-px bg-border" />
        <IconButton
          icon="eye"
          label={
            isWatched("conversation", c.id)
              ? "Stop watching this conversation"
              : "Watch this conversation"
          }
          size={36}
          testID="conversation-watch"
          active={isWatched("conversation", c.id)}
          onPress={() => toggleWatch("conversation", c.id)}
        />
        <IconButton
          icon="panelRight"
          label="Toggle contact panel"
          size={36}
          testID="details-toggle"
          active={detailsPanelOpen()}
          onPress={() => detailsPanelOpen.set(!detailsPanelOpen())}
        />
      </View>
    </View>
  );
}
