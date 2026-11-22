import type { Signal } from "nsh";
import type { FollowUpKind, FollowUpPriority, TaskStatus } from "../home/data";
import type { WorkActivityKind } from "./types";

export type ReminderLead = "due" | "15m" | "1h" | "1d" | "custom";

export interface TaskFormSignals {
  action: Signal<FollowUpKind>;
  details: Signal<string>;
  dueAt: Signal<number>;
  ownerId: Signal<string>;
  priority: Signal<FollowUpPriority>;
  visibility: Signal<"org" | "private">;
  status: Signal<TaskStatus>;
  reminderOn: Signal<boolean>;
  reminderLead: Signal<ReminderLead>;
  customReminderAt: Signal<number>;
}

export interface ActivityFormSignals {
  kind: Signal<WorkActivityKind>;
  occurredAt: Signal<number>;
  participants: Signal<string>;
  outcome: Signal<string>;
}

export interface ReminderFormSignals {
  remindAt: Signal<number>;
  taskId: Signal<string>;
  visibility: Signal<"org" | "private">;
  ownerId: Signal<string>;
}
