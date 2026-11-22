import { expect, open, test } from "nsh/test";

function openDesktop() {
  return open("./App.tsx", {
    width: 1440,
    height: 900,
    platform: "linux",
    colorScheme: "dark",
  });
}

test("opens the home dashboard with tasks, pipeline, and quotations", async () => {
  const app = await openDesktop();
  await app.press("id:nav-home");
  await app.waitFor("id:screen-home");
  expect(app.texts()).toContain("My day");
  expect(app.texts()).toContain("Call Maya about the packaging artwork");
  expect(app.texts()).toContain("Sales performance overview");
  expect(app.texts()).toContain("Pipeline snapshot");
  expect(app.texts()).toContain("Deal mix by stage");
  expect(app.texts()).toContain("Enquiry");
  expect(app.texts()).toContain("Negotiation");
  expect(app.shows("id:pipeline-mix-plot")).toBe(true);
  expect(app.texts()).toContain("Key insights");
  expect(app.texts()).toContain("Upcoming work");
  expect(app.texts()).toContain("Team performance");
  expect(app.texts()).toContain("Total leads");
  expect(app.shows("id:home-kpi-revenue")).toBe(true);
  expect(app.shows("id:home-performance-plot")).toBe(true);
});

test("completes and creates follow-ups from home", async () => {
  const app = await openDesktop();
  await app.press("id:nav-home");
  await app.waitFor("id:home-my-day");
  await app.press("id:home-complete-task-1");
  await app.waitFor("id:task-outcome-dialog");
  await app.press("id:save-task-outcome");
  await app.waitFor("text:Task completed.");
  expect(app.shows("id:home-task-task-1")).toBe(false);
  await app.press("id:home-new-task");
  await app.waitFor("id:work-dialog");
  await app.type("id:work-title", "Review the renewal terms");
  await app.press("id:save-work-item");
  await app.waitFor("text:Task created.");
  expect(app.shows("id:home-task-task-1")).toBe(false);
  await app.press("id:nav-tasks");
  await app.waitFor("id:screen-tasks");
  expect(app.texts()).toContain("Review the renewal terms");
});

test("opens a task conversation and its opportunity", async () => {
  const app = await openDesktop();
  await app.press("id:nav-home");
  await app.waitFor("id:home-my-day");
  await app.press("id:home-task-task-2");
  await app.waitFor("id:opportunity-detail");
  expect(app.texts()).toContain("TechWorld Ltd");
});

test("previews a quote at risk from home", async () => {
  const app = await openDesktop();
  await app.press("id:nav-home");
  await app.waitFor("id:home-my-day");
  await app.press("id:home-insight-quotes");
  await app.waitFor("id:quote-pdf-dialog");
  expect(app.texts()).toContain("QUOTATION");
});

test("opens the full report from home", async () => {
  const app = await openDesktop();
  await app.press("id:nav-home");
  await app.waitFor("id:screen-home");
  await app.press("id:home-full-report");
  await app.waitFor("id:screen-analytics");
  await app.waitFor("text:Sales performance trend");
  expect(app.texts()).toContain("Sales performance trend");
});

test("opens destinations from the Home KPI cards", async () => {
  const app = await openDesktop();
  await app.press("id:nav-home");
  await app.press("id:home-kpi-leads");
  await app.waitFor("id:conversation-sarah");
  await app.press("id:nav-home");
  await app.waitFor("id:home-kpi-opportunities");
  await app.press("id:home-kpi-opportunities");
  await app.waitFor("id:screen-deals");
  await app.press("id:nav-home");
  await app.waitFor("id:home-kpi-missed");
  await app.press("id:home-kpi-missed");
  await app.waitFor("id:screen-recovery");
});
