import { Notifications, signal } from "nsh";
import { currentMember, allConversations, showToast, teamMembers } from "../../state";
import { initialActivity } from "./seed";
import { dealRows } from "../deals/state";
import { completeFollowUp, followUpRows, reopenFollowUp, updateFollowUp } from "../home/state";
import type { FollowUpTask } from "../home/data";
import { conversationLink, opportunityLink, sameLink } from "./links";
import type {
  WorkActivity,
  WorkActivityKind,
  WorkDialogState,
  WorkLink,
  WorkMode,
  WorkReminder,
  WorkTab,
} from "./types";
import { dueLabel, inHours } from "./time";

export { closeWorkDialog, openWorkDialog, workDialog, workDialogOpen } from "./dialog";

export const selectedTaskId = signal<string | null>("task-1");
export const tasksTab = signal<WorkTab>("tasks");
export const taskOutcomeId = signal<string | null>(null);
export const workActivities = signal<WorkActivity[]>(initialActivity());
export const workReminders = signal<WorkReminder[]>([]);

export function taskLinks(task: FollowUpTask): WorkLink[] {
  if (task.links) return task.links;
  const links: WorkLink[] = [];
  const conversation = allConversations().find((row) => row.id === task.conversationId);
  if (conversation) links.push(conversationLink(conversation));
  const deal = dealRows().find((row) => row.id === task.opportunityId);
  if (deal) links.push(opportunityLink(deal));
  return links;
}

export function setTaskLinks(taskId: string, links: WorkLink[]): void {
  const unique = links.filter(
    (link, index) => links.findIndex((candidate) => sameLink(candidate, link)) === index,
  );
  updateFollowUp(taskId, { links: unique });
}

export function createWorkActivity(input: {
  kind: WorkActivityKind;
  title: string;
  notes: string;
  occurredAt: string;
  occurredAtMs?: number;
  participants?: string[];
  outcome?: string;
  links: WorkLink[];
  source?: "manual" | "system";
}): WorkActivity {
  const activity: WorkActivity = {
    id: `work-activity-${Date.now()}`,
    kind: input.kind,
    title: input.title.trim(),
    notes: input.notes.trim(),
    occurredAt: input.occurredAt,
    ...(input.occurredAtMs === undefined ? {} : { occurredAtMs: input.occurredAtMs }),
    actor: currentMember.name,
    ...(input.participants?.length ? { participants: input.participants } : {}),
    ...(input.outcome ? { outcome: input.outcome } : {}),
    links: input.links,
    source: input.source ?? "manual",
  };
  workActivities.set([activity, ...workActivities()]);
  return activity;
}

export function createWorkReminder(input: {
  title: string;
  notes: string;
  triggerAt: string;
  triggerAtMs: number;
  links: WorkLink[];
  taskId?: string;
  visibility?: "org" | "private";
  ownerId?: string;
}): WorkReminder {
  void Notifications.requestPermission().catch(() => {});
  const reminder: WorkReminder = {
    id: `work-reminder-${Date.now()}`,
    title: input.title.trim(),
    notes: input.notes.trim(),
    triggerAt: input.triggerAt,
    triggerAtMs: input.triggerAtMs,
    status: "scheduled",
    owner:
      teamMembers.find((member) => member.id === (input.ownerId ?? currentMember.id))?.name ??
      currentMember.name,
    ownerId: input.ownerId ?? currentMember.id,
    visibility: input.visibility ?? "private",
    links: input.links,
    ...(input.taskId ? { taskId: input.taskId } : {}),
  };
  workReminders.set([reminder, ...workReminders()]);
  return reminder;
}

export function visibleReminders(): WorkReminder[] {
  const manager = currentMember.role === "manager" || currentMember.role === "admin";
  return workReminders().filter(
    (row) => manager || row.visibility === "org" || row.ownerId === currentMember.id,
  );
}

export function dismissWorkReminder(id: string): void {
  workReminders.set(
    workReminders().map((row) => (row.id === id ? { ...row, status: "dismissed" } : row)),
  );
}

export function activeReminderFor(link: WorkLink): WorkReminder | null {
  return (
    workReminders().find(
      (row) =>
        (row.status === "scheduled" || row.status === "due") &&
        row.links.some((candidate) => sameLink(candidate, link)),
    ) ?? null
  );
}

export function activeReminderForConversation(conversationId: string): WorkReminder | null {
  return (
    workReminders().find(
      (row) =>
        (row.status === "scheduled" || row.status === "due") &&
        row.links.some(
          (link) =>
            (link.type === "conversation" && link.id === conversationId) ||
            (link.type === "message" && link.id.startsWith(`${conversationId}::`)),
        ),
    ) ?? null
  );
}

export function snoozeWorkReminder(id: string): void {
  workReminders.set(
    workReminders().map((row) => {
      if (row.id !== id) return row;
      const triggerAtMs = inHours(1);
      return {
        ...row,
        triggerAtMs,
        triggerAt: dueLabel(triggerAtMs),
        status: "scheduled" as const,
      };
    }),
  );
}

export function remindMeLater(taskId: string): void {
  const task = followUpRows().find((row) => row.id === taskId);
  if (!task) return;
  const triggerAtMs = inHours(1);
  createWorkReminder({
    title: `Follow up: ${task.title}`,
    notes: `Reminder for ${task.title}`,
    triggerAt: dueLabel(triggerAtMs),
    triggerAtMs,
    links: taskLinks(task),
    taskId,
    visibility: "private",
  });
  showToast("Reminder set for 1 hour from now.");
}

export function markReminderDue(id: string): void {
  const reminder = workReminders().find((row) => row.id === id);
  if (!reminder || reminder.status !== "scheduled") return;
  workReminders.set(
    workReminders().map((row) => (row.id === id ? { ...row, status: "due" as const } : row)),
  );
  showToast(`Reminder: ${reminder.title}`);
  void Notifications.show({
    id: `work-reminder-${id}`,
    title: reminder.title,
    body: reminder.notes || "You asked to be reminded about this.",
  }).catch(() => {});
}

export function completeTaskAndLog(id: string): FollowUpTask | null {
  const task = followUpRows().find((row) => row.id === id);
  if (!task) return null;
  return completeTaskWithOutcome(id, task.outcome ?? "");
}

export function completeTaskWithOutcome(id: string, outcome: string): FollowUpTask | null {
  const task = followUpRows().find((row) => row.id === id);
  if (!task) return null;
  const updated = completeFollowUp(id);
  updateFollowUp(id, { outcome: outcome.trim() });
  const links = taskLinks(task);
  const activity = createWorkActivity({
    kind: "note",
    title: `Completed: ${task.title}`,
    notes: outcome.trim() || "Task completed without a written outcome.",
    occurredAt: "Just now",
    occurredAtMs: Date.now(),
    links,
  });
  workActivities.set(
    workActivities().map((row) => (row.id === activity.id ? { ...row, taskId: id } : row)),
  );
  workReminders.set(
    workReminders().map((reminder) =>
      reminder.taskId === id ||
      reminder.links.some((link) => links.some((taskLink) => sameLink(link, taskLink)))
        ? { ...reminder, status: "dismissed" as const }
        : reminder,
    ),
  );
  showToast("Task completed.");
  const refreshed = followUpRows().find((row) => row.id === id);
  return refreshed ?? updated;
}

export function cancelTask(id: string): void {
  updateFollowUp(id, { cancelled: true, done: false, status: "cancelled" });
  showToast("Task cancelled.");
}

export function reopenTask(id: string): void {
  reopenFollowUp(id);
  updateFollowUp(id, { cancelled: false, status: "open" });
  showToast("Task reopened.");
}

export function setTaskSource(id: string, link: WorkLink): void {
  const task = followUpRows().find((row) => row.id === id);
  if (!task) return;
  setTaskLinks(id, [link, ...taskLinks(task).filter((entry) => !sameLink(entry, link))]);
}

export function addLinkToTask(id: string, link: WorkLink): void {
  const task = followUpRows().find((row) => row.id === id);
  if (!task) return;
  const links = taskLinks(task);
  if (links.some((candidate) => sameLink(candidate, link))) {
    showToast("That entity is already linked.");
    return;
  }
  if (links.length >= 8) {
    showToast("A task can link to at most 8 records.");
    return;
  }
  setTaskLinks(id, [...links, link]);
}

export function removeLinkFromTask(id: string, link: WorkLink): void {
  const task = followUpRows().find((row) => row.id === id);
  if (!task) return;
  setTaskLinks(
    id,
    taskLinks(task).filter((candidate) => !sameLink(candidate, link)),
  );
}

export function logSystemActivity(input: {
  kind: WorkActivityKind;
  title: string;
  notes: string;
  links: WorkLink[];
}): WorkActivity {
  return createWorkActivity({
    ...input,
    occurredAt: "Just now",
    occurredAtMs: Date.now(),
    source: "system",
  });
}

export { createTaskLinkContext } from "./links";

export {
  type WorkActivity,
  type WorkActivityKind,
  type WorkDialogState,
  type WorkLink,
  type WorkMode,
  type WorkReminder,
  type WorkTab,
};
