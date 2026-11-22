import { expect, open, test } from "nsh/test";

async function openDesktop() {
  return open("./App.tsx", {
    width: 1440,
    height: 900,
    platform: "linux",
    colorScheme: "dark",
  });
}

test("opens the seeded watchlist and jumps to a watched task", async () => {
  const app = await openDesktop();
  await app.waitFor("id:watch-dock-toggle");
  await app.press("id:watch-dock-toggle");
  await app.waitFor("id:watch-dock-panel");
  expect(app.shows("id:watch-row-task-task-1")).toBe(true);
  expect(app.shows("id:watch-row-email-thread-pricing-q4")).toBe(true);
  expect(app.shows("id:watch-row-conversation-david")).toBe(true);

  await app.press("id:watch-row-task-task-1");
  await app.waitFor("id:screen-tasks");
  await app.waitFor("id:task-detail-task-1");
  expect(app.texts()).toContain("Call Maya about the packaging artwork");
});

test("filters the watchlist to entities that need action", async () => {
  const app = await openDesktop();
  await app.press("id:watch-dock-toggle");
  await app.waitFor("id:watch-dock-panel");
  await app.press("id:watch-filter-attention");
  await app.waitFor("id:watch-row-task-task-1");
  expect(app.shows("id:watch-row-conversation-david")).toBe(true);
  expect(app.shows("id:watch-row-task-task-6")).toBe(false);
  await app.press("id:watch-filter-all");
  expect(app.shows("id:watch-row-task-task-6")).toBe(true);
});

test("marks a watched email seen without marking it read", async () => {
  const app = await openDesktop();
  await app.press("id:watch-dock-toggle");
  await app.waitFor("id:watch-dock-panel");
  await app.waitFor("id:watch-new-email-thread-pricing-q4");
  await app.press("id:watch-menu-trigger-email-thread-pricing-q4");
  await app.press("id:menu-watch-seen");
  await app.waitFor("text:Marked seen.");
  expect(app.shows("id:watch-new-email-thread-pricing-q4")).toBe(false);
  expect(app.texts()).toContain("Awaiting your reply · 1 unread");
});

test("keeps a read email in needs action while awaiting a reply", async () => {
  const app = await openDesktop();
  await app.press("id:watch-dock-toggle");
  await app.waitFor("id:watch-row-email-thread-pricing-q4");
  await app.press("id:watch-row-email-thread-pricing-q4");
  await app.waitFor("id:mail-page");
  await app.press("id:watch-dock-toggle");
  await app.waitFor("id:watch-dock-panel");
  await app.press("id:watch-filter-attention");
  expect(app.shows("id:watch-row-email-thread-pricing-q4")).toBe(true);
  expect(app.texts()).toContain("Awaiting your reply");
});

test("flags a task that is due soon", async () => {
  const app = await openDesktop();
  await app.press("id:nav-tasks");
  await app.waitFor("id:screen-tasks");
  await app.press("id:task-row-task-2");
  await app.waitFor("id:task-detail-task-2");
  await app.press("id:task-watch");
  await app.waitFor("text:Watching this task.");
  await app.press("id:watch-dock-toggle");
  await app.waitFor("id:watch-row-task-task-2");
  expect(app.texts()).toContain("Due in 40m");
});

test("snoozes a watched entity out of the needs-action view", async () => {
  const app = await openDesktop();
  await app.press("id:watch-dock-toggle");
  await app.waitFor("id:watch-dock-panel");
  await app.press("id:watch-menu-trigger-email-thread-pricing-q4");
  await app.press("id:menu-watch-snooze");
  await app.waitFor("text:Snoozed for 4 hours.");
  await app.press("id:watch-filter-attention");
  expect(app.shows("id:watch-row-email-thread-pricing-q4")).toBe(false);
  await app.press("id:watch-filter-all");
  await app.press("id:watch-menu-trigger-email-thread-pricing-q4");
  await app.press("id:menu-watch-snooze");
  await app.waitFor("text:Watching again.");
});

test("watches a conversation from its header and unwatches it from the dock", async () => {
  const app = await openDesktop();
  await app.press("id:nav-inbox");
  await app.waitFor("id:conversation-sarah");
  await app.press("id:conversation-watch");
  await app.waitFor("text:Watching this conversation.");
  await app.press("id:watch-dock-toggle");
  await app.waitFor("id:watch-row-conversation-sarah");

  await app.press("id:watch-menu-trigger-conversation-sarah");
  await app.press("id:menu-watch-stop");
  await app.waitFor("text:Stopped watching.");
  expect(app.shows("id:watch-row-conversation-sarah")).toBe(false);
});

test("watches an email thread and opens it from the dock", async () => {
  const app = await openDesktop();
  await app.press("id:nav-inbox");
  await app.waitFor("id:conversation-sarah");
  await app.press("id:filter-email");
  await app.waitFor("id:mail-inbox-summit");
  await app.press("id:mail-inbox-summit");
  await app.waitFor("id:mail-page");
  await app.press("id:mail-detail-watch");
  await app.waitFor("text:Watching this email thread.");

  await app.press("id:nav-home");
  await app.press("id:watch-dock-toggle");
  await app.waitFor("id:watch-row-email-thread-inbox-summit");
  await app.press("id:watch-row-email-thread-inbox-summit");
  await app.waitFor("id:mail-page");
  expect(app.texts()).toContain("Catalogue and distributor terms");
});
test("drags the watch dock freely and persists the position", async () => {
  const app = await openDesktop();
  await app.waitFor("id:watch-dock");
  await app.drag("id:watch-dock-grip", { x: -420, y: -320 });
  await new Promise((resolve) => setTimeout(resolve, 60));
  const stored = JSON.parse(app.storage()["intellux.watch.position"] ?? "null");
  expect(stored).not.toBeNull();
  expect(stored.x).toBeLessThan(1100);
  expect(stored.y).toBeLessThan(700);
  expect(app.shows("id:watch-dock-panel")).toBe(false);
  await app.press("id:watch-dock-toggle");
  await app.waitFor("id:watch-dock-panel");
});

test("resets the watch dock position", async () => {
  const app = await openDesktop();
  await app.drag("id:watch-dock-grip", { x: -420, y: -320 });
  await new Promise((resolve) => setTimeout(resolve, 60));
  expect(app.storage()["intellux.watch.position"]).toBeDefined();
  await app.press("id:watch-dock-toggle");
  await app.waitFor("id:watch-dock-panel");
  await app.press("id:watch-position-reset");
  await new Promise((resolve) => setTimeout(resolve, 60));
  expect(app.storage()["intellux.watch.position"]).toBeUndefined();
  expect(app.shows("id:watch-dock-panel")).toBe(true);
});
