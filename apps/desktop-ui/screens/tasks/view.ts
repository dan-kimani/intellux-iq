import { signal } from "nsh";
import type { FollowUpTask } from "../home/data";
import type { WorkLink } from "../work/types";
import { followUpRows } from "../home/state";

export type TaskFilter = "today" | "upcoming" | "overdue" | "completed" | "all";

/** Kept outside the screen so entity Work sections can open the right view. */
export const taskScope = signal<TaskFilter>("today");
export const taskEntityFilter = signal<WorkLink | null>(null);
export const taskQuery = signal("");
export const taskOwner = signal("all");

export const taskFilters: { id: TaskFilter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
  { id: "all", label: "All" },
];

export function filteredTasks(filter: TaskFilter): FollowUpTask[] {
  const rows = followUpRows();
  if (filter === "completed") {
    return rows.filter((task) => task.done).toSorted((a, b) => a.dueInMinutes - b.dueInMinutes);
  }
  const open = rows
    .filter((task) => !task.done)
    .toSorted((a, b) => a.dueInMinutes - b.dueInMinutes);
  if (filter === "overdue")
    return open.filter((task) => task.dueInMinutes < 0 || task.due.startsWith("Overdue"));
  if (filter === "today")
    return open.filter(
      (task) => task.dueInMinutes >= 0 && (task.due.startsWith("Today") || task.dueInMinutes < 720),
    );
  if (filter === "upcoming")
    return open.filter((task) => !task.due.startsWith("Today") && task.dueInMinutes >= 720);
  return rows.toSorted(
    (a, b) => Number(a.done) - Number(b.done) || a.dueInMinutes - b.dueInMinutes,
  );
}

export const dueOptions = [
  { label: "Today · 15:00", minutes: 300 },
  { label: "Tomorrow · 09:00", minutes: 1440 },
  { label: "This week", minutes: 4320 },
];
