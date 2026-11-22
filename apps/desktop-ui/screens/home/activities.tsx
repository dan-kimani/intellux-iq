import type { Tokens } from "nsh";
import { Text, token, View } from "nsh";
import { Card, Icon } from "../../components/ui";
import { activeNav, activeNavChild, allConversations, selectConversation } from "../../state";
import { openOpportunityPanel } from "../details/panelState";
import { openPipelineForOpportunity } from "../opportunities/actions";
import { openTasks } from "./state";
import { taskOutcomeId, workReminders } from "../work/state";
import { taskKindLabel, type FollowUpKind, type FollowUpTask } from "./data";
import { navTo } from "./nav";
import { CardHead, LinkAction, ToneTag } from "./parts";

interface ReminderItem {
  conversationId: string;
  name: string;
  text: string;
}

interface ActivityItem {
  task: FollowUpTask;
  label: string;
  tone: keyof Tokens;
}

const activityTones: Record<FollowUpKind, keyof Tokens> = {
  call: "series-1",
  email: "series-2",
  whatsapp: "series-3",
  proposal: "series-4",
  quote: "series-4",
  meeting: "series-5",
  task: "series-3",
};

function upcomingActivities(limit = 4): ActivityItem[] {
  return openTasks()
    .slice(0, limit)
    .map((task) => ({
      task,
      label: taskKindLabel[task.kind],
      tone: activityTones[task.kind],
    }));
}

function reminderItems(): ReminderItem[] {
  return workReminders()
    .filter((reminder) => reminder.status === "scheduled")
    .flatMap((reminder) => {
      const link = reminder.links.find((item) => item.type === "conversation");
      if (!link) return [];
      const conversation = allConversations().find((row) => row.id === link.id);
      return [
        {
          conversationId: link.id,
          text: reminder.triggerAt,
          name: conversation?.name ?? link.label,
        },
      ];
    })
    .slice(0, 2);
}

function openTask(task: FollowUpTask): void {
  if (task.conversationId) {
    selectConversation(task.conversationId);
    activeNavChild.set("inbox");
    activeNav.set("Inbox");
    if (task.opportunityId) openOpportunityPanel(task.opportunityId, task.conversationId);
    return;
  }
  if (task.opportunityId) openPipelineForOpportunity(task.opportunityId);
}

function ActivityRow(props: { item: ActivityItem }) {
  const task = props.item.task;
  const overdue = task.dueInMinutes < 0;
  return (
    <View class="flex-row items-start gap-2">
      <View class="w-2 shrink-0 items-center pt-1.5">
        <View
          class="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: token(overdue ? "warning" : props.item.tone) as string }}
        />
      </View>

      <View
        role="button"
        accessibilityLabel={`Open ${task.title}`}
        testID={`home-task-${task.id}`}
        onPress={() => openTask(task)}
        class="min-w-0 flex-1 gap-0.5 rounded-md px-1 py-0.5"
        hoverStyle={{ backgroundColor: token("accent") }}
        focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
      >
        <View class="flex-row items-center gap-1.5">
          <Text
            class="text-[11px] font-medium tabular-nums"
            style={{
              color: token(overdue ? "warning" : "muted-foreground") as string,
              numberOfLines: 1,
            }}
          >
            {task.due}
          </Text>
          <ToneTag label={props.item.label} tone={props.item.tone} />
        </View>
        <Text
          class="text-[12px] font-medium leading-4 text-foreground"
          style={{ numberOfLines: 2 }}
        >
          {task.title}
        </Text>
        <Text class="text-[11px] text-muted-foreground" style={{ numberOfLines: 2 }}>
          {task.context}
        </Text>
      </View>

      <View
        role="button"
        accessibilityLabel={`Complete ${task.title}`}
        testID={`home-complete-${task.id}`}
        onPress={() => {
          taskOutcomeId.set(task.id);
        }}
        class="mt-1 h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border border-border"
        hoverStyle={{ backgroundColor: token("accent"), borderColor: token("success") }}
        focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
      >
        <Icon name="check" size={8} tone="muted-foreground" />
      </View>
    </View>
  );
}

function ReminderRow(props: { item: ReminderItem }) {
  return (
    <View
      role="button"
      accessibilityLabel={`Open reminder for ${props.item.name}`}
      testID={`home-reminder-${props.item.conversationId}`}
      onPress={() => {
        selectConversation(props.item.conversationId);
        navTo("Inbox", "inbox");
      }}
      class="flex-row items-center gap-2 rounded-md px-1 py-1"
      hoverStyle={{ backgroundColor: token("accent") }}
    >
      <Icon name="calendarClock" size={10} tone="warning" />
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[11px] font-medium text-foreground" style={{ numberOfLines: 2 }}>
          {props.item.name}
        </Text>
        <Text class="text-[11px] text-muted-foreground" style={{ numberOfLines: 2 }}>
          {props.item.text}
        </Text>
      </View>
      <Text class="shrink-0 text-[11px] font-medium uppercase tracking-wider text-warning">
        Reminder
      </Text>
    </View>
  );
}

export function UpcomingActivities() {
  const reminders = reminderItems;
  const tasks = () => upcomingActivities(4 - reminders().length);

  return (
    <Card class="gap-2 p-4" testID="home-upcoming">
      <CardHead
        title="Upcoming work"
        subtitle="Follow-ups and scheduled work"
        action={<LinkAction label="View all" onPress={() => navTo("Tasks", "tasks")} />}
      />

      <View class="flex-1 gap-1">
        <If
          when={tasks().length > 0}
          else={
            <View class="items-center gap-1 rounded-lg border border-dashed border-border py-5">
              <Icon name="checkCheck" size={14} tone="success" />
              <Text class="text-[11px] font-medium text-foreground">No follow-ups due</Text>
            </View>
          }
        >
          <Each of={tasks()}>{(item: () => ActivityItem) => <ActivityRow item={item()} />}</Each>
        </If>
      </View>

      <If when={reminders().length > 0}>
        <View class="mt-auto gap-0.5 border-t border-border pt-1.5">
          <Text class="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Reminders
          </Text>
          <Each of={reminders()}>
            {(item: () => ReminderItem) => <ReminderRow item={item()} />}
          </Each>
        </View>
      </If>
    </Card>
  );
}
