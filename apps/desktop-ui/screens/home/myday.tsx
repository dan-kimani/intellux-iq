import { Text, token, View } from "nsh";
import { Card, Icon } from "../../components/ui";
import { activeNav, activeNavChild, selectConversation } from "../../state";
import { openOpportunityPanel } from "../details/panelState";
import { openPipelineForOpportunity } from "../opportunities/actions";
import { myDayRows, type MyDayRow } from "./dashboard";
import { taskKindIcon, type FollowUpTask } from "./data";
import { navTo } from "./nav";
import { CardHead, IconTile, LinkAction } from "./parts";
import { openTasks } from "./state";
import { openWorkDialog } from "../work/state";

function nextTask(): FollowUpTask | null {
  return openTasks()[0] ?? null;
}

function openNextTask(): void {
  const task = nextTask();
  if (task) openTask(task);
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

function MyDayRowView(props: { row: MyDayRow }) {
  return (
    <View
      role="button"
      accessibilityLabel={`${props.row.label}: ${props.row.count}`}
      testID={`home-myday-${props.row.id}`}
      onPress={() => navTo(props.row.page, props.row.child)}
      class="flex-row items-center gap-2.5 rounded-lg border border-border bg-panel px-2.5 py-2"
      hoverStyle={{ backgroundColor: token("accent"), borderColor: token("ring") }}
      focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
    >
      <IconTile icon={props.row.icon} tone={props.row.tone} size={25} iconSize={11} />
      <View class="min-w-0 flex-1 gap-0.5">
        <Text class="text-[12px] font-medium text-foreground" style={{ numberOfLines: 1 }}>
          {props.row.label}
        </Text>
        <Text class="text-[11px] text-muted-foreground" style={{ numberOfLines: 2 }}>
          {props.row.note}
        </Text>
      </View>
      <Text class="text-[16px] font-semibold leading-none text-foreground tabular-nums">
        {props.row.count}
      </Text>
      <Icon name="chevronRight" size={9} tone="muted-foreground" />
    </View>
  );
}

export function MyDay() {
  const rows = myDayRows;

  return (
    <Card class="gap-2 p-4" testID="home-my-day">
      <CardHead
        title="My day"
        subtitle="Today at a glance"
        action={
          <View class="flex-row items-center gap-1">
            <View
              role="button"
              accessibilityLabel="New task"
              testID="home-new-task"
              onPress={() => openWorkDialog({ mode: "task" })}
              class="h-6 flex-row items-center gap-0.5 rounded-md border border-border px-1.5"
              hoverStyle={{ backgroundColor: token("accent"), borderColor: token("ring") }}
              focusVisibleStyle={{ outlineWidth: 2, outlineColor: token("ring"), outlineOffset: 1 }}
            >
              <Icon name="plus" size={9} tone="muted-foreground" />
              <Text class="text-[11px] font-medium text-muted-foreground">New</Text>
            </View>
            <LinkAction label="View all" onPress={() => navTo("Tasks", "tasks")} />
          </View>
        }
      />

      <View class="gap-1">
        <Each of={rows()}>{(row: () => MyDayRow) => <MyDayRowView row={row()} />}</Each>
      </View>

      <If when={nextTask()}>
        <View class="mt-auto shrink-0 border-t border-border pt-2">
          <Text class="px-0.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Next up
          </Text>
          <View
            role="button"
            accessibilityLabel={`Open ${nextTask()?.title}`}
            testID={`home-next-${nextTask()?.id}`}
            onPress={openNextTask}
            class="flex-row items-start gap-2 rounded-md px-0.5 py-0.5"
            hoverStyle={{ backgroundColor: token("accent") }}
          >
            <Icon name={taskKindIcon[nextTask()?.kind ?? "task"]} size={10} tone="warning" />
            <Text
              class="min-w-0 flex-1 text-[12px] font-medium leading-4 text-foreground"
              style={{ numberOfLines: 2 }}
            >
              {nextTask()?.title}
            </Text>
            <Text class="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {nextTask()?.due}
            </Text>
          </View>
        </View>
      </If>
    </Card>
  );
}
