import { expect, open, test } from "nsh/test";

function launch(width: number, height: number) {
  return open("./App.tsx", {
    width,
    height,
    platform: "linux",
    colorScheme: "dark",
  });
}

test("opens on Home instead of the inbox", async () => {
  const app = await launch(1440, 900);
  await app.waitFor("id:screen-home");
  expect(app.shows("id:screen-inbox")).toBe(false);
  expect(app.texts()).toContain("My day");
});

test("starts the inbox detail panel closed on a narrow window", async () => {
  const app = await launch(1180, 800);
  await app.press("id:nav-inbox");
  await app.waitFor("id:conversation-sarah");
  expect(app.shows("id:details-pane")).toBe(false);
  await app.press("id:details-toggle");
  await app.waitFor("id:details-pane");
});

test("keeps the inbox detail panel closed at laptop widths", async () => {
  const app = await launch(1366, 768);
  await app.press("id:nav-inbox");
  await app.waitFor("id:conversation-sarah");
  expect(app.shows("id:details-pane")).toBe(false);
});

test("starts the inbox detail panel open on a wide window", async () => {
  const app = await launch(1440, 900);
  await app.press("id:nav-inbox");
  await app.waitFor("id:conversation-sarah");
  await app.waitFor("id:details-pane");
});
