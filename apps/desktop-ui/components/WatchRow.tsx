import { Text, token, View } from "nsh";
import type { Tokens } from "nsh";
import { ActionMenu } from "./ActionMenu";
import { Icon, type IconName } from "./ui";
import {
  markWatchSeen,
  openWatchRow,
  toggleSnooze,
  unwatch,
  type WatchKind,
  type WatchRow,
} from "../watch/state";

const kindMeta: Record<WatchKind, { icon: IconName; label: string; tone: keyof Tokens }> = {
  conversation: { icon: "messageCircle", label: "Conversation", tone: "chart-1" },
  email: { icon: "mail", label: "Email", tone: "chart-2" },
  task: { icon: "checkCheck", label: "Task", tone: "chart-3" },
};

function labelTone(row: WatchRow): keyof Tokens {
  if (row.snoozed) return "muted-foreground";
  if (row.done) return "success";
  if (row.severity === "critical") return "destructive";
  if (row.severity === "attention") return "warning";
  return "muted-foreground";
}

function rowMenu(row: WatchRow) {
  return (
    <ActionMenu
      testID={`watch-menu-${row.kind}-${row.entry.refId}`}
      width={186}
      trigger={
        <View
          role="button"
          accessibilityLabel={`Actions for ${row.title}`}
          testID={`watch-menu-trigger-${row.kind}-${row.entry.refId}`}
          class="h-6 w-6 items-center justify-center rounded-md"
          hoverStyle={{ backgroundColor: token("accent") }}
          focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
        >
          <Icon name="ellipsis" size={13} tone="muted-foreground" />
        </View>
      }
      groups={[
        [
          {
            id: "watch-open",
            label: "Open",
            icon: "arrowUpRight",
            onSelect: () => openWatchRow(row),
          },
          {
            id: "watch-seen",
            label: "Mark seen",
            icon: "check",
            disabled: !row.newActivity,
            onSelect: () => markWatchSeen(row.entry),
          },
        ],
        [
          {
            id: "watch-snooze",
            label: row.snoozed ? "Wake now" : "Snooze 4 hours",
            icon: "moon",
            onSelect: () => toggleSnooze(row.entry),
          },
          {
            id: "watch-stop",
            label: "Stop watching",
            icon: "eye",
            danger: true,
            onSelect: () => unwatch(row.kind, row.entry.refId),
          },
        ],
      ]}
    />
  );
}

export function WatchRowView(props: { row: WatchRow }) {
  const row = () => props.row;
  const meta = () => kindMeta[row().kind];
  const tone = () => labelTone(row());
  return (
    <View
      class="flex-row items-start gap-2.5 border-b border-border px-3 py-2.5"
      style={{ opacity: row().snoozed ? 0.55 : 1 }}
      hoverStyle={{ backgroundColor: token("accent") }}
    >
      <View
        role="button"
        accessibilityLabel={`${row().newActivity ? "New, " : ""}${meta().label}: ${row().title}`}
        testID={`watch-row-${row().kind}-${row().entry.refId}`}
        onPress={() => openWatchRow(row())}
        class="min-w-0 flex-1 flex-row items-start gap-2.5"
        focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 2 }}
      >
        <View class="mt-0.5 h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent">
          <Icon name={meta().icon} size={13} tone={meta().tone} />
        </View>
        <View class="min-w-0 flex-1 gap-0.5">
          <View class="flex-row items-center gap-2">
            <If when={row().newActivity}>
              <View
                testID={`watch-new-${row().kind}-${row().entry.refId}`}
                class="h-1.5 w-1.5 shrink-0 rounded-full bg-highlight"
              />
            </If>
            <Text
              class="min-w-0 flex-1 text-[12px] font-semibold leading-4 text-foreground"
              style={{ numberOfLines: 1 }}
            >
              {row().title}
            </Text>
            <Text class="shrink-0 text-[10px] tabular-nums text-muted-foreground">
              {row().meta}
            </Text>
          </View>
          <Text
            class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            style={{ numberOfLines: 1 }}
          >
            {meta().label} · {row().context}
          </Text>
          <Text class="text-[11px] leading-4 text-muted-foreground" style={{ numberOfLines: 1 }}>
            {row().event}
          </Text>
          <If when={row().attentionLabel || row().snoozed || row().done}>
            <View class="flex-row items-center gap-1">
              <View
                class="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: token(tone()) as string }}
              />
              <Text class="text-[10px] font-semibold" style={{ color: token(tone()) as string }}>
                {row().snoozed ? "Snoozed" : row().done ? "Completed" : row().attentionLabel}
              </Text>
            </View>
          </If>
        </View>
      </View>
      <View class="shrink-0 items-end">{rowMenu(row())}</View>
    </View>
  );
}
