import { Text, token, View } from "nsh";
import { ActionMenu } from "../../components/ActionMenu";
import { Icon, SectionTitle } from "../../components/ui";
import { activeNav, activeNavChild } from "../../state";
import { workMenuActions } from "./actions";
import { openWorkLink } from "./navigation";
import { activitiesForLink, remindersForLink, tasksForLink } from "./queries";
import { selectedTaskId } from "./state";
import type { WorkLink } from "./types";
import { taskEntityFilter, taskScope } from "../tasks/view";
import { tasksTab } from "./state";

function openTask(id: string, link: WorkLink): void {
  selectedTaskId.set(id);
  taskScope.set("all");
  taskEntityFilter.set(link);
  tasksTab.set("tasks");
  activeNavChild.set("tasks");
  activeNav.set("Tasks");
}

export function WorkSection(props: { link: WorkLink; title?: string; limit?: number }) {
  const limit = props.limit ?? 3;
  const tasks = () => tasksForLink(props.link).slice(0, limit);
  const reminders = () =>
    remindersForLink(props.link).slice(0, Math.max(0, limit - tasks().length));
  const activities = () => activitiesForLink(props.link).slice(0, limit);
  const total = () =>
    tasksForLink(props.link).length +
    remindersForLink(props.link).length +
    activitiesForLink(props.link).length;

  return (
    <View class="gap-2.5 rounded-xl border border-border bg-card p-3" testID="work-section">
      <View class="flex-row items-center justify-between gap-2">
        <SectionTitle>{props.title ?? "Work"}</SectionTitle>
        <View class="flex-row items-center gap-1">
          <ActionMenu
            testID="work-add-menu"
            width={210}
            trigger={
              <View
                role="button"
                accessibilityLabel="Add task, activity, or reminder"
                testID="work-add"
                class="h-6 flex-row items-center gap-1 rounded-md border border-border px-1.5"
                hoverStyle={{ backgroundColor: token("accent"), borderColor: token("ring") }}
              >
                <Icon name="plus" size={9} tone="muted-foreground" />
                <Text class="text-[11px] font-medium text-muted-foreground">Add</Text>
              </View>
            }
            groups={[workMenuActions(props.link)]}
          />
          <View
            role="button"
            accessibilityLabel="Open all work"
            testID="work-view-all"
            onPress={() => {
              taskScope.set("all");
              taskEntityFilter.set(props.link);
              tasksTab.set("tasks");
              activeNavChild.set("tasks");
              activeNav.set("Tasks");
            }}
            class="h-6 flex-row items-center gap-0.5 rounded px-1"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Text class="text-[11px] font-medium text-highlight">View all</Text>
            <Icon name="chevronRight" size={9} tone="highlight" />
          </View>
        </View>
      </View>

      <If
        when={total() > 0}
        else={
          <Text class="text-[11px] leading-4 text-muted-foreground">
            No tasks, reminders, or activity linked here yet.
          </Text>
        }
      >
        <View class="gap-1">
          <Each of={tasks()}>
            {(task: () => ReturnType<typeof tasksForLink>[number]) => (
              <View
                role="button"
                accessibilityLabel={`Open task ${task().title}`}
                onPress={() => openTask(task().id, props.link)}
                class="flex-row items-start gap-2 rounded-md px-1 py-1"
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <Icon
                  name={task().done ? "checkCheck" : "check"}
                  size={10}
                  tone={task().done ? "success" : "muted-foreground"}
                />
                <View class="min-w-0 flex-1 gap-0.5">
                  <Text
                    class="text-[11px] font-medium leading-4 text-foreground"
                    style={{ numberOfLines: 2 }}
                  >
                    {task().title}
                  </Text>
                  <Text class="text-[11px] tabular-nums text-muted-foreground">{task().due}</Text>
                </View>
              </View>
            )}
          </Each>
          <Each of={reminders()}>
            {(reminder: () => ReturnType<typeof remindersForLink>[number]) => (
              <View
                role="button"
                accessibilityLabel={`Open reminder ${reminder().title}`}
                onPress={() => openWorkLink(props.link)}
                class="flex-row items-start gap-2 rounded-md px-1 py-1"
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <Icon name="calendarClock" size={10} tone="warning" />
                <View class="min-w-0 flex-1 gap-0.5">
                  <Text
                    class="text-[11px] font-medium leading-4 text-foreground"
                    style={{ numberOfLines: 2 }}
                  >
                    {reminder().title}
                  </Text>
                  <Text class="text-[11px] text-muted-foreground">{reminder().triggerAt}</Text>
                </View>
              </View>
            )}
          </Each>
          <Each of={activities()}>
            {(activity: () => ReturnType<typeof activitiesForLink>[number]) => (
              <View
                role="button"
                accessibilityLabel={`Open activity ${activity().title}`}
                onPress={() => openWorkLink(activity().links[0] ?? props.link)}
                class="flex-row items-start gap-2 rounded-md px-1 py-1"
                hoverStyle={{ backgroundColor: token("accent") }}
              >
                <Icon name="fileText" size={10} tone="muted-foreground" />
                <View class="min-w-0 flex-1 gap-0.5">
                  <Text
                    class="text-[11px] font-medium leading-4 text-foreground"
                    style={{ numberOfLines: 2 }}
                  >
                    {activity().title}
                  </Text>
                  <Text class="text-[11px] text-muted-foreground">
                    {activity().occurredAt} · {activity().actor}
                  </Text>
                </View>
              </View>
            )}
          </Each>
        </View>
      </If>
    </View>
  );
}
