import { expect, open, test } from "nsh/test";

function openDesktop() {
  return open("./App.tsx", {
    width: 1440,
    height: 900,
    platform: "linux",
    colorScheme: "dark",
  });
}

test("selects a conversation and updates the work area", async () => {
  const app = await openDesktop();
  expect(app.texts()).toContain("Sarah Wanjiku");
  await app.press("id:conversation-david");
  await app.waitFor("text:Ochieng & Sons");
  expect(app.texts()).toContain("Kisumu, Kenya");
  expect(app.texts()).toContain("Negotiation");
});

test("filters the inbox by channel", async () => {
  const app = await openDesktop();
  await app.press("id:filter-email");
  await app.waitFor("text:2 messages · inbox");
  expect(app.shows("id:mail-inbox-james")).toBe(true);
  expect(app.shows("id:conversation-sarah")).toBe(false);
});

test("searches contacts and messages", async () => {
  const app = await openDesktop();
  await app.type("id:global-search", "GreenMart");
  await app.waitFor("text:1 conversations");
  expect(app.shows("id:conversation-greenmart")).toBe(true);
  expect(app.shows("id:conversation-sarah")).toBe(false);
});

test("searches inside message bodies", async () => {
  const app = await openDesktop();
  await app.type("id:global-search", "warehouse");
  await app.waitFor("text:1 conversations");
  expect(app.shows("id:conversation-globalretail")).toBe(true);
  expect(app.shows("id:conversation-sarah")).toBe(false);
});

test("filters to my conversations", async () => {
  const app = await openDesktop();
  await app.press("id:inbox-filter-trigger");
  await app.waitFor("id:inbox-filter-popover");
  await app.press("label:My conversations");
  await app.press("id:apply-inbox-filter");
  await app.waitFor("text:6 conversations");
  expect(app.shows("id:conversation-globalretail")).toBe(false);
});

test("clears a search with no matches", async () => {
  const app = await openDesktop();
  await app.type("id:global-search", "no-such-customer");
  await app.waitFor("text:No conversations match");
  expect(app.texts()).toContain("0 of 10");
  await app.press("id:clear-filters");
  await app.waitFor("text:10 conversations");
});

test("switches the contact panel to intelligence", async () => {
  const app = await openDesktop();
  await app.press("id:details-insights");
  await app.waitFor("text:Conversation metrics");
  expect(app.texts()).toContain("OPEN SIGNALS");
});

test("keeps drafts per conversation and sends with mod+enter", async () => {
  const app = await openDesktop();
  await app.press("id:conversation-david");
  await app.type("id:composer-input", "Draft for David");
  await app.press("id:conversation-sarah");
  await app.press("id:conversation-david");
  expect(app.value("id:composer-input")).toBe("Draft for David");
  await app.keyboard.press("mod+Enter");
  await app.waitFor("text:Message queued through cloud egress.");
});

test("sends a message through the cloud egress path", async () => {
  const app = await openDesktop();
  await app.type("id:composer-input", "Sending the revised delivery schedule now.");
  await app.press("id:composer-send");
  await app.waitFor("text:Sending the revised delivery schedule now.");
  expect(app.texts()).toContain("Message queued through cloud egress.");
});

test("navigates the workspace screens", async () => {
  const app = await openDesktop();
  await app.press("id:nav-recovery");
  await app.waitFor("text:Intervention queue");
  await app.waitFor("text:RECOVERY PLAYBOOK");

  await app.press("id:nav-contacts");
  await app.waitFor("text:Directory");
  expect(app.texts()).toContain("248");

  await app.press("id:nav-deals");
  await app.waitFor("text:Open pipeline");
  expect(app.texts()).toContain("Open pipeline");

  await app.press("id:nav-quotes");
  await app.waitFor("id:quote-mini-list");
  expect(app.texts()).toContain("Prepared for");

  await app.press("id:nav-catalog");
  await app.waitFor("text:Low stock");
  expect(app.texts()).toContain("Low stock");

  await app.press("id:nav-analytics");
  await app.waitFor("text:Sales performance trend");

  await app.press("id:nav-automations");
  await app.waitFor("text:RECENT RUNS");
  expect(app.texts()).toContain("Unanswered lead recovery");

  await app.press("id:nav-settings");
  await app.waitFor("text:Weekly outcome digest");
});

test("toggles an automation rule", async () => {
  const app = await openDesktop();
  await app.press("id:nav-automations");
  await app.waitFor("text:Unanswered lead recovery");
  await app.press("id:automation-toggle-0");
  await app.waitFor("text:Paused");
});

test("collapses and expands the sidebar", async () => {
  const app = await openDesktop();
  expect(app.texts()).toContain("CUSTOMERS");
  await app.press("id:sidebar-toggle");
  await app.waitFor("id:insights-compact");
  expect(app.texts()).not.toContain("CUSTOMERS");
  await app.press("id:sidebar-toggle");
  await app.waitFor("text:CUSTOMERS");
});

test("opens collapsed navigation flyouts on hover", async () => {
  const app = await openDesktop();
  await app.press("id:sidebar-toggle");
  await app.waitFor("id:insights-compact");
  await app.hover("id:collapsed-nav-sales");
  await app.waitFor("id:collapsed-flyout-sales");
  await app.press("id:collapsed-item-quotes");
  await app.waitFor("id:quote-mini-list");
});

test("toggles the sidebar with the default keyboard shortcut", async () => {
  const app = await openDesktop();
  await app.waitFor("text:CUSTOMERS");
  await app.keyboard.press("mod+b");
  expect(app.texts()).not.toContain("CUSTOMERS");
  await app.keyboard.press("mod+b");
  await app.waitFor("text:CUSTOMERS");
});

test("records, applies, and resets a keyboard shortcut", async () => {
  const app = await openDesktop();
  await app.press("id:nav-settings");
  await app.waitFor("id:tab-settings-shortcuts");
  await app.press("id:tab-settings-shortcuts");
  await app.waitFor("id:shortcuts-panel");
  await app.press("id:shortcut-binding-sidebar");
  await app.waitFor("id:shortcut-recorder-sidebar");
  await app.wait(40);
  await app.keyboard.press("mod+k");
  await app.waitFor("text:Ctrl+K is already used by Command search.");
  await app.keyboard.press("escape");
  await app.waitFor("id:shortcut-binding-sidebar");
  await app.press("id:shortcut-binding-sidebar");
  await app.waitFor("id:shortcut-recorder-sidebar");
  await app.wait(40);
  await app.keyboard.press("mod+shift+b");
  await app.waitFor("text:Ctrl+Shift+B");
  expect(app.texts()).toContain("CUSTOMERS");
  await app.keyboard.press("mod+shift+b");
  expect(app.texts()).not.toContain("CUSTOMERS");
  await app.press("id:shortcut-reset-sidebar");
  await app.waitFor("text:Ctrl+B");
  await app.keyboard.press("mod+b");
  await app.waitFor("text:CUSTOMERS");
});

test("opens app surfaces with keyboard shortcuts", async () => {
  const app = await openDesktop();
  await app.keyboard.press("mod+k");
  await app.waitFor("id:command-palette");
  await app.keyboard.press("escape");
  await app.wait(200);
  await app.keyboard.press("mod+n");
  await app.waitFor("id:new-message-dialog");
  await app.press("id:dialog-close");
  await app.keyboard.press("mod+alt+s");
  await app.waitFor("id:screen-settings");
  await app.keyboard.press("mod+alt+q");
  await app.waitFor("id:quote-builder-dialog");
});

test("collapses navigation groups and opens tabbed actions", async () => {
  const app = await openDesktop();
  await app.waitFor("text:Quotes & Proposals");
  await app.press("label:Toggle Sales navigation");
  expect(app.texts()).not.toContain("Quotes & Proposals");
  await app.press("label:Toggle Sales navigation");
  await app.waitFor("text:Quotes & Proposals");
  await app.press("id:nav-quotes");
  await app.waitFor("id:tab-quotes-pending");
  await app.press("id:tab-quotes-pending");
  await app.waitFor("text:Manager approval required");
  await app.press("id:nav-segments");
  await app.waitFor("id:screen-segments");
});

test("edits a segment on its dedicated page", async () => {
  const app = await openDesktop();
  await app.press("id:nav-segments");
  await app.waitFor("id:screen-segments");
  await app.waitFor("text:High intent");
  await app.press("id:add-segment-rule");
  await app.waitFor("text:Channel");
  await app.press("id:save-segment");
  await app.waitFor("text:Segment saved locally.");
});

test("filters catalogue stock and opens the audit log", async () => {
  const app = await openDesktop();
  await app.press("id:nav-catalog");
  await app.waitFor("id:tab-catalog-low");
  await app.press("id:tab-catalog-low");
  await app.waitFor("text:Travel case");
  expect(app.texts()).not.toContain("ProMax headset");
  await app.press("id:nav-automations-runs");
  await app.waitFor("id:run-log-dialog");
});

test("uses the desktop window chrome and controls", async () => {
  const app = await openDesktop();
  await app.press("id:chrome-new-quote");
  await app.waitFor("id:quote-builder-dialog");
  await app.press("id:dialog-close");
  await app.waitFor("id:window-minimize");
  await app.waitFor("id:window-maximize");
  await app.waitFor("id:window-close");
});

test("shows overflow actions as dropdown menus", async () => {
  const app = await openDesktop();
  await app.press("id:chrome-more");
  await app.waitFor("text:Command search");
  await app.waitFor("text:Workspace settings");
  await app.press("id:menu-new-contact");
  await app.waitFor("id:new-contact-dialog");
  await app.press("id:dialog-close");
  await app.press("id:nav-inbox");
  await app.waitFor("id:conversation-more");
  await app.press("id:conversation-more");
  await app.waitFor("text:Mark as unread");
  await app.press("id:menu-unread");
  await app.waitFor("text:Conversation marked unread.");
});

test("opens conversation row actions from a secondary click", async () => {
  const app = await openDesktop();
  await app.waitFor("id:conversation-david");
  await app.rightClick("id:conversation-david");
  await app.waitFor("text:Mark as unread");
  await app.press("id:context-unread");
  await app.waitFor("text:Conversation marked unread.");
});

test("opens quote templates from an anchored menu", async () => {
  const app = await openDesktop();
  await app.press("id:nav-quotes");
  await app.waitFor("id:quote-templates");
  await app.press("id:quote-templates");
  await app.waitFor("text:Enterprise");
  await app.press("id:menu-classic");
  await app.waitFor("id:quote-builder-dialog");
  await app.press("id:dialog-close");
});
