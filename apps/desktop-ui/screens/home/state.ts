import { signal } from "nsh";
import { currentMember, teamMembers } from "../../state";
import { seedTasks, type FollowUpKind, type FollowUpPriority, type FollowUpTask } from "./data";

export const followUpRows = signal<FollowUpTask[]>(seedTasks);
export function createFollowUp(input: {
  title: string;
  context: string;
  kind: FollowUpKind;
  priority: FollowUpPriority;
  due: string;
  dueInMinutes: number;
  dueAtMs?: number;
  notes?: string;
  ownerId?: string;
  visibility?: "org" | "private";
  conversationId?: string;
  opportunityId?: string;
}): FollowUpTask {
  const task: FollowUpTask = {
    id: `task-${Date.now()}`,
    title: input.title.trim(),
    context: input.context.trim() || "Follow-up",
    kind: input.kind,
    priority: input.priority,
    due: input.due,
    dueInMinutes: input.dueInMinutes,
    ...(input.dueAtMs === undefined ? {} : { dueAtMs: input.dueAtMs }),
    ...(input.notes ? { notes: input.notes } : {}),
    owner: input.ownerId
      ? (teamMembers.find((member) => member.id === input.ownerId)?.name ?? currentMember.name)
      : currentMember.name,
    ownerId: input.ownerId ?? currentMember.id,
    status: "open",
    visibility: input.visibility ?? "org",
    done: false,
    ...(input.conversationId ? { conversationId: input.conversationId } : {}),
    ...(input.opportunityId ? { opportunityId: input.opportunityId } : {}),
    source: "manual",
  };
  followUpRows.set([task, ...followUpRows()]);
  return task;
}

export function updateFollowUp(id: string, patch: Partial<FollowUpTask>): void {
  followUpRows.set(followUpRows().map((row) => (row.id === id ? { ...row, ...patch } : row)));
}

export function completeFollowUp(id: string): FollowUpTask | null {
  const task = followUpRows().find((row) => row.id === id);
  if (!task) return null;
  const completedAt = new Date().toISOString();
  followUpRows.set(
    followUpRows().map((row) =>
      row.id === id ? { ...row, done: true, status: "done", cancelled: false, completedAt } : row,
    ),
  );
  return { ...task, done: true, completedAt };
}

export function reopenFollowUp(id: string): void {
  followUpRows.set(
    followUpRows().map((row) => {
      if (row.id !== id) return row;
      const { completedAt: _completedAt, outcome: _outcome, ...rest } = row;
      return { ...rest, done: false, cancelled: false, status: "open" };
    }),
  );
}

export function openTasks(): FollowUpTask[] {
  return followUpRows()
    .filter((task) => !task.done && !task.cancelled)
    .toSorted((a, b) => a.dueInMinutes - b.dueInMinutes);
}

export function overdueTasks(): FollowUpTask[] {
  return openTasks().filter((task) => task.dueInMinutes < 0);
}

export function todayTasks(): FollowUpTask[] {
  return openTasks().filter((task) => task.dueInMinutes >= 0 && task.dueInMinutes <= 1440);
}

export function completedToday(): number {
  return followUpRows().filter((task) => task.done).length;
}
