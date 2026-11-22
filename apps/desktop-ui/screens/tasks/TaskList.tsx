import { Text, token, View } from "nsh";
import { Badge, Icon } from "../../components/ui";
import type { FollowUpTask } from "../home/data";
import { taskLinks } from "../work/state";

function dueTone(task: FollowUpTask): string {
  if (task.done) return token("success") as string;
  if (task.dueInMinutes < 0) return token("warning") as string;
  return token("muted-foreground") as string;
}

function firstLink(task: FollowUpTask): string {
  const link = taskLinks(task)[0];
  return link ? `${link.label} · ${link.detail}` : "Standalone task";
}

export function TaskList(props: {
  tasks: FollowUpTask[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onComplete: (id: string) => void;
  selectionMode?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  return (
    <View class="gap-1" testID="tasks-list">
      <Each of={props.tasks}>
        {(task: () => FollowUpTask) => (
          <View
            role="button"
            accessibilityLabel={`${task().done ? "Completed task" : "Task"}: ${task().title}`}
            testID={`task-row-${task().id}`}
            onPress={() =>
              props.selectionMode ? props.onToggleSelect?.(task().id) : props.onSelect(task().id)
            }
            class="flex-row items-start gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5"
            style={{
              borderColor: task().id === props.selectedId ? token("ring") : token("border"),
              backgroundColor: task().id === props.selectedId ? token("accent") : token("card"),
            }}
            hoverStyle={{ backgroundColor: token("accent") }}
            focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
          >
            <View
              role="button"
              accessibilityLabel={
                task().done ? `Reopen ${task().title}` : `Complete ${task().title}`
              }
              testID={`task-complete-${task().id}`}
              onPress={() => props.onComplete(task().id)}
              class="mt-0.5 h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border"
              style={{
                borderColor: task().done ? token("success") : token("border"),
                backgroundColor: task().done ? token("success") : "transparent",
              }}
              hoverStyle={{ borderColor: token("success") }}
            >
              <If when={task().done}>
                <Icon name="check" size={9} tone="success-foreground" />
              </If>
            </View>
            <View class="min-w-0 flex-1 gap-1">
              <View class="flex-row items-start justify-between gap-2">
                <Text
                  class="min-w-0 flex-1 text-[12px] font-medium leading-4 text-foreground"
                  style={{
                    color: task().done ? token("muted-foreground") : token("foreground"),
                    textDecorationLine: task().done ? "line-through" : "none",
                    numberOfLines: 2,
                  }}
                >
                  {task().title}
                </Text>
                <If when={task().priority === "high" && !task().done}>
                  <Badge variant="warning">
                    <Text class="text-[11px] font-medium text-warning">High</Text>
                  </Badge>
                </If>
              </View>
              <Text class="text-[11px] text-muted-foreground" style={{ numberOfLines: 1 }}>
                {firstLink(task())}
              </Text>
              <View class="flex-row items-center justify-between gap-2">
                <Text class="text-[11px] tabular-nums" style={{ color: dueTone(task()) }}>
                  {task().due}
                </Text>
                <Text class="text-[11px] text-muted-foreground">{task().owner}</Text>
              </View>
            </View>
            <If when={props.selectionMode}>
              <View
                class="mt-0.5 h-4 w-4 shrink-0 items-center justify-center rounded border"
                style={{
                  borderColor: props.selectedIds?.includes(task().id)
                    ? token("primary")
                    : token("border"),
                  backgroundColor: props.selectedIds?.includes(task().id)
                    ? token("primary")
                    : "transparent",
                }}
              >
                <If when={props.selectedIds?.includes(task().id)}>
                  <Icon name="check" size={9} tone="primary-foreground" />
                </If>
              </View>
            </If>
          </View>
        )}
      </Each>
      <If when={props.tasks.length === 0}>
        <View class="items-center gap-1 rounded-lg border border-dashed border-border px-4 py-10">
          <Icon name="checkCheck" size={16} tone="success" />
          <Text class="text-[12px] font-medium text-foreground">Nothing here</Text>
          <Text class="text-[11px] text-muted-foreground">
            Create a task to start tracking work.
          </Text>
        </View>
      </If>
    </View>
  );
}
