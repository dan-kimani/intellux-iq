import { expect, open, test } from "nsh/test";

function openDesktop() {
  return open("./App.tsx", {
    width: 1440,
    height: 900,
    platform: "linux",
    colorScheme: "dark",
  });
}

test("uses the desktop window chrome and controls", async () => {
  const app = await openDesktop();
  await app.press("id:chrome-new-quote");
  await app.waitFor("id:quote-builder-dialog");
  await app.press("id:dialog-close");
  await app.waitFor("id:window-minimize");
  await app.waitFor("id:window-maximize");
  await app.waitFor("id:window-close");
});

test("toggles maximize and restores the window", async () => {
  const app = await openDesktop();
  await app.waitFor("id:window-maximize");
  expect(app.window("main").state()?.mode).toBe("normal");
  expect(app.texts()).toContain("□");

  await app.press("id:window-maximize");
  await app.waitFor("text:⧉");
  expect(app.shows("label:Restore window")).toBe(true);
  expect(app.window("main").state()?.mode).toBe("maximized");

  await app.press("id:window-maximize");
  await app.waitFor("text:□");
  expect(app.shows("label:Maximize window")).toBe(true);
  expect(app.window("main").state()?.mode).toBe("normal");
});

test("keeps the app frame through a mode change", async () => {
  const app = await openDesktop();
  await app.waitFor("id:app-frame");
  await app.press("id:window-maximize");
  await app.waitFor("id:app-frame");
  expect(app.shows("id:app-frame")).toBe(true);
  expect(app.window("main").state()?.mode).toBe("maximized");
});

test("provides resize edges and corners", async () => {
  const app = await openDesktop();
  for (const edge of ["top", "bottom", "left", "right"]) {
    await app.waitFor(`id:window-resize-${edge}`);
  }
  for (const corner of ["top-left", "top-right", "bottom-left", "bottom-right"]) {
    await app.waitFor(`id:window-resize-${corner}`);
  }
});
