export type WorkEntityType =
  | "conversation"
  | "message"
  | "email"
  | "contact"
  | "company"
  | "opportunity"
  | "quote"
  | "product";

export interface WorkLink {
  type: WorkEntityType;
  id: string;
  label: string;
  detail: string;
}

export type WorkMode = "task" | "activity" | "reminder";

export type WorkActivityKind = "note" | "call" | "email" | "whatsapp" | "meeting" | "other";

export type ReminderStatus = "scheduled" | "due" | "dismissed";
export type WorkTab = "tasks" | "activity" | "reminders";

export interface WorkActivity {
  id: string;
  kind: WorkActivityKind;
  title: string;
  notes: string;
  occurredAt: string;
  occurredAtMs?: number;
  actor: string;
  participants?: string[];
  outcome?: string;
  links: WorkLink[];
  taskId?: string;
  source: "manual" | "system";
}

export interface WorkReminder {
  id: string;
  title: string;
  notes: string;
  triggerAt: string;
  triggerAtMs?: number;
  status: ReminderStatus;
  owner: string;
  ownerId: string;
  visibility: "org" | "private";
  links: WorkLink[];
  taskId?: string;
}

export interface WorkDialogState {
  mode: WorkMode;
  link?: WorkLink;
  taskId?: string;
  ownerId?: string;
  openedAt?: number;
}
