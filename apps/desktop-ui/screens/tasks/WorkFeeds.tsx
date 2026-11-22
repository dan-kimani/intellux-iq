import { Text, token, View } from "nsh";
import { Badge, Button, Icon } from "../../components/ui";
import { followUpRows } from "../home/state";
import { openWorkLink } from "../work/navigation";
import {
  dismissWorkReminder,
  snoozeWorkReminder,
  workActivities,
  visibleReminders,
} from "../work/state";
import type { WorkActivity, WorkReminder } from "../work/types";

function taskTitleFor(id: string): string {
  return followUpRows().find((task) => task.id === id)?.title ?? "the task";
}
import { linkKey, workLinkLabel } from "../work/links";

const activityLabels: Record<WorkActivity["kind"], string> = {
  note: "Note",
  call: "Call",
  email: "Email",
  whatsapp: "WhatsApp",
  meeting: "Meeting",
  other: "Other",
};

export function ActivityFeed() {
  const activities = workActivities;
  return (
    <View class="mx-auto w-full max-w-220 gap-2" testID="activity-feed">
      <If
        when={activities().length > 0}
        else={
          <View class="items-center gap-1 rounded-xl border border-dashed border-border px-4 py-14">
            <Icon name="fileText" size={18} tone="muted-foreground" />
            <Text class="text-[12px] font-medium text-foreground">No activity yet</Text>
            <Text class="text-[11px] text-muted-foreground">
              Log a call, meeting, email, or note from any record.
            </Text>
          </View>
        }
      >
        <Each of={activities()}>
          {(activity: () => WorkActivity) => (
            <View
              class="gap-2 rounded-xl border border-border bg-card p-3.5"
              testID={`activity-${activity().id}`}
            >
              <View class="flex-row items-start justify-between gap-2">
                <View class="flex-row items-center gap-2">
                  <View
                    class="h-6 w-6 items-center justify-center rounded-md"
                    style={{ backgroundColor: token("panel") }}
                  >
                    <Icon
                      name={
                        activity().kind === "call"
                          ? "phone"
                          : activity().kind === "meeting"
                            ? "calendarClock"
                            : "fileText"
                      }
                      size={11}
                      tone="muted-foreground"
                    />
                  </View>
                  <Badge variant="outline">
                    <Text class="text-[11px] font-medium text-muted-foreground">
                      {activityLabels[activity().kind]}
                    </Text>
                  </Badge>
                  <If when={activity().source === "system"}>
                    <Text class="text-[11px] text-muted-foreground">Auto</Text>
                  </If>
                </View>
                <Text class="text-[11px] text-muted-foreground">{activity().occurredAt}</Text>
              </View>
              <Text class="text-[13px] font-medium leading-5 text-foreground">
                {activity().title}
              </Text>
              <If when={activity().notes}>
                <Text class="text-[12px] leading-5 text-muted-foreground">{activity().notes}</Text>
              </If>
              <If when={activity().participants?.length}>
                <Text class="text-[11px] text-muted-foreground">
                  With {activity().participants?.join(", ")}
                </Text>
              </If>
              <View class="flex-row flex-wrap items-center gap-1.5 border-t border-border pt-2">
                <Each of={activity().links}>
                  {(link: () => WorkActivity["links"][number]) => (
                    <View
                      role="button"
                      accessibilityLabel={`Open ${link().label}`}
                      onPress={() => openWorkLink(link())}
                      class="flex-row items-center gap-1 rounded-md bg-panel px-1.5 py-1"
                      hoverStyle={{ backgroundColor: token("accent") }}
                    >
                      <Icon name="arrowUpRight" size={8} tone="muted-foreground" />
                      <Text class="text-[11px] text-muted-foreground">{link().label}</Text>
                    </View>
                  )}
                </Each>
                <Text class="ml-auto text-[11px] text-muted-foreground">{activity().actor}</Text>
              </View>
            </View>
          )}
        </Each>
      </If>
    </View>
  );
}

function reminderCard(reminder: WorkReminder) {
  return (
    <View
      class="gap-2 rounded-xl border border-border bg-card p-3.5"
      testID={`reminder-${reminder.id}`}
    >
      <View class="flex-row items-start justify-between gap-2">
        <View class="flex-row items-center gap-2">
          <Icon
            name="calendarClock"
            size={12}
            tone={
              reminder.status === "due"
                ? "alert"
                : reminder.status === "scheduled"
                  ? "warning"
                  : "muted-foreground"
            }
          />
          <Text class="text-[13px] font-medium text-foreground">{reminder.title}</Text>
        </View>
        <Badge
          variant={
            reminder.status === "due"
              ? "warning"
              : reminder.status === "scheduled"
                ? "outline"
                : "default"
          }
        >
          <Text class="text-[11px] font-medium capitalize text-muted-foreground">
            {reminder.status}
          </Text>
        </Badge>
      </View>
      <View class="flex-row flex-wrap items-center gap-1.5">
        <Text class="text-[12px] tabular-nums text-muted-foreground">{reminder.triggerAt}</Text>
        <If when={reminder.taskId}>
          <Text class="text-[11px] text-muted-foreground">
            · {taskTitleFor(reminder.taskId ?? "")}
          </Text>
        </If>
        <ForEachLink links={reminder.links} />
      </View>
      <If when={reminder.status === "scheduled" || reminder.status === "due"}>
        <View class="flex-row items-center gap-2 border-t border-border pt-2">
          <Button variant="ghost" size="sm" onPress={() => snoozeWorkReminder(reminder.id)}>
            <Text class="text-[11px] font-medium">Snooze 1 hour</Text>
          </Button>
          <Button variant="ghost" size="sm" onPress={() => dismissWorkReminder(reminder.id)}>
            <Text class="text-[11px] font-medium">Dismiss</Text>
          </Button>
        </View>
      </If>
    </View>
  );
}

export function ReminderFeed() {
  const reminders = visibleReminders;
  const due = () => reminders().filter((row) => row.status === "due");
  const scheduled = () => reminders().filter((row) => row.status === "scheduled");
  const dismissed = () => reminders().filter((row) => row.status === "dismissed");
  return (
    <View class="mx-auto w-full max-w-220 gap-4" testID="reminder-feed">
      <If when={due().length > 0}>
        <View class="gap-2">
          <Text class="text-[11px] font-semibold uppercase tracking-wider text-warning">
            Due now
          </Text>
          <Each of={due()}>{(reminder: () => WorkReminder) => reminderCard(reminder())}</Each>
        </View>
      </If>
      <View class="gap-2">
        <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Scheduled
        </Text>
        <If
          when={scheduled().length > 0}
          else={<Text class="text-[12px] text-muted-foreground">No scheduled reminders.</Text>}
        >
          <Each of={scheduled()}>{(reminder: () => WorkReminder) => reminderCard(reminder())}</Each>
        </If>
      </View>
      <If when={dismissed().length > 0}>
        <View class="gap-2">
          <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Dismissed
          </Text>
          <Each of={dismissed()}>{(reminder: () => WorkReminder) => reminderCard(reminder())}</Each>
        </View>
      </If>
    </View>
  );
}

function ForEachLink(props: { links: WorkReminder["links"] }) {
  return (
    <Each of={props.links}>
      {(link: () => WorkReminder["links"][number]) => (
        <View
          role="button"
          accessibilityLabel={`Open ${link().label}`}
          onPress={() => openWorkLink(link())}
          class="flex-row items-center gap-1 rounded-md bg-panel px-1.5 py-1"
          hoverStyle={{ backgroundColor: token("accent") }}
          testID={`reminder-link-${linkKey(link())}`}
        >
          <Icon name="arrowUpRight" size={8} tone="muted-foreground" />
          <Text class="text-[11px] text-muted-foreground">
            {workLinkLabel(link().type)} · {link().label}
          </Text>
        </View>
      )}
    </Each>
  );
}
