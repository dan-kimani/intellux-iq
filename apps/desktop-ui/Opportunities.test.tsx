import { expect, open, test } from "nsh/test";

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

test("opens the opportunity list and one opportunity from the chat header", async () => {
  const app = await openDesktop();
  await app.press("id:chat-opportunities");
  await app.waitFor("id:opportunities-panel");
  expect(app.texts()).toContain("Acme Inc. — Q4 packaging");
  expect(app.texts()).toContain("Acme Inc. — accessory bundle");
  await app.press("id:opportunity-row-OPP-2025-0123");
  await app.waitFor("id:opportunity-detail");
  expect(app.texts()).toContain("Acme Inc. · OPP-2025-0123");
  expect(app.texts()).toContain("Stage history");
  expect(app.texts()).toContain("Source message");
  await app.press("id:opportunity-back");
  await app.waitFor("id:opportunities-panel");
});

test("creates a second opportunity for the same conversation", async () => {
  const app = await openDesktop();
  await app.press("id:chat-opportunities");
  await app.waitFor("id:opportunities-panel");
  await app.press("id:opportunity-new");
  await app.waitFor("id:new-opportunity-dialog");
  await app.type("id:new-opportunity-name", "Maya — extended warranty");
  await app.type("id:new-opportunity-product", "12 months · ProMax cover");
  await app.press("id:create-opportunity");
  await app.waitFor("id:opportunity-detail");
  expect(app.texts()).toContain("Maya — extended warranty");
  expect(app.texts()).toContain("12 months · ProMax cover");
  await app.press("id:opportunity-back");
  await app.waitFor("id:opportunities-panel");
  expect(app.texts()).toContain("3 opportunities");
});

test("creates an opportunity from a message and keeps the source", async () => {
  const app = await openDesktop();
  await app.press("id:message-actions-sarah-m1");
  await app.waitFor("id:message-action-menu");
  await app.press("id:message-action-opportunity");
  await app.waitFor("id:new-opportunity-dialog");
  await app.type("id:new-opportunity-name", "Maya — ProMax restock");
  await app.press("id:create-opportunity");
  await app.waitFor("id:opportunity-detail");
  await app.waitFor("id:opportunity-source-open");
  expect(app.texts()).toContain("Source message");
  expect(app.texts()).toContain(
    "Hi Alex, can you share the latest pricing for 50 units of the ProMax model?",
  );
});

test("requires a lost reason and records the stage history", async () => {
  const app = await openDesktop();
  await app.press("id:chat-opportunities");
  await app.waitFor("id:opportunities-panel");
  await app.press("id:opportunity-row-OPP-2025-0131");
  await app.waitFor("id:opportunity-detail");
  await app.press("id:opportunity-stage-menu");
  await app.waitFor("id:menu-stage-lost");
  await app.press("id:menu-stage-lost");
  await app.waitFor("id:lost-opportunity-dialog");
  await app.press("id:confirm-lost");
  await app.waitFor("text:Add a short reason before closing as lost.");
  await app.type("id:lost-reason", "Budget moved to next quarter");
  await app.press("id:confirm-lost");
  await app.waitFor("text:Opportunity moved to Lost.");
  expect(app.texts()).toContain("Enquiry → Lost");
  expect(app.texts()).toContain("Budget moved to next quarter");
});

test("switches conversation views and preserves the composer draft", async () => {
  const app = await openDesktop();
  await app.type("id:composer-input", "Holding this draft");
  await app.press("id:thread-tab-files");
  await app.waitFor("id:conversation-files");
  expect(app.texts()).toContain("Quotation_QT-2025-0045.pdf");
  await app.wait(220);
  expect(app.shows("id:composer-input")).toBe(false);
  await app.press("id:thread-tab-starred");
  await app.waitFor("id:conversation-starred");
  expect(app.texts()).toContain("No starred messages");
  await app.press("id:thread-tab-quotes");
  await app.waitFor("id:conversation-quotes");
  expect(app.texts()).toContain("QT-2025-0045");
  await app.press("id:thread-tab-conversation");
  await app.waitFor("id:composer-input");
  expect(app.value("id:composer-input")).toBe("Holding this draft");
});

test("shows starred messages in their conversation view", async () => {
  const app = await openDesktop();
  await app.press("id:message-actions-sarah-m2");
  await app.waitFor("id:message-action-menu");
  await app.press("id:message-action-star");
  await app.waitFor("text:Message starred.");
  await app.press("id:thread-tab-starred");
  await app.waitFor("id:conversation-starred");
  expect(app.texts()).toContain("Sure! Here's the updated quotation with the volume discount.");
});

test("shows opportunities linked to another conversation as Other chat", async () => {
  const app = await openDesktop();
  await app.press("id:conversation-david");
  await app.press("id:chat-opportunities");
  await app.waitFor("id:opportunities-panel");
  await app.press("id:opportunity-scope-contact");
  await app.waitFor("id:opportunity-row-OPP-2025-0110");
  expect(app.texts()).toContain("New York Office — bulk order");
  expect(app.texts()).toContain("Other chat");
});

test("only offers valid stage transitions from the detail", async () => {
  const app = await openDesktop();
  await app.press("id:chat-opportunities");
  await app.waitFor("id:opportunities-panel");
  await app.press("id:opportunity-row-OPP-2025-0131");
  await app.waitFor("id:opportunity-detail");
  await app.press("id:opportunity-stage-menu");
  await app.waitFor("id:menu-stage-qualified");
  expect(app.shows("id:menu-stage-qualified")).toBe(true);
  expect(app.shows("id:menu-stage-lost")).toBe(true);
  expect(app.shows("id:menu-stage-quotation")).toBe(false);
});

test("opens the linked product page from the opportunity", async () => {
  const app = await openDesktop();
  await app.press("id:chat-opportunities");
  await app.waitFor("id:opportunities-panel");
  await app.press("id:opportunity-row-OPP-2025-0123");
  await app.waitFor("id:opportunity-detail");
  await app.press("id:opportunity-product");
  await app.waitFor("id:product-dialog");
  expect(app.texts()).toContain("ProMax headset");
  await app.press("id:dialog-close");
});

test("previews a quote PDF and jumps to the source message", async () => {
  const app = await openDesktop();
  await app.press("id:chat-opportunities");
  await app.waitFor("id:opportunities-panel");
  await app.press("id:opportunity-row-OPP-2025-0123");
  await app.waitFor("id:opportunity-detail");
  await app.press("id:open-quote-QT-2025-0045");
  await app.waitFor("id:quote-pdf-dialog");
  expect(app.texts()).toContain("QUOTATION");
  await app.press("id:dialog-close");
  await app.press("id:opportunity-source-open");
  await app.waitFor("id:conversation-thread");
  expect(app.texts()).toContain(
    "Hi Alex, can you share the latest pricing for 50 units of the ProMax model?",
  );
});

test("creates a quote from the opportunity without leaving the conversation", async () => {
  const app = await openDesktop();
  await app.press("id:chat-opportunities");
  await app.waitFor("id:opportunities-panel");
  await app.press("id:opportunity-row-OPP-2025-0131");
  await app.waitFor("id:opportunity-detail");
  await app.press("id:opportunity-create-quote");
  await app.waitFor("id:quote-builder-dialog");
  await app.press("id:create-quote");
  await app.waitFor("text:New quote version");
  expect(app.shows("id:conversation-thread")).toBe(true);
});

test("never detaches the last conversation from an opportunity", async () => {
  const app = await openDesktop();
  await app.press("id:chat-opportunities");
  await app.waitFor("id:opportunities-panel");
  await app.press("id:opportunity-row-OPP-2025-0123");
  await app.waitFor("id:opportunity-detail");
  expect(app.shows("id:unlink-opportunity-sarah")).toBe(false);
});

test("schedules a follow-up tied to the opportunity", async () => {
  const app = await openDesktop();
  await app.press("id:chat-opportunities");
  await app.waitFor("id:opportunities-panel");
  await app.press("id:opportunity-row-OPP-2025-0131");
  await app.waitFor("id:opportunity-detail");
  await app.press("id:opportunity-more");
  await app.waitFor("id:menu-work-task");
  await app.press("id:menu-work-task");
  await app.waitFor("id:work-dialog");
  await app.type("id:work-title", "Confirm accessory quantities");
  await app.press("id:save-work-item");
  await app.waitFor("text:Task created.");
});
