import { currentMember } from "../../state";
import type { FollowUpTask } from "../home/data";

export function canViewTask(task: FollowUpTask): boolean {
  return (
    currentMember.role === "manager" ||
    currentMember.role === "admin" ||
    (task.visibility ?? "org") === "org" ||
    !task.ownerId ||
    task.ownerId === currentMember.id
  );
}

export function canEditTask(task: FollowUpTask): boolean {
  return (
    currentMember.role === "manager" ||
    currentMember.role === "admin" ||
    !task.ownerId ||
    task.ownerId === currentMember.id
  );
}
