import { signal, View } from "nsh";
import { RightDrawer } from "../../components/RightDrawer";
import { TextField } from "../../components/forms";
import { currentMember, showToast, teamMembers } from "../../state";
import { createFollowUp, followUpRows, updateFollowUp } from "../home/state";
import type { FollowUpKind, FollowUpPriority, TaskStatus } from "../home/data";
import { contextLinksFor, suggestedAction } from "./context";
import { taskEntityFilter, taskScope } from "../tasks/view";
import { dueLabel, dueMinutes, nextMorning } from "./time";
import {
  closeWorkDialog,
  createTaskLinkContext,
  createWorkActivity,
  createWorkReminder,
  selectedTaskId,
  setTaskLinks,
  taskLinks,
  workDialog,
  workDialogOpen,
} from "./state";
import type { WorkLink, WorkMode, WorkActivityKind } from "./types";
import { RelatedContext } from "./RelatedContext";
import { TaskWorkspace } from "./TaskWorkspace";
import { ActivityPane } from "./ActivityPane";
import { ReminderPane } from "./ReminderPane";
import { WorkModeTabs } from "./WorkModeTabs";
import { WorkDialogFooter } from "./WorkDialogFooter";
import { dialogDescription, dialogTitle } from "./dialog-data";
import type { ReminderLead } from "./form";

function titleLabel(mode: WorkMode): string {
  if (mode === "activity") return "Summary";
  if (mode === "reminder") return "Reminder";
  return "Task title";
}

function modeToast(mode: WorkMode): string {
  if (mode === "activity") return "Activity logged.";
  if (mode === "reminder") return "Reminder set.";
  return "Task created.";
}

function nowMs(): number {
  return Date.now();
}

function reminderTime(dueAt: number, lead: ReminderLead, custom: number): number {
  if (lead === "custom") return custom;
  if (lead === "due") return dueAt;
  if (lead === "15m") return dueAt - 15 * 60_000;
  if (lead === "1h") return dueAt - 60 * 60_000;
  return dueAt - 24 * 60 * 60_000;
}

export function WorkDialog() {
  const draft = workDialog();
  const draftTask = draft?.taskId
    ? followUpRows().find((row) => row.id === draft.taskId)
    : undefined;
  const editing = draft?.mode === "task" && Boolean(draftTask);
  const initialLinks = draftTask ? taskLinks(draftTask) : contextLinksFor(draft?.link);
  const initialAction = draftTask?.kind ?? suggestedAction(initialLinks);
  const mode = signal<WorkMode>(draft?.mode ?? "task");
  const title = signal(draftTask?.title ?? "");
  const details = signal(draftTask?.notes ?? "");
  const links = signal<WorkLink[]>(initialLinks);
  const reminderOn = signal(true);
  const reminderLead = signal<ReminderLead>("15m");

  const taskForm = {
    action: signal<FollowUpKind>(initialAction),
    details,
    dueAt: signal(draftTask?.dueAtMs ?? nextMorning()),
    ownerId: signal(draftTask?.ownerId ?? currentMember.id),
    priority: signal<FollowUpPriority>(draftTask?.priority ?? "normal"),
    visibility: signal<"org" | "private">(draftTask?.visibility ?? "org"),
    status: signal<TaskStatus>(
      draftTask?.status ?? (draftTask?.done ? "done" : draftTask?.cancelled ? "cancelled" : "open"),
    ),
    reminderOn,
    reminderLead,
    customReminderAt: signal(nextMorning() - 15 * 60_000),
  };
  const activityKind: WorkActivityKind =
    initialAction === "whatsapp"
      ? "whatsapp"
      : initialAction === "email" || initialAction === "quote"
        ? "email"
        : initialAction === "call"
          ? "call"
          : "note";
  const activityForm = {
    kind: signal<WorkActivityKind>(activityKind),
    occurredAt: signal(draft?.openedAt ?? 0),
    participants: signal(initialLinks.find((link) => link.type === "contact")?.label ?? ""),
    outcome: signal(""),
  };
  const reminderForm = {
    remindAt: signal(nextMorning()),
    taskId: signal(draft?.taskId ?? ""),
    visibility: signal<"org" | "private">("private"),
    ownerId: signal(draftTask?.ownerId ?? currentMember.id),
  };

  const addLink = (link: WorkLink) => {
    if (links().some((row) => row.type === link.type && row.id === link.id)) return;
    if (links().length >= 8) {
      showToast("Link at most 8 records.");
      return;
    }
    links.set([...links(), link]);
  };
  const removeLink = (link: WorkLink) => {
    links.set(links().filter((row) => row.type !== link.type || row.id !== link.id));
  };

  const save = () => {
    if (!title().trim()) {
      showToast(mode() === "activity" ? "Add a summary." : "Give this a title.");
      return;
    }
    const dueChanged = !editing || taskForm.dueAt() !== draftTask?.dueAtMs;
    if (mode() === "task" && dueChanged && taskForm.dueAt() <= nowMs()) {
      showToast("Choose a future due date and time.");
      return;
    }
    if (mode() === "reminder" && reminderForm.remindAt() <= nowMs()) {
      showToast("Choose a future reminder date and time.");
      return;
    }
    if (
      mode() === "task" &&
      taskForm.reminderOn() &&
      taskForm.reminderLead() === "custom" &&
      taskForm.customReminderAt() <= nowMs()
    ) {
      showToast("Choose a future custom reminder time.");
      return;
    }
    if (mode() === "activity") {
      createWorkActivity({
        kind: activityForm.kind(),
        title: title(),
        notes: activityForm.outcome(),
        occurredAt: dueLabel(activityForm.occurredAt()),
        occurredAtMs: activityForm.occurredAt(),
        participants: activityForm
          .participants()
          .split(",")
          .map((row) => row.trim())
          .filter(Boolean),
        outcome: activityForm.outcome(),
        links: links(),
      });
    } else if (mode() === "reminder") {
      createWorkReminder({
        title: title(),
        notes: details(),
        triggerAt: dueLabel(reminderForm.remindAt()),
        triggerAtMs: reminderForm.remindAt(),
        links: links(),
        visibility: reminderForm.visibility(),
        ownerId: reminderForm.ownerId(),
        ...(reminderForm.taskId() ? { taskId: reminderForm.taskId() } : {}),
      });
    } else if (editing && draftTask) {
      const status = taskForm.status();
      const owner = teamMembers.find((member) => member.id === taskForm.ownerId());
      updateFollowUp(draftTask.id, {
        title: title(),
        notes: details(),
        kind: taskForm.action(),
        priority: taskForm.priority(),
        due: dueLabel(taskForm.dueAt()),
        dueInMinutes: dueMinutes(taskForm.dueAt()),
        dueAtMs: taskForm.dueAt(),
        owner: owner?.name ?? draftTask.owner,
        ownerId: taskForm.ownerId(),
        visibility: taskForm.visibility(),
        status,
        done: status === "done",
        cancelled: status === "cancelled",
        ...(status === "done"
          ? { completedAt: draftTask.completedAt ?? new Date().toISOString() }
          : {}),
      });
      setTaskLinks(draftTask.id, links());
      showToast("Task updated.");
      closeWorkDialog();
      return;
    } else {
      const task = createFollowUp({
        title: title(),
        context: links()[0] ? `${links()[0].label} · ${links()[0].detail}` : "Standalone task",
        kind: taskForm.action(),
        priority: taskForm.priority(),
        due: dueLabel(taskForm.dueAt()),
        dueInMinutes: dueMinutes(taskForm.dueAt()),
        dueAtMs: taskForm.dueAt(),
        notes: details(),
        ownerId: taskForm.ownerId(),
        visibility: taskForm.visibility(),
        ...createTaskLinkContext(links()),
      });
      setTaskLinks(task.id, links());
      selectedTaskId.set(task.id);
      taskScope.set("all");
      taskEntityFilter.set(null);
      if (reminderOn()) {
        const at = reminderTime(taskForm.dueAt(), reminderLead(), taskForm.customReminderAt());
        createWorkReminder({
          title: `Reminder: ${task.title}`,
          notes: details() || `Before ${task.title}`,
          triggerAt: dueLabel(at),
          triggerAtMs: at,
          links: links(),
          taskId: task.id,
          visibility: taskForm.visibility(),
          ownerId: taskForm.ownerId(),
        });
      }
    }
    showToast(
      mode() === "reminder"
        ? `Reminder set for ${dueLabel(reminderForm.remindAt())}.`
        : modeToast(mode()),
    );
    closeWorkDialog();
  };

  return (
    <RightDrawer
      open={workDialogOpen()}
      onClose={closeWorkDialog}
      title={dialogTitle(editing, mode())}
      description={dialogDescription(editing, mode())}
      width={360}
      testID="work-dialog"
      footer={
        <WorkDialogFooter mode={mode()} editing={editing} onSave={save} onClose={closeWorkDialog} />
      }
    >
      <View class="gap-4">
        <If when={!editing}>
          <WorkModeTabs value={mode()} onChange={mode.set} />
        </If>
        <If when={mode() === "task"}>
          <TaskWorkspace
            title={title}
            details={details}
            links={links()}
            form={taskForm}
            minimumDate={draft?.openedAt ?? 0}
            editing={editing}
            autoLinked={Boolean(draft?.link) && !editing}
            {...(draft?.link ? { primaryType: draft.link.type } : {})}
            onAdd={addLink}
            onRemove={removeLink}
          />
        </If>
        <If when={mode() !== "task"}>
          <TextField
            label={titleLabel(mode())}
            value={title}
            onChange={title.set}
            placeholder={
              mode() === "activity"
                ? "Call with Maya about the revised quote"
                : "Check the TechWorld quote response"
            }
            hint="Required"
            testID="work-title"
          />
          <RelatedContext
            links={links()}
            autoLinked={Boolean(draft?.link)}
            {...(draft?.link ? { primaryType: draft.link.type } : {})}
            onAdd={addLink}
            onRemove={removeLink}
          />
          <If when={mode() === "activity"}>
            <ActivityPane form={activityForm} />
          </If>
          <If when={mode() === "reminder"}>
            <ReminderPane
              form={reminderForm}
              notes={details}
              setNotes={details.set}
              minimumDate={draft?.openedAt ?? 0}
            />
          </If>
        </If>
      </View>
    </RightDrawer>
  );
}
