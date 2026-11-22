import type { JSX } from "nsh";
import { Text, token, View } from "nsh";
import { Button, Icon, IconButton } from "../../components/ui";
import { SelectField, TextField } from "../../components/forms";
import { teamMembers } from "../../state";
import { isWatched, toggleWatch } from "../../watch/state";
import { taskKindLabel, type FollowUpTask } from "../home/data";
import { followUpRows, updateFollowUp } from "../home/state";
import { openWorkLink } from "../work/navigation";
import {
  addLinkToTask,
  cancelTask,
  dismissWorkReminder,
  openWorkDialog,
  removeLinkFromTask,
  setTaskSource,
  taskLinks,
  workActivities,
  workReminders,
} from "../work/state";
import type { WorkActivity, WorkReminder } from "../work/types";
import { DateTimeField } from "../work/DateTimeField";
import { dueLabel, dueMinutes } from "../work/time";
import { WorkLinkChips } from "../work/WorkLinks";
import { OwnerPicker } from "../work/OwnerPicker";

function Meta(props: { label: string; children?: JSX.Element }) {
  return (
    <View class="gap-1 rounded-lg bg-panel px-2.5 py-2">
      <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">{props.label}</Text>
      {props.children}
    </View>
  );
}

export function TaskDetail(props: {
  task: FollowUpTask;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
}) {
  const task = props.task;
  const current = (): FollowUpTask => followUpRows().find((row) => row.id === task.id) ?? task;
  const links = () => taskLinks(current());
  const source = () => links()[0] ?? null;
  const activities = () => workActivities().filter((row) => row.taskId === current().id);
  const reminders = () => workReminders().filter((row) => row.taskId === current().id);
  const dueAt = () => current().dueAtMs ?? Date.now() + current().dueInMinutes * 60_000;

  return (
    <View class="gap-4 p-5" testID={`task-detail-${current().id}`}>
      <View class="flex-row items-start justify-between gap-3">
        <View class="min-w-0 flex-1 gap-1">
          <View class="flex-row items-center gap-2">
            <Text class="text-[20px] font-semibold leading-6 text-foreground">
              {current().title}
            </Text>
            <If when={current().done}>
              <Text class="text-[11px] font-medium text-success">Completed</Text>
            </If>
            <If when={current().cancelled}>
              <Text class="text-[11px] font-medium text-warning">Cancelled</Text>
            </If>
            <If when={current().status === "in_progress"}>
              <Text class="text-[11px] font-medium text-highlight">In progress</Text>
            </If>
          </View>
          <Text class="text-[11px] text-muted-foreground">
            {current().context} · {current().owner}
          </Text>
        </View>
        <View class="flex-row items-center gap-1.5">
          <IconButton
            icon="eye"
            label={isWatched("task", current().id) ? "Stop watching this task" : "Watch this task"}
            size={30}
            testID="task-watch"
            active={isWatched("task", current().id)}
            onPress={() => toggleWatch("task", current().id)}
          />
          <Button
            variant="outline"
            size="sm"
            testID="task-edit"
            onPress={() => openWorkDialog({ mode: "task", taskId: current().id })}
          >
            <Icon name="pencil" size={11} tone="muted-foreground" />
            <Text class="text-[12px] font-medium">Edit</Text>
          </Button>
          <If when={!current().done && !current().cancelled}>
            <Button variant="outline" size="sm" onPress={() => cancelTask(current().id)}>
              <Text class="text-[12px] font-medium">Cancel</Text>
            </Button>
            <Button
              variant="primary"
              size="sm"
              testID="task-complete"
              onPress={() => props.onComplete(current().id)}
            >
              <Icon name="check" size={11} tone="primary-foreground" />
              <Text class="text-[12px] font-semibold text-primary-foreground">Complete</Text>
            </Button>
          </If>
          <If when={current().done || current().cancelled}>
            <Button
              variant="outline"
              size="sm"
              testID="task-reopen"
              onPress={() => props.onReopen(current().id)}
            >
              <Icon name="workflow" size={11} tone="muted-foreground" />
              <Text class="text-[12px] font-medium">Reopen</Text>
            </Button>
          </If>
        </View>
      </View>

      <View class="grid grid-cols-2 gap-2">
        <Meta label="Type">
          <Text class="text-[12px] font-medium text-foreground">
            {taskKindLabel[current().kind]}
          </Text>
        </Meta>
        <Meta label="Priority">
          <SelectField
            label=""
            value={() => (current().priority === "high" ? "High" : "Normal")}
            options={["High", "Normal"]}
            onChange={(label) =>
              updateFollowUp(current().id, { priority: label === "High" ? "high" : "normal" })
            }
          />
        </Meta>
        <Meta label="Owner">
          <OwnerPicker
            value={current().owner}
            onChange={(name) => {
              const member = teamMembers.find((row) => row.name === name);
              if (member) updateFollowUp(current().id, { owner: member.name, ownerId: member.id });
            }}
          />
        </Meta>
        <Meta label="Due">
          <DateTimeField
            label=""
            value={dueAt}
            onChange={(ms) =>
              updateFollowUp(current().id, {
                dueAtMs: ms,
                due: dueLabel(ms),
                dueInMinutes: dueMinutes(ms),
              })
            }
            testID="task-due"
          />
        </Meta>
        <Meta label="Visibility">
          <SelectField
            label=""
            value={() => (current().visibility === "private" ? "Only me" : "Team")}
            options={["Only me", "Team"]}
            onChange={(label) =>
              updateFollowUp(current().id, { visibility: label === "Team" ? "org" : "private" })
            }
          />
        </Meta>
      </View>

      <View class="gap-2">
        <TextField
          label="Title"
          value={() => current().title}
          onChange={(value) => updateFollowUp(current().id, { title: value })}
          testID="task-title"
        />
        <TextField
          label="Notes"
          value={() => current().notes ?? ""}
          onChange={(value) => updateFollowUp(current().id, { notes: value })}
          testID="task-notes"
        />
      </View>

      <If when={source()}>
        <View
          class="gap-1 rounded-lg border border-border bg-panel px-3 py-2"
          testID={`task-source-${source()?.type}`}
        >
          <Text class="text-[11px] uppercase tracking-wider text-muted-foreground">Source</Text>
          <View class="flex-row items-center gap-2">
            <Icon name="arrowUpRight" size={10} tone="highlight" />
            <Text
              class="min-w-0 flex-1 text-[12px] font-medium text-foreground"
              style={{ numberOfLines: 2 }}
            >
              {source()?.label} · {source()?.detail}
            </Text>
            <View
              role="button"
              accessibilityLabel="Open source record"
              onPress={() => source() && openWorkLink(source()!)}
              class="h-6 items-center justify-center rounded border border-border px-2"
              hoverStyle={{ backgroundColor: token("accent") }}
            >
              <Text class="text-[11px] font-medium text-muted-foreground">Open</Text>
            </View>
          </View>
        </View>
      </If>

      <View class="gap-2">
        <View class="flex-row items-center justify-between">
          <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Linked to
          </Text>
          <View
            role="button"
            accessibilityLabel="Add a reminder to this task"
            testID="task-add-reminder"
            onPress={() =>
              openWorkDialog({
                mode: "reminder",
                taskId: current().id,
                ...(source() ? { link: source()! } : {}),
              })
            }
            class="h-6 flex-row items-center gap-1 rounded border border-border px-1.5"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Icon name="calendarClock" size={9} tone="muted-foreground" />
            <Text class="text-[11px] font-medium text-muted-foreground">Remind me</Text>
          </View>
        </View>
        <WorkLinkChips
          links={links()}
          sourceKey={source() ? `${source()!.type}:${source()!.id}` : undefined}
          onOpen={openWorkLink}
          onSetSource={(link) => setTaskSource(current().id, link)}
          onAdd={(link) => addLinkToTask(current().id, link)}
          onRemove={(link) => removeLinkFromTask(current().id, link)}
        />
      </View>

      <If when={reminders().length > 0}>
        <View class="gap-2">
          <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Reminders
          </Text>
          <Each of={reminders()}>
            {(reminder: () => WorkReminder) => (
              <View class="flex-row items-center gap-2 rounded-lg border border-border bg-panel px-2.5 py-2">
                <Icon
                  name="calendarClock"
                  size={11}
                  tone={reminder().status === "due" ? "warning" : "muted-foreground"}
                />
                <Text class="min-w-0 flex-1 text-[11px] text-foreground">{reminder().title}</Text>
                <Text class="text-[11px] tabular-nums text-muted-foreground">
                  {reminder().triggerAt}
                </Text>
                <View
                  role="button"
                  accessibilityLabel="Dismiss reminder"
                  onPress={() => dismissWorkReminder(reminder().id)}
                  class="h-5 w-5 items-center justify-center rounded"
                >
                  <Icon name="close" size={8} tone="muted-foreground" />
                </View>
              </View>
            )}
          </Each>
        </View>
      </If>

      <If when={activities().length > 0}>
        <View class="gap-2">
          <Text class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Activity
          </Text>
          <Each of={activities()}>
            {(activity: () => WorkActivity) => (
              <View class="gap-0.5 border-l-2 border-border pl-2.5">
                <Text class="text-[12px] font-medium text-foreground">{activity().title}</Text>
                <Text class="text-[11px] text-muted-foreground">{activity().notes}</Text>
                <Text class="text-[11px] text-muted-foreground">
                  {activity().occurredAt} · {activity().actor}
                </Text>
              </View>
            )}
          </Each>
        </View>
      </If>
    </View>
  );
}
