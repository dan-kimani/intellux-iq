import { expect, open, test } from "nsh/test";
import { createWorkReminder, markReminderDue, workReminders } from "./screens/work/state";

async function openDesktop() {
  const app = await open("./App.tsx", {
    width: 1440,
    height: 900,
    platform: "linux",
    colorScheme: "dark",
  });
  await app.press("id:nav-inbox");
  await app.waitFor("id:conversation-sarah");
  return app;
}

test("creates a task from a message and keeps the link", async () => {
  const app = await openDesktop();
  await app.press("id:message-actions-sarah-m1");
  await app.waitFor("id:message-action-menu");
  await app.press("id:message-action-work-task");
  await app.waitFor("id:work-dialog");
  expect(app.texts()).toContain("Message · Maya Lin · WhatsApp");
  await app.type("id:work-title", "Send the packaging sample photo");
  await app.press("id:save-work-item");
  await app.waitFor("text:Task created.");

  await app.press("id:nav-tasks");
  await app.waitFor("id:screen-tasks");
  expect(app.texts()).toContain("Send the packaging sample photo");
  expect(app.texts()).toContain("WhatsApp conversation · Maya Lin · Atlas Enterprises");
});

test("logs an activity from an email thread", async () => {
  const app = await openDesktop();
  await app.press("id:filter-email");
  await app.waitFor("id:mail-inbox-summit");
  await app.press("id:mail-inbox-summit");
  await app.waitFor("text:Distributor-terms.docx");
  await app.press("id:mail-work-actions");
  await app.press("id:menu-work-activity");
  await app.waitFor("id:work-dialog");
  await app.type("id:work-title", "Called Summit about the distributor terms");
  await app.press("id:save-work-item");
  await app.waitFor("text:Activity logged.");
  expect(app.texts()).toContain("Called Summit about the distributor terms");
  await app.press("id:nav-tasks");
  await app.press("id:tasks-tab-activity");
  await app.waitFor("text:Called Summit about the distributor terms");
});

test("sets and shows a reminder linked to a quote", async () => {
  const app = await openDesktop();
  await app.press("id:nav-quotes");
  await app.waitFor("id:quote-mini-list");
  await app.press("id:quote-work-actions");
  await app.press("id:menu-work-reminder");
  await app.waitFor("id:work-dialog");
  await app.type("id:work-title", "Check the Q4 discount approval");
  await app.press("id:save-work-item");
  await app.waitFor("text:Reminder set for Tomorrow · 09:00.");
  await app.press("id:nav-tasks");
  await app.press("id:tasks-tab-reminders");
  await app.waitFor("text:Check the Q4 discount approval");
});

test("links a task to another entity from the create dialog", async () => {
  const app = await openDesktop();
  await app.press("id:nav-tasks");
  await app.waitFor("id:screen-tasks");
  await app.press("id:tasks-new");
  await app.press("id:menu-work-task");
  await app.waitFor("id:work-dialog");
  await app.type("id:work-title", "Prepare a packaging sample for Maya");
  await app.press("id:work-dialog-add-link");
  await app.waitFor("id:work-link-search");
  await app.type("id:work-link-search", "Maya");
  await app.press("id:work-link-contact-c1");
  await app.press("id:save-work-item");
  await app.waitFor("text:Task created.");
  await app.press("id:nav-contacts");
  await app.waitFor("text:Directory");
  await app.press("text:Maya Lin");
  await app.waitFor("id:contact-page");
  expect(app.texts()).toContain("Prepare a packaging sample for Maya");
});

test("opens work actions from an email right-click", async () => {
  const app = await openDesktop();
  await app.press("id:filter-email");
  await app.waitFor("id:mail-inbox-summit");
  await app.rightClick("id:mail-inbox-summit");
  await app.press("id:context-work-task");
  await app.waitFor("id:work-dialog");
  expect(app.shows("id:work-dialog")).toBe(true);
});

test("captures an outcome when completing a task", async () => {
  const app = await openDesktop();
  await app.press("id:nav-tasks");
  await app.waitFor("id:screen-tasks");
  await app.press("id:task-row-task-2");
  await app.waitFor("id:task-detail-task-2");
  await app.press("id:task-complete");
  await app.waitFor("id:task-outcome-dialog");
  await app.type("id:task-outcome", "Customer accepted the revised pricing.");
  await app.press("id:save-task-outcome");
  await app.waitFor("text:Customer accepted the revised pricing.");
});

test("adds a reminder to a task from its detail", async () => {
  const app = await openDesktop();
  await app.press("id:nav-tasks");
  await app.waitFor("id:screen-tasks");
  await app.press("id:task-row-task-2");
  await app.waitFor("id:task-detail-task-2");
  await app.press("id:task-add-reminder");
  await app.waitFor("id:work-dialog");
  expect(app.shows("label:Task: Send the revised quote to TechWorld")).toBe(true);
  await app.type("id:work-title", "Check the TechWorld quote response");
  await app.press("id:save-work-item");
  await app.waitFor("text:Reminder set for Tomorrow · 09:00.");
  await app.press("id:tasks-tab-reminders");
  expect(app.texts().join(" ")).toContain("Check the TechWorld quote response");
});

test("logs a system activity when a quote is sent", async () => {
  const app = await openDesktop();
  await app.press("id:nav-quotes");
  await app.waitFor("id:quote-mini-list");
  await app.press("id:quote-send");
  await app.press("id:nav-tasks");
  await app.press("id:tasks-tab-activity");
  await app.waitFor("text:Quote QT-2025-0045 sent");
});

test("opens Tasks filtered to the entity's work", async () => {
  const app = await openDesktop();
  await app.press("id:details-work");
  await app.waitFor("id:work-section");
  await app.press("id:work-view-all");
  await app.waitFor("id:screen-tasks");
  expect(app.shows("id:clear-task-entity")).toBe(true);
  expect(app.texts()).toContain("WhatsApp conversation");
});

test("changes the source link of a task", async () => {
  const app = await openDesktop();
  await app.press("id:nav-tasks");
  await app.waitFor("id:screen-tasks");
  await app.press("id:task-row-task-2");
  await app.waitFor("id:task-detail-task-2");
  await app.press("id:make-source-opportunity-OPP-2025-0127");
  await app.waitFor("id:task-source-opportunity");
});

test("marks a due reminder for notification", () => {
  const reminder = createWorkReminder({
    title: "Overdue reminder probe",
    notes: "Local scheduler",
    triggerAt: "Now",
    triggerAtMs: Date.now() - 1_000,
    links: [],
  });
  markReminderDue(reminder.id);
  expect(workReminders().find((row) => row.id === reminder.id)?.status).toBe("due");
});

test("pages through the complete task list", async () => {
  const app = await openDesktop();
  await app.press("id:nav-tasks");
  await app.waitFor("id:screen-tasks");
  await app.press("id:task-filter-all");
  await app.waitFor("id:task-pager");
  await app.press("id:task-page-next");
  await app.waitFor("text:6–8 of 8");
});

test("auto-links only the exact message that opened the dialog", async () => {
  const app = await openDesktop();
  await app.press("id:message-actions-sarah-m1");
  await app.press("id:message-action-work-task");
  await app.waitFor("id:work-dialog");
  expect(app.shows("id:work-link-chip-message-sarah::sarah-m1")).toBe(true);
});

test("does not auto-link a message from the conversation header", async () => {
  const app = await openDesktop();
  await app.press("id:conversation-more");
  await app.press("id:menu-work-task");
  await app.waitFor("id:work-dialog");
  expect(app.shows("id:work-link-chip-message-sarah::sarah-m1")).toBe(false);
});

test("picks a reusable calendar date and time", async () => {
  const app = await openDesktop();
  await app.press("id:nav-tasks");
  await app.press("id:tasks-new");
  await app.press("id:menu-work-task");
  await app.waitFor("id:work-dialog");
  await app.press("id:task-due-date");
  await app.press("id:date-next-month");
  await app.press("id:date-day-25");
  await app.press("id:task-due-time");
  await app.press("id:time-hour-10");
  await app.press("id:time-minute-30");
  await app.press("id:time-done");
  expect(app.texts()).toContain("10:30");
});

test("rejects a task scheduled in the past", async () => {
  const app = await openDesktop();
  await app.press("id:nav-tasks");
  await app.press("id:tasks-new");
  await app.press("id:menu-work-task");
  await app.waitFor("id:work-dialog");
  await app.type("id:work-title", "Backdated follow-up");
  await app.press("id:task-due-date");
  await app.press("id:date-today");
  await app.press("id:task-due-time");
  await app.press("id:time-hour-00");
  await app.press("id:time-minute-00");
  await app.press("id:time-done");
  await app.press("id:save-work-item");
  await app.waitFor("text:Choose a future due date and time.");
});

test("edits an existing task and changes its status", async () => {
  const app = await openDesktop();
  await app.press("id:nav-tasks");
  await app.press("id:task-row-task-2");
  await app.waitFor("id:task-detail-task-2");
  await app.press("id:task-edit");
  await app.waitFor("id:work-dialog");
  expect(app.texts()).toContain("Edit task");
  await app.press("id:task-status-in_progress");
  await app.press("id:save-work-item");
  await app.waitFor("text:Task updated.");
  await app.waitFor("text:In progress");
});
