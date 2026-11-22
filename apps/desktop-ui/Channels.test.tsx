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

test("switches channels from the rail and shows unread counters", async () => {
  const app = await openDesktop();
  await app.waitFor("id:channel-rail");
  await app.waitFor("label:All channels, 7 unread, selected");
  await app.waitFor("label:WhatsApp, 6 unread");
  await app.waitFor("label:Gmail, 2 unread");
  expect(app.shows("id:channel-messenger")).toBe(true);
  expect(app.shows("id:channel-instagram")).toBe(true);
  expect(app.shows("id:channel-tiktok")).toBe(true);
  expect(app.shows("id:channel-outlook")).toBe(true);
  expect(app.shows("id:channel-yahoo")).toBe(true);

  await app.press("id:filter-whatsapp");
  await app.waitFor("label:WhatsApp, 6 unread, selected");
  await app.waitFor("text:8 conversations");
  expect(app.shows("id:conversation-james")).toBe(false);

  await app.press("id:filter-email");
  await app.waitFor("text:3 messages · inbox");
  await app.press("id:filter-all");
  await app.waitFor("text:10 conversations");
});

test("explains how to connect another channel", async () => {
  const app = await openDesktop();
  await app.press("id:channel-connect");
  await app.waitFor("id:channel-connect-dialog");
  expect(app.texts()).toContain("Other IMAP/SMTP");
  expect(app.texts()).toContain("Facebook Messenger");
  expect(app.texts()).toContain("Instagram");
  expect(app.texts()).toContain("TikTok");
  await app.press("id:connect-provider-outlook");
  await app.waitFor(
    "text:Outlook connects through Microsoft OAuth. The cloud stores the refresh token and streams mail to every linked device.",
  );
  await app.press("id:dialog-close");
  expect(app.shows("id:channel-connect-dialog")).toBe(false);
});

test("reorders channel icons by drag and drop", async () => {
  const app = await openDesktop();
  await app.drag("id:filter-email", { x: 0, y: -92 });
  await app.waitFor("id:filter-email");
  expect(
    app.shows(
      "label:Channel order: WhatsApp, Facebook Messenger, Gmail, Instagram, TikTok, Outlook, Yahoo",
    ),
  ).toBe(true);
});

test("shows channel drag feedback while reordering", async () => {
  const app = await openDesktop();
  await app.dragAndHold("id:filter-email", { x: 0, y: -92 });
  await app.waitFor("id:channel-drag-preview");
  await app.waitFor("id:channel-drop-indicator");
  await app.drop();
});
