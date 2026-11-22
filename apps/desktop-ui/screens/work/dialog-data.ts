import type { FollowUpKind } from "../home/data";
import type { WorkActivityKind, WorkMode } from "./types";

export const modes: { id: WorkMode; label: string }[] = [
  { id: "task", label: "Create task" },
  { id: "activity", label: "Log activity" },
  { id: "reminder", label: "Set reminder" },
];

export const taskKinds: { label: string; value: FollowUpKind }[] = [
  { label: "Call", value: "call" },
  { label: "Send email", value: "email" },
  { label: "WhatsApp message", value: "whatsapp" },
  { label: "Meeting", value: "meeting" },
  { label: "Quote follow-up", value: "quote" },
  { label: "Prepare proposal", value: "proposal" },
  { label: "General task", value: "task" },
];

export const activityKinds: { label: string; value: WorkActivityKind }[] = [
  { label: "Note", value: "note" },
  { label: "Call", value: "call" },
  { label: "Email", value: "email" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Meeting", value: "meeting" },
  { label: "Other", value: "other" },
];

export function dialogTitle(editing: boolean, mode: WorkMode): string {
  if (editing) return "Edit task";
  if (mode === "activity") return "Log activity";
  if (mode === "reminder") return "Set reminder";
  return "Create task";
}

export function dialogDescription(editing: boolean, mode: WorkMode): string {
  if (editing) return "Update the next action, ownership, status, and timing.";
  if (mode === "activity") return "Record an interaction that already happened.";
  if (mode === "reminder") return "Get a nudge about something at the right time.";
  return "Plan the next action and make sure it gets done.";
}
