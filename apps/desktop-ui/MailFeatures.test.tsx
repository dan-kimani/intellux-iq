import { expect, open, test } from "nsh/test";

async function openMail() {
  const app = await open("./App.tsx", {
    width: 1440,
    height: 900,
    platform: "linux",
    colorScheme: "dark",
  });
  await app.press("id:nav-inbox");
  await app.waitFor("id:conversation-sarah");
  await app.press("id:filter-email");
  await app.waitFor("id:mail-folder-rail");
  await app.waitFor("id:mail-inbox-james");
  return app;
}

test("shows sender names, threaded mail, and the Priority folder", async () => {
  const app = await openMail();
  expect(app.texts().some((text) => text.includes("James Carter"))).toBe(true);
  expect(app.shows("id:mail-thread-inbox-james")).toBe(true);
  await app.press("label:Mail folder Priority");
  await app.waitFor("id:mail-inbox-summit");
  expect(app.shows("id:mail-inbox-james")).toBe(false);
  await app.press("label:Mail folder Inbox");
  await app.press("id:mail-inbox-summit");
  await app.waitFor("id:mail-page");
  await app.press("id:mail-detail-star");
  await app.press("label:Mail folder Priority");
  expect(app.shows("id:mail-inbox-summit")).toBe(false);
});

test("opens a thread and exposes earlier messages", async () => {
  const app = await openMail();
  await app.press("id:mail-inbox-james");
  await app.waitFor("id:mail-page");
  expect(app.texts()).toContain("2 messages · James Carter, You");
  expect(app.shows("id:mail-thread-message-inbox-james")).toBe(true);
  expect(app.shows("id:mail-thread-message-inbox-james-reply")).toBe(true);
  await app.press("id:mail-thread-message-inbox-james");
  await app.waitFor(
    "text:Thanks for the revised quote. Finance is reviewing it now and I should have a decision by Thursday.",
  );
});

test("sorts mail and exposes row actions on hover", async () => {
  const app = await openMail();
  await app.hover("id:mail-inbox-james");
  await app.waitFor("id:mail-star-inbox-james");
  await app.press("id:mail-sort-trigger");
  await app.waitFor("id:mail-sort-popover");
  await app.press("label:Sort by Oldest");
  await app.waitFor("text:Oldest");
});

test("searches within the current mail folder", async () => {
  const app = await openMail();
  await app.type("id:mail-search", "catalogue");
  await app.waitFor("id:mail-inbox-summit");
  expect(app.shows("id:mail-inbox-james")).toBe(false);
});

test("bulk archives a selected thread", async () => {
  const app = await openMail();
  await app.press("id:mail-select-inbox-james");
  await app.waitFor("id:mail-bulk-bar");
  expect(app.texts()).toContain("2 selected");
  await app.press("id:mail-bulk-archive");
  await app.waitFor("text:2 messages moved to Archive.");
  expect(app.shows("id:mail-inbox-james")).toBe(false);
});

test("filters mail with attachments and toggles the reading pane", async () => {
  const app = await openMail();
  await app.press("id:mail-filter-trigger");
  await app.waitFor("id:mail-filter-popover");
  await app.press("label:Has attachment");
  await app.press("id:apply-mail-filter");
  await app.waitFor("id:mail-inbox-summit");
  expect(app.shows("id:mail-inbox-james")).toBe(false);

  await app.press("id:mail-inbox-summit");
  await app.waitFor("id:mail-page");
  await app.press("id:mail-reading-toggle");
  expect(app.shows("id:mail-page")).toBe(false);
  await app.press("id:mail-reading-toggle");
  await app.waitFor("id:mail-page");
});

test("refreshes the mailbox and opens the outbox", async () => {
  const app = await openMail();
  await app.press("id:mail-refresh");
  await app.waitFor("text:Mailbox refreshed.");
  await app.press("id:mail-outbox");
  await app.waitFor("id:sync-dialog");
});

test("confirms before deleting mail and can be cancelled", async () => {
  const app = await openMail();
  await app.press("id:mail-select-inbox-james");
  await app.waitFor("id:mail-bulk-bar");
  await app.press("id:mail-bulk-delete");
  await app.waitFor("id:confirm-dialog");
  await app.press("id:confirm-dialog-cancel");
  expect(app.shows("id:mail-inbox-james")).toBe(true);
  await app.press("id:mail-bulk-delete");
  await app.waitFor("id:confirm-dialog");
  await app.press("id:confirm-dialog-delete");
  await app.waitFor("text:2 messages deleted.");
  expect(app.shows("id:mail-inbox-james")).toBe(false);
});

test("offers Move to Inbox for already archived mail", async () => {
  const app = await openMail();
  await app.press("label:Mail folder Archive");
  await app.waitFor("id:mail-m6");
  await app.hover("id:mail-m6");
  await app.waitFor("id:mail-archive-m6");
  expect(app.shows("label:Move to Inbox")).toBe(true);
  await app.press("id:mail-archive-m6");
  await app.waitFor("text:1 message moved to Inbox.");
  await app.press("label:Mail folder Inbox");
  await app.waitFor("id:mail-m6");
});
