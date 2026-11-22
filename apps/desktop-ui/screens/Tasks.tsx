import { effect, signal, Text, token, View } from "nsh";
import { Scroll } from "nsh";
import { ActionMenu } from "../components/ActionMenu";
import { SectionTabs, type SectionTabItem } from "../components/SectionTabs";
import { Button, Icon } from "../components/ui";
import { Reveal, ScreenFade } from "../components/motion";
import { showToast } from "../state";
import { followUpRows } from "./home/state";
import { PageHeader } from "./PageShell";
import { workMenuActions } from "./work/actions";
import { taskMatchesLink } from "./work/queries";
import { canViewTask } from "./work/permissions";
import {
  reopenTask,
  selectedTaskId,
  taskOutcomeId,
  tasksTab,
  cancelTask,
  completeTaskWithOutcome,
  visibleReminders,
  workActivities,
} from "./work/state";
import { TaskDetail } from "./tasks/TaskDetail";
import { TaskList } from "./tasks/TaskList";
import { TaskToolbar } from "./tasks/TaskToolbar";
import { TaskFeedPane } from "./tasks/TaskFeedPane";
import { filteredTasks, taskEntityFilter, taskOwner, taskQuery, taskScope } from "./tasks/view";

function taskTabs(): SectionTabItem[] {
  return [
    { id: "tasks", label: "Tasks", count: followUpRows().filter((task) => !task.done).length },
    { id: "activity", label: "Activity", count: workActivities().length },
    {
      id: "reminders",
      label: "Reminders",
      count: visibleReminders().filter((row) => row.status === "scheduled" || row.status === "due")
        .length,
    },
  ];
}

function screenTasks() {
  const filter = taskEntityFilter();
  const owner = taskOwner();
  const needle = taskQuery().trim().toLowerCase();
  const rows = filteredTasks(taskScope()).filter(
    (task) =>
      canViewTask(task) &&
      (owner === "all" || task.owner === owner) &&
      (!needle ||
        `${task.title} ${task.context} ${task.notes ?? ""} ${task.owner}`
          .toLowerCase()
          .includes(needle)),
  );
  return filter ? rows.filter((task) => taskMatchesLink(task, filter)) : rows;
}

export function TasksScreen() {
  const selecting = signal(false);
  const picked = signal<string[]>([]);
  const page = signal(0);
  const pageCount = () => Math.max(1, Math.ceil(screenTasks().length / 5));
  const currentPage = () => Math.min(page(), pageCount() - 1);
  const pagedTasks = () => screenTasks().slice(currentPage() * 5, currentPage() * 5 + 5);
  const selected = () =>
    pagedTasks().find((task) => task.id === selectedTaskId()) ?? pagedTasks()[0] ?? null;
  effect(() => {
    taskScope();
    taskQuery();
    taskOwner();
    taskEntityFilter();
    page.set(0);
  });
  effect(() => {
    const id = selectedTaskId();
    const index = screenTasks().findIndex((task) => task.id === id);
    if (index >= 0) page.set(Math.floor(index / 5));
  });

  return (
    <View class="min-h-0 flex-1 flex-col bg-background" testID="screen-tasks">
      <ScreenFade class="min-h-0 flex-1 flex-col">
        <PageHeader
          title="Tasks"
          description="Plan internal work, log what happened, and keep reminders linked to the record that matters."
          actions={
            <ActionMenu
              testID="tasks-new-menu"
              width={210}
              trigger={
                <View
                  role="button"
                  accessibilityLabel="New task, activity, or reminder"
                  testID="tasks-new"
                  class="h-8 flex-row items-center gap-1.5 rounded-lg border border-primary bg-primary px-3"
                >
                  <Icon name="plus" size={12} tone="primary-foreground" />
                  <Text class="text-[12px] font-semibold text-primary-foreground">New</Text>
                  <Icon name="chevronDown" size={9} tone="primary-foreground" />
                </View>
              }
              groups={[workMenuActions()]}
            />
          }
        />
        <View class="flex-row items-center justify-between gap-3 border-b border-border px-6 py-2.5">
          <View class="flex-row items-center gap-2">
            <SectionTabs
              items={taskTabs()}
              value={tasksTab()}
              onChange={(id) =>
                tasksTab.set(id as typeof tasksTab extends () => infer T ? T : never)
              }
              accessibilityLabel="Task views"
              testPrefix="tasks-tab"
            />
            <If when={taskEntityFilter()}>
              <View class="flex-row items-center gap-1 rounded-md border border-border bg-panel py-1 pl-2 pr-1">
                <Text class="max-w-45 truncate text-[11px] text-muted-foreground">
                  {taskEntityFilter()!.label}
                </Text>
                <View
                  role="button"
                  accessibilityLabel="Clear entity filter"
                  testID="clear-task-entity"
                  onPress={() => taskEntityFilter.set(null)}
                  class="h-5 w-5 items-center justify-center rounded"
                  hoverStyle={{ backgroundColor: token("accent") }}
                >
                  <Icon name="close" size={8} tone="muted-foreground" />
                </View>
              </View>
            </If>
          </View>
          <Text class="text-[11px] text-muted-foreground">
            {followUpRows().filter((task) => !task.done).length} open tasks
          </Text>
        </View>

        <If when={tasksTab() === "tasks"}>
          <Reveal class="relative min-h-0 flex-1">
            <View class="min-h-0 flex-1 flex-row overflow-hidden">
              <View class="flex w-110 shrink-0 flex-col border-r border-border">
                <TaskToolbar
                  selecting={selecting()}
                  onToggleSelecting={() => {
                    selecting.set(!selecting());
                    picked.set([]);
                  }}
                />
                <Scroll class="min-h-0 flex-1" scrollbar={false}>
                  <View class="px-4 pb-5">
                    <TaskList
                      tasks={pagedTasks()}
                      selectedId={selected()?.id ?? null}
                      selectionMode={selecting()}
                      selectedIds={picked()}
                      onToggleSelect={(id) =>
                        picked.set(
                          picked().includes(id)
                            ? picked().filter((row) => row !== id)
                            : [...picked(), id],
                        )
                      }
                      onSelect={selectedTaskId.set}
                      emptyTitle={taskQuery().trim() ? "No tasks match" : "Nothing here"}
                      emptyHint={
                        taskQuery().trim()
                          ? "Try a different search or clear the filters."
                          : "Create a task to start tracking work."
                      }
                      onComplete={(id) => {
                        const task = followUpRows().find((row) => row.id === id);
                        if (task?.done) {
                          reopenTask(id);
                          showToast("Task reopened.");
                        } else {
                          taskOutcomeId.set(id);
                        }
                      }}
                    />
                    <If when={screenTasks().length > 5}>
                      <View
                        class="mt-2 flex-row items-center justify-between gap-2 px-1"
                        testID="task-pager"
                      >
                        <Text class="text-[11px] tabular-nums text-muted-foreground">
                          {currentPage() * 5 + 1}–
                          {Math.min((currentPage() + 1) * 5, screenTasks().length)} of{" "}
                          {screenTasks().length}
                        </Text>
                        <View class="flex-row items-center gap-1">
                          <View
                            role="button"
                            accessibilityLabel="Previous task page"
                            testID="task-page-prev"
                            onPress={() => page.set(Math.max(0, currentPage() - 1))}
                            class="h-6 items-center justify-center rounded border border-border px-2"
                            style={{ opacity: currentPage() === 0 ? 0.4 : 1 }}
                          >
                            <Icon name="chevronLeft" size={8} tone="muted-foreground" />
                          </View>
                          <Text class="text-[11px] tabular-nums text-muted-foreground">
                            {currentPage() + 1}/{pageCount()}
                          </Text>
                          <View
                            role="button"
                            accessibilityLabel="Next task page"
                            testID="task-page-next"
                            onPress={() => page.set(Math.min(pageCount() - 1, currentPage() + 1))}
                            class="h-6 items-center justify-center rounded border border-border px-2"
                            style={{ opacity: currentPage() === pageCount() - 1 ? 0.4 : 1 }}
                          >
                            <Icon name="chevronRight" size={8} tone="muted-foreground" />
                          </View>
                        </View>
                      </View>
                    </If>
                    <If when={selecting() && picked().length > 0}>
                      <View
                        class="mt-2 flex-row items-center gap-1.5 rounded-lg border border-border bg-card p-2"
                        testID="task-bulk-bar"
                      >
                        <Text class="flex-1 text-[11px] font-medium text-muted-foreground">
                          {picked().length} selected
                        </Text>
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => {
                            for (const id of picked()) completeTaskWithOutcome(id, "");
                            picked.set([]);
                            selecting.set(false);
                            showToast("Selected tasks completed.");
                          }}
                        >
                          <Text class="text-[11px] font-medium">Complete</Text>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => {
                            for (const id of picked()) cancelTask(id);
                            picked.set([]);
                            selecting.set(false);
                          }}
                        >
                          <Text class="text-[11px] font-medium">Cancel</Text>
                        </Button>
                      </View>
                    </If>
                  </View>
                </Scroll>
              </View>
              <View class="min-w-0 flex-1">
                <Scroll class="h-full min-h-0" scrollbar={false}>
                  <If
                    when={selected()}
                    else={
                      <View class="items-center justify-center gap-2 p-12">
                        <Icon name="checkCheck" size={20} tone="success" />
                        <Text class="text-[13px] font-medium text-foreground">
                          No task selected
                        </Text>
                        <Text class="text-[12px] text-muted-foreground">
                          Choose a task to see its links and history.
                        </Text>
                      </View>
                    }
                  >
                    <TaskDetail
                      task={selected()!}
                      onComplete={(id) => taskOutcomeId.set(id)}
                      onReopen={(id) => {
                        reopenTask(id);
                        showToast("Task reopened.");
                      }}
                    />
                  </If>
                </Scroll>
              </View>
            </View>
          </Reveal>
        </If>

        <If when={tasksTab() !== "tasks"}>
          <TaskFeedPane tab={tasksTab() === "activity" ? "activity" : "reminders"} />
        </If>
      </ScreenFade>
    </View>
  );
}
