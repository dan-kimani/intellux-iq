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

test("formats WhatsApp text with markup", async () => {
  const app = await openDesktop();
  await app.type("id:composer-input", "Thank you");
  await app.press("id:wa-format-menu");
  await app.waitFor("id:wa-format-menu-panel");
  await app.press("id:wa-format-bold");
  expect(app.value("id:composer-input")).toBe("Thank you**");
  await app.press("id:wa-format-menu");
  await app.press("id:wa-format-bullet");
  expect(app.value("id:composer-input")).toBe("- Thank you**");
});

test("opens the WhatsApp emoji picker", async () => {
  const app = await openDesktop();
  await app.press("id:wa-format-emoji");
  await app.waitFor("id:wa-emoji-picker");
});

test("composes a rich email with formatting", async () => {
  const app = await openDesktop();
  await app.press("id:filter-email");
  await app.press("id:mail-compose");
  await app.waitFor("id:mail-composer");
  await app.press("id:mail-format-bold");
  await app.type("id:mail-body", "Formatted email body");
  await app.type("id:mail-to", "grace@example.com");
  await app.type("id:mail-subject", "Rich formatting");
  await app.press("id:mail-format-link");
  await app.waitFor("id:mail-link-url");
  await app.type("id:mail-link-url", "example.com");
  await app.press("id:mail-apply-link");
  await app.press("id:send-email");
  await app.waitFor("text:Email queued through cloud egress.");
  await app.waitFor("text:Formatted email body");
});
