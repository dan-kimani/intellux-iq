import type { MenuAction } from "../../components/ActionMenu";
import { openWorkDialog } from "./state";
import type { WorkLink } from "./types";

export function workMenuActions(link?: WorkLink): MenuAction[] {
  return [
    {
      id: "work-task",
      label: "Create task",
      icon: "checkCheck",
      onSelect: () => openWorkDialog({ mode: "task", ...(link ? { link } : {}) }),
    },
    {
      id: "work-activity",
      label: "Log activity",
      icon: "fileText",
      onSelect: () => openWorkDialog({ mode: "activity", ...(link ? { link } : {}) }),
    },
    {
      id: "work-reminder",
      label: "Set reminder",
      icon: "calendarClock",
      onSelect: () => openWorkDialog({ mode: "reminder", ...(link ? { link } : {}) }),
    },
  ];
}

export function taskMenuAction(link?: WorkLink): MenuAction {
  return {
    id: "work-task-only",
    label: "Create task",
    icon: "checkCheck",
    onSelect: () => openWorkDialog({ mode: "task", ...(link ? { link } : {}) }),
  };
}
