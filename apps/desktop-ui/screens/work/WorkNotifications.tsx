import { effect, Notifications } from "nsh";
import { activeNav, activeNavChild, currentMember } from "../../state";
import { markReminderDue, tasksTab, workReminders } from "./state";

function tick() {
  const now = Date.now();
  for (const reminder of workReminders()) {
    if (
      reminder.ownerId === currentMember.id &&
      reminder.status === "scheduled" &&
      (reminder.triggerAtMs ?? Infinity) <= now
    ) {
      markReminderDue(reminder.id);
    }
  }
}

export function WorkNotifications() {
  effect(() => {
    const timer = setInterval(tick, 2_000);
    tick();
    let stop: (() => void) | null = null;
    try {
      stop = Notifications.on("press", () => {
        tasksTab.set("reminders");
        activeNavChild.set("tasks");
        activeNav.set("Tasks");
      });
    } catch {
      // Notifications are unavailable on this platform or build.
    }
    return () => {
      clearInterval(timer);
      stop?.();
    };
  });
  return null;
}
