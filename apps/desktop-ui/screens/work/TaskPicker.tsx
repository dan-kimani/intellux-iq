import { Text, token, View } from "nsh";
import { ActionMenu } from "../../components/ActionMenu";
import { Icon } from "../../components/ui";
import { followUpRows } from "../home/state";

function tasks() {
  return followUpRows().filter((task) => !task.done && !task.cancelled);
}

export function TaskPicker(props: { value: string; onChange: (taskId: string) => void }) {
  const selected = () => tasks().find((task) => task.id === props.value);
  return (
    <ActionMenu
      testID="task-picker-menu"
      width={250}
      trigger={
        <View
          role="button"
          accessibilityLabel={`Task: ${selected()?.title ?? "No task"}`}
          class="h-7 flex-row items-center gap-1 rounded-md border border-border bg-card px-2"
          hoverStyle={{ backgroundColor: token("accent") }}
        >
          <Text class="min-w-0 flex-1 truncate text-[12px] font-medium text-foreground">
            {selected()?.title ?? "No task"}
          </Text>
          <Icon name="chevronDown" size={8} tone="muted-foreground" />
        </View>
      }
      groups={[
        [
          {
            id: "no-task",
            label: "No task",
            icon: "check" as const,
            onSelect: () => props.onChange(""),
          },
          ...tasks().map((task) => ({
            id: `pick-task-${task.id}`,
            label: task.title,
            icon: "checkCheck" as const,
            onSelect: () => props.onChange(task.id),
          })),
        ],
      ]}
    />
  );
}
