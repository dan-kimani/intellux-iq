import { Text, token, View } from "nsh";
import type { Conversation } from "../data";
import { assignmentFor, inboxReminders, isAssignedToMe, tagsFor, tagDialogOpen } from "../state";
import { Icon, withAlpha } from "./ui";

function slaLabel(minutes: number): string {
  const abs = Math.abs(minutes);
  const time = abs >= 60 ? `${Math.floor(abs / 60)}h ${abs % 60}m` : `${abs}m`;
  return minutes < 0 ? `SLA breached ${time}` : `SLA ${time}`;
}

function windowLabel(minutes: number): string {
  const abs = Math.abs(minutes);
  const time = abs >= 60 ? `${Math.floor(abs / 60)}h ${abs % 60}m` : `${abs}m`;
  return minutes <= 0 ? "Window closed" : `Window ${time}`;
}

export function ConversationStatusBar(props: { conversation: Conversation }) {
  const c = props.conversation;
  const owner = () => assignmentFor(c);
  const tags = tagsFor(c);
  const reminder = () => inboxReminders()[c.id];
  return (
    <View class="shrink-0 flex-row items-center gap-3 border-b border-border bg-background px-5 py-2">
      <View class="min-w-0 flex-1 flex-row items-center gap-2">
        <Text
          class="shrink-0 text-[9.5px] font-medium"
          style={{ color: isAssignedToMe(c) ? token("success") : token("muted-foreground") }}
        >
          {owner()
            ? isAssignedToMe(c)
              ? "Owned by you"
              : `Owned by ${owner()!.name}`
            : "Unassigned"}
        </Text>
        <Text class="shrink-0 text-[9px] capitalize text-muted-foreground">
          · {c.typing ? "typing" : c.presence.replace("_", " ")}
        </Text>
        <Each of={tags}>
          {(tag: () => string) => (
            <View class="h-5 shrink-0 items-center justify-center rounded bg-muted px-1.5">
              <Text class="text-[8.5px] font-medium text-muted-foreground">#{tag()}</Text>
            </View>
          )}
        </Each>
        <View
          role="button"
          accessibilityLabel="Edit conversation tags"
          testID="conversation-tags"
          onPress={() => tagDialogOpen.set(true)}
          class="h-5 w-5 shrink-0 items-center justify-center rounded border border-dashed border-border"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Icon name="plus" size={9} tone="muted-foreground" />
        </View>
        <If when={reminder()}>
          <View class="shrink-0 flex-row items-center gap-1">
            <Icon name="calendarClock" size={10} tone="warning" />
            <Text class="text-[8.5px] text-muted-foreground">{reminder()}</Text>
          </View>
        </If>
      </View>
      <View class="shrink-0 flex-row items-center gap-1.5">
        <View
          class="h-5 flex-row items-center gap-1 rounded px-1.5"
          style={{
            backgroundColor: withAlpha(
              token(c.slaMinutes < 0 ? "warning" : "muted-foreground"),
              "14",
            ),
          }}
          testID="conversation-sla"
          accessibilityLabel={slaLabel(c.slaMinutes)}
        >
          <Icon
            name={c.slaMinutes < 0 ? "zap" : "gauge"}
            size={9}
            tone={c.slaMinutes < 0 ? "warning" : "muted-foreground"}
          />
          <Text
            class="text-[8.5px] font-medium"
            style={{ color: c.slaMinutes < 0 ? token("warning") : token("muted-foreground") }}
          >
            {slaLabel(c.slaMinutes)}
          </Text>
        </View>
        <If when={c.channel === "whatsapp"}>
          <View
            class="h-5 flex-row items-center gap-1 rounded px-1.5"
            style={{
              backgroundColor: withAlpha(
                token((c.windowMinutes ?? 0) <= 0 ? "warning" : "muted-foreground"),
                "14",
              ),
            }}
            testID="conversation-window"
            accessibilityLabel={windowLabel(c.windowMinutes ?? 0)}
          >
            <Icon
              name={(c.windowMinutes ?? 0) <= 0 ? "shieldCheck" : "messageCircle"}
              size={9}
              tone={(c.windowMinutes ?? 0) <= 0 ? "warning" : "muted-foreground"}
            />
            <Text
              class="text-[8.5px] font-medium"
              style={{
                color: (c.windowMinutes ?? 0) <= 0 ? token("warning") : token("muted-foreground"),
              }}
            >
              {windowLabel(c.windowMinutes ?? 0)}
            </Text>
          </View>
        </If>
      </View>
    </View>
  );
}
