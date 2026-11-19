import { expect, open, test } from "nsh/test";

function openDesktop() {
  return open("./App.tsx", {
    width: 1440,
    height: 900,
    platform: "linux",
    colorScheme: "dark",
  });
}

async function openMessageMenu(app: Awaited<ReturnType<typeof openDesktop>>, id: string) {
  await app.press(`id:message-actions-${id}`);
  await app.waitFor("id:message-action-menu");
}

test("replies to a message from its WhatsApp actions", async () => {
  const app = await openDesktop();
  await openMessageMenu(app, "sarah-m1");
  await app.press("id:message-action-reply");
  await app.waitFor("text:Reply started.");
  await app.waitFor("id:composer-cancel-reply");
  expect(app.texts()).toContain("Sarah Wanjiku");

  await app.type("id:composer-input", "Sharing the revised pricing now.");
  await app.keyboard.press("Enter");
  await app.waitFor("text:Message queued through cloud egress.");
});

test("deletes a message for the current user", async () => {
  const app = await openDesktop();
  await openMessageMenu(app, "sarah-m1");
  await app.press("id:message-action-delete-me");
  await app.waitFor("text:Message deleted for you.");
  expect(
    app.shows("text:Hi David, can you share the latest pricing for 50 units of the ProMax model?"),
  ).toBe(false);
});

test("pins, stars, and reacts to a message", async () => {
  const app = await openDesktop();
  await openMessageMenu(app, "sarah-m2");
  await app.press("id:message-action-star");
  await app.waitFor("text:Message starred.");
  await openMessageMenu(app, "sarah-m2");
  await app.press("id:message-action-pin");
  await app.waitFor("text:Message pinned.");
  await app.waitFor("id:pinned-message");

  await openMessageMenu(app, "sarah-m2");
  await app.press("id:message-react-like");
  await app.waitFor("text:Reacted 👍.");
  await app.waitFor("id:message-reaction-sarah-m2");
});

test("forwards a message to another WhatsApp conversation", async () => {
  const app = await openDesktop();
  await openMessageMenu(app, "sarah-m1");
  await app.press("id:message-action-forward");
  await app.waitFor("id:forward-dialog");
  await app.press("id:forward-target-david");
  await app.waitFor("text:Message forwarded to David Ochieng.");
  await app.press("id:conversation-david");
  await app.waitFor(
    "text:Hi David, can you share the latest pricing for 50 units of the ProMax model?",
  );
});

test("opens message info", async () => {
  const app = await openDesktop();
  await openMessageMenu(app, "sarah-m1");
  await app.press("id:message-action-info");
  await app.waitFor("id:message-info-dialog");
  expect(app.texts()).toContain("Message info");
  expect(app.texts()).toContain("sarah-m1");
});

test("deletes an outgoing message for everyone", async () => {
  const app = await openDesktop();
  await openMessageMenu(app, "sarah-m2");
  await app.press("id:message-action-delete-everyone");
  await app.waitFor("text:Message deleted for everyone.");
  await app.waitFor("text:This message was deleted");
  expect(app.shows("text:Sure! Here's the updated quotation with the volume discount.")).toBe(
    false,
  );
});

test("copies message text to the clipboard", async () => {
  const app = await openDesktop();
  await openMessageMenu(app, "sarah-m1");
  await app.press("id:message-action-copy");
  await app.waitFor("text:Message copied.");
  expect(app.clipboard()).toBe(
    "Hi David, can you share the latest pricing for 50 units of the ProMax model?",
  );
});

test("edits an outgoing WhatsApp message", async () => {
  const app = await openDesktop();
  await openMessageMenu(app, "sarah-m2");
  await app.press("id:message-action-edit");
  await app.waitFor("text:Editing message.");
  expect(app.value("id:composer-input")).toBe(
    "Sure! Here's the updated quotation with the volume discount.",
  );
  await app.clear("id:composer-input");
  await app.type("id:composer-input", "Updated quotation sent with the volume discount.");
  await app.keyboard.press("Enter");
  await app.waitFor("text:Message edited.");
  expect(app.shows("text:Updated quotation sent with the volume discount.")).toBe(true);
  expect(app.shows("text:Sure! Here's the updated quotation with the volume discount.")).toBe(
    false,
  );
});

test("opens the message actions with a right click", async () => {
  const app = await openDesktop();
  await app.rightClick("text:Sure! Here's the updated quotation with the volume discount.");
  await app.waitFor("id:message-action-menu");
  expect(app.menu()).toBeNull();
  expect(app.shows("id:message-action-edit")).toBe(true);
  expect(app.shows("id:message-action-delete-everyone")).toBe(true);
  await app.press("id:message-action-edit");
  await app.waitFor("text:Editing message.");
  await app.press("id:composer-cancel-edit");
  await app.rightClick(
    "text:Hi David, can you share the latest pricing for 50 units of the ProMax model?",
  );
  await app.waitFor("id:message-action-menu");
  expect(app.shows("id:message-action-edit")).toBe(false);
  expect(app.shows("id:message-action-delete-everyone")).toBe(false);
});
