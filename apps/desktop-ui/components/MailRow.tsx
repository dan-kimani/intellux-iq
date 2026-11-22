import { signal, Text, token, View } from "nsh";
import { ContextActions } from "./ContextActions";
import { Avatar, Icon, Tooltip } from "./ui";
import { emailFolder } from "../state";
import { emailThreadLink } from "../screens/work/links";
import { workMenuActions } from "../screens/work/actions";
import { mailPartyName } from "../screens/inbox/mailIdentity";
import {
  deleteMail,
  mailSelectedIds,
  moveMail,
  openMailItem,
  setMailRead,
  toggleMailSelected,
  toggleMailStar,
} from "../screens/inbox/mailState";
import type { MailItem, MailStatus } from "../screens/inbox/mail";

const statusStyle: Record<
  MailStatus,
  { label: string; tone: "muted-foreground" | "success" | "warning" | "alert" | "info" }
> = {
  queued: { label: "Queued", tone: "muted-foreground" },
  sending: { label: "Sending", tone: "info" },
  sent: { label: "Sent", tone: "muted-foreground" },
  delivered: { label: "Delivered", tone: "success" },
  failed: { label: "Failed", tone: "alert" },
  bounced: { label: "Bounced", tone: "warning" },
  draft: { label: "Draft", tone: "muted-foreground" },
};

function partyOf(item: MailItem): string {
  return item.folder === "Sent" || item.folder === "Drafts" ? item.to : item.from;
}

export function MailRow(props: {
  item: MailItem;
  count: number;
  threadIds: string[];
  unread?: boolean;
}) {
  const item = props.item;
  const rowId = props.threadIds[props.threadIds.length - 1] ?? item.id;
  const hovered = signal(false);
  const selected = () => mailSelectedIds().includes(props.threadIds[0] ?? item.id);
  const allSelected = () => props.threadIds.every((id) => mailSelectedIds().includes(id));
  const senderName = mailPartyName(partyOf(item));
  const status = () => (item.status ? statusStyle[item.status] : null);
  const archived = () => item.folder === "Archive";
  const archiveTarget = () => (archived() ? "Inbox" : "Archive");
  return (
    <ContextActions
      testID={`mail-context-${item.id}`}
      trigger={
        <View
          role="button"
          accessibilityLabel={`Open email ${item.subject}`}
          testID={`mail-${rowId}`}
          onPress={() => openMailItem(item)}
          onMouseEnter={() => hovered.set(true)}
          onMouseLeave={() => hovered.set(false)}
          class="relative cursor-pointer flex-row items-start gap-2.5 border-b border-l-2 border-border px-3 py-3"
          style={{
            borderLeftColor: selected() ? token("primary") : "transparent",
            backgroundColor: selected()
              ? token("accent")
              : hovered()
                ? token("muted")
                : "transparent",
          }}
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <View
            role="button"
            accessibilityLabel={allSelected() ? "Deselect thread" : "Select thread"}
            testID={`mail-select-${rowId}`}
            onPress={() => {
              if (allSelected()) {
                props.threadIds.forEach((id) => {
                  if (mailSelectedIds().includes(id)) toggleMailSelected(id);
                });
              } else {
                props.threadIds.forEach((id) => {
                  if (!mailSelectedIds().includes(id)) toggleMailSelected(id);
                });
              }
            }}
            class="mt-1 h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border"
            style={{
              borderColor: selected() ? token("primary") : token("border"),
              backgroundColor: selected() ? token("primary") : "transparent",
            }}
          >
            <If when={selected()}>
              <Icon name="check" size={10} tone="primary-foreground" />
            </If>
          </View>

          <Avatar name={senderName} size={28} />

          <View class="min-w-0 flex-1 gap-0.5">
            <View class="flex-row items-center gap-1.5">
              <If when={props.unread ?? !item.read}>
                <View
                  class="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: token("unread") }}
                />
              </If>
              <Text
                class="min-w-0 flex-1 text-[13px] leading-4.5 font-medium text-foreground"
                style={{ numberOfLines: 2 }}
              >
                {item.subject}
              </Text>
            </View>
            <View class="flex-row items-center gap-1.5">
              <Text class="text-[11px] leading-4 text-muted-foreground">{senderName}</Text>
              <If when={props.count > 1}>
                <View testID={`mail-thread-${rowId}`} class="flex-row items-center gap-0.5">
                  <Icon name="messageCircle" size={9} tone="muted-foreground" />
                  <Text class="text-[10px] tabular-nums text-muted-foreground">{props.count}</Text>
                </View>
              </If>
              <If when={item.attachments.length > 0}>
                <Icon name="paperclip" size={9} tone="muted-foreground" />
              </If>
            </View>
            <Text
              class="text-[12px] leading-4.5 text-muted-foreground"
              style={{ numberOfLines: 2 }}
            >
              {item.preview}
            </Text>
          </View>

          <View class="w-16 shrink-0 items-end gap-1">
            <Text class="text-[10px] tabular-nums text-muted-foreground">{item.date}</Text>
            <If when={status() && emailFolder() !== "Inbox"}>
              <Text class="text-[10px] font-medium" style={{ color: token(status()!.tone) }}>
                {status()!.label}
              </Text>
            </If>
            <View class="flex-row items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
              <View
                role="button"
                accessibilityLabel={item.starred ? "Remove from Priority" : "Add to Priority"}
                testID={`mail-star-${rowId}`}
                tooltip={
                  <Tooltip
                    label={item.starred ? "Remove from Priority" : "Add to Priority"}
                    placement="right"
                  />
                }
                onPress={() => toggleMailStar(item.id)}
                class="h-4.5 w-4.5 cursor-pointer items-center justify-center rounded"
                hoverStyle={{ backgroundColor: token("accent") }}
                activeStyle={{ opacity: 0.7 }}
                focusVisibleStyle={{
                  outlineWidth: 2,
                  outlineColor: token("ring"),
                  outlineOffset: 1,
                }}
              >
                <Icon name="star" size={11} tone={item.starred ? "warning" : "muted-foreground"} />
              </View>
              <If when={hovered()}>
                <View
                  role="button"
                  accessibilityLabel={archived() ? "Move to Inbox" : "Archive email"}
                  testID={`mail-archive-${rowId}`}
                  tooltip={
                    <Tooltip
                      label={archived() ? "Move to Inbox" : "Archive email"}
                      placement="right"
                    />
                  }
                  onPress={() => moveMail([item.id], archiveTarget())}
                  class="h-4.5 w-4.5 cursor-pointer items-center justify-center rounded"
                  hoverStyle={{ backgroundColor: token("accent") }}
                  activeStyle={{ opacity: 0.7 }}
                  focusVisibleStyle={{
                    outlineWidth: 2,
                    outlineColor: token("ring"),
                    outlineOffset: 1,
                  }}
                >
                  <Icon name={archived() ? "mail" : "archive"} size={11} tone="muted-foreground" />
                </View>
                <View
                  role="button"
                  accessibilityLabel="Delete email"
                  testID={`mail-delete-${rowId}`}
                  tooltip={<Tooltip label="Delete email" placement="right" />}
                  onPress={() => deleteMail([item.id])}
                  class="h-4.5 w-4.5 cursor-pointer items-center justify-center rounded"
                  hoverStyle={{ backgroundColor: token("destructive") }}
                  activeStyle={{ opacity: 0.7 }}
                  focusVisibleStyle={{
                    outlineWidth: 2,
                    outlineColor: token("ring"),
                    outlineOffset: 1,
                  }}
                >
                  <Icon name="trash" size={11} tone="foreground" />
                </View>
              </If>
            </View>
          </View>
        </View>
      }
      groups={[
        workMenuActions(emailThreadLink(item)).map((action) => ({
          id: action.id,
          label: action.label,
          icon: action.icon,
          onSelect: action.onSelect,
        })),
        [
          {
            id: "toggle-star",
            label: item.starred ? "Remove from Priority" : "Add to Priority",
            icon: "star",
            onSelect: () => toggleMailStar(item.id),
          },
          {
            id: "mark-unread",
            label: "Mark unread",
            icon: "mail",
            onSelect: () => setMailRead([item.id], false),
          },
          {
            id: "archive",
            label: archived() ? "Move to Inbox" : "Archive",
            icon: archived() ? "mail" : "archive",
            onSelect: () => moveMail([item.id], archiveTarget()),
          },
          {
            id: "delete",
            label: "Delete",
            icon: "trash",
            onSelect: () => deleteMail([item.id]),
          },
        ],
      ]}
    />
  );
}
