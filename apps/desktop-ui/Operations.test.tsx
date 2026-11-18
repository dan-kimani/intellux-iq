import { expect, open, test } from "nsh/test";

function openDesktop() {
  return open("./App.tsx", {
    width: 1440,
    height: 900,
    platform: "linux",
    colorScheme: "dark",
  });
}

test("opens automation and device-linking details", async () => {
  const app = await openDesktop();
  await app.press("id:nav-automations");
  await app.waitFor("text:RECENT RUNS");
  await app.press("text:View run log");
  await app.waitFor("text:Automation run log");
  await app.press("id:dialog-close");
  await app.press("id:nav-settings");
  await app.waitFor("text:Weekly outcome digest");
  await app.press("text:Devices");
  await app.waitFor("text:Link device");
  await app.press("text:Link device");
  await app.waitFor("text:DEVICE LINK STEPS");
});

test("opens command search and notifications", async () => {
  const app = await openDesktop();
  await app.press("id:open-command");
  await app.waitFor("id:command-palette");
  await app.waitFor("id:command-result-new-message");
  await app.type("id:command-search", "Sarah");
  await app.waitFor("id:command-result-contact-c1");
  await app.keyboard.press("enter");
  await app.waitFor("id:contact-page");
  await app.press("label:Back to contacts");
  await app.press("id:notifications-button");
  await app.waitFor("text:New deal won: 50 units");
  await app.press("id:notifications-close");
});

test("navigates the command palette with the keyboard", async () => {
  const app = await openDesktop();
  await app.keyboard.press("mod+k");
  await app.waitFor("id:command-palette");
  await app.waitFor("id:command-result-new-message");
  await app.keyboard.press("down");
  await app.keyboard.press("enter");
  await app.waitFor("id:new-deal-dialog");
  await app.press("id:dialog-close");
});

test("locks and unlocks the desktop", async () => {
  const app = await openDesktop();
  await app.press("id:account-menu");
  await app.waitFor("id:account-dialog");
  await app.press("label:Sign out");
  await app.waitFor("text:Desktop locked");
  await app.type("id:unlock-password", "prototype");
  await app.press("id:unlock-desktop");
  await app.waitFor("id:nav-inbox");
});

test("exports an analytics report", async () => {
  const app = await openDesktop();
  await app.press("id:nav-analytics");
  await app.waitFor("text:Sales performance trend");
  await app.press("text:Export");
  await app.waitFor("id:export-report-dialog");
  expect(app.texts()).toContain("Full outcome report");
  await app.press("id:generate-report");
});

test("explores interactive analytics charts", async () => {
  const app = await openDesktop();
  await app.press("id:nav-analytics");
  await app.waitFor("id:sales-trend-plot");
  await app.waitFor("id:lead-sources-plot");
  await app.waitFor("id:sparkline-total-conversations");
  await app.hover("id:sparkline-total-conversations");
  await app.waitUntil(() => !app.texts().includes("+12%"));
  await app.press("id:analytics-period-7d");
  await app.hover("id:sales-trend-plot");
  await app.waitFor("id:trend-tooltip");
  await app.waitFor("text:Nov 06");
  await app.press("id:lead-source-whatsapp");
  await app.waitFor("label:WhatsApp: 1,689 conversations, 52%");
  await app.press("id:lead-source-whatsapp");
  await app.waitFor("label:Total: 3,248 conversations");
  await app.press("id:trend-series-deals");
  await app.hover("id:sales-trend-plot");
  await app.waitFor("id:trend-tooltip");
  await app.waitFor("text:2,550");
  expect(app.texts()).not.toContain("880");
});

test("resolves a deterministic recovery signal", async () => {
  const app = await openDesktop();
  await app.press("id:nav-recovery");
  await app.waitFor("text:Inbound enquiry has no reply");
  await app.press("text:Inbound enquiry has no reply");
  await app.waitFor("text:EVIDENCE");
  await app.press("text:Create follow-up");
  await app.waitFor("text:5 signals");
});

test("logs a contact note and a deal task", async () => {
  const app = await openDesktop();
  await app.press("id:nav-contacts");
  await app.waitFor("text:Directory");
  await app.press("text:Sarah Wanjiku");
  await app.waitFor("id:contact-page");
  await app.press("text:Add note");
  await app.waitFor("id:activity-dialog");
  await app.type("id:activity-text", "Prefers delivery before noon.");
  await app.press("id:save-activity");
  await app.waitFor("text:Prefers delivery before noon.");
  await app.press("id:nav-deals");
  await app.waitFor("text:Enquiry");
  await app.press("id:deal-OPP-2025-0123");
  await app.waitFor("text:NEXT STEP");
  await app.press("text:Log");
  await app.waitFor("id:activity-dialog");
  await app.press("text:Follow-up task");
  await app.type("id:activity-text", "Confirm packaging artwork by Friday.");
  await app.press("id:save-activity");
  await app.waitFor("text:Confirm packaging artwork by Friday.");
});

test("opens the product tour and security policy", async () => {
  const app = await openDesktop();
  await app.press("id:account-menu");
  await app.waitFor("id:account-dialog");
  await app.press("text:Product tour");
  await app.waitFor("id:onboarding-dialog");
  await app.press("id:onboarding-next");
  await app.press("id:onboarding-next");
  await app.press("id:onboarding-next");
  await app.waitFor("text:Security stays local");
  await app.press("id:onboarding-next");
  await app.press("id:nav-settings");
  await app.waitFor("text:Weekly outcome digest");
  await app.press("text:Security");
  await app.waitFor("text:SECURITY & SESSIONS");
});

test("renders the minimum supported window", async () => {
  const app = await open("./App.tsx", {
    width: 1180,
    height: 760,
    platform: "linux",
    colorScheme: "dark",
  });
  await app.waitFor("text:Sarah Wanjiku");
  expect(app.texts()).toContain("End of recent conversations");
  await app.press("id:nav-recovery");
  await app.waitFor("text:Intervention queue");
});
