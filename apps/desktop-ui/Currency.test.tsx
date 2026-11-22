import { expect, open, test } from "nsh/test";

function openDesktop() {
  return open("./App.tsx", {
    width: 1440,
    height: 900,
    platform: "linux",
    colorScheme: "dark",
  });
}

test("changes the workspace currency across the pipeline", async () => {
  const app = await openDesktop();
  await app.press("id:nav-settings");
  await app.waitFor("id:workspace-edit");
  await app.press("id:workspace-edit");
  await app.press("id:currency-select-eur");
  await app.press("id:save-workspace-settings");
  await app.waitFor("text:Workspace settings saved.");
  await app.press("id:nav-deals");
  await app.waitFor("id:screen-deals");
  expect(app.texts().some((text) => text.startsWith("€"))).toBe(true);

  await app.press("id:nav-settings");
  await app.waitFor("id:workspace-edit");
  await app.press("id:workspace-edit");
  await app.press("id:currency-select-usd");
  await app.press("id:save-workspace-settings");
  await app.waitFor("text:Workspace settings saved.");
  await app.press("id:nav-deals");
  await app.waitFor("id:screen-deals");
  expect(app.texts().some((text) => text.startsWith("$"))).toBe(true);
});
