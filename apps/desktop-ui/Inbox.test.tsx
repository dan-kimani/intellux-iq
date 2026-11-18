import { expect, open, test } from "nsh/test";

function openDesktop() {
  return open("./App.tsx", {
    width: 1440,
    height: 900,
    platform: "linux",
    colorScheme: "dark",
  });
}

test("switches channels from the rail and shows unread counters", async () => {
  const app = await openDesktop();
  await app.waitFor("id:channel-rail");
  await app.waitFor("label:All channels, 7 unread, selected");
  await app.waitFor("label:WhatsApp, 6 unread");
  await app.waitFor("label:Gmail, 1 unread");
  expect(app.shows("id:channel-outlook")).toBe(true);
  expect(app.shows("id:channel-yahoo")).toBe(true);

  await app.press("id:filter-whatsapp");
  await app.waitFor("label:WhatsApp, 6 unread, selected");
  await app.waitFor("text:8 conversations");
  expect(app.shows("id:conversation-james")).toBe(false);

  await app.press("id:filter-email");
  await app.waitFor("text:2 messages · inbox");
  await app.press("id:filter-all");
  await app.waitFor("text:10 conversations");
});

test("explains how to connect another channel", async () => {
  const app = await openDesktop();
  await app.press("id:channel-connect");
  await app.waitFor("id:channel-connect-dialog");
  expect(app.texts()).toContain("Other IMAP/SMTP");
  await app.press("id:connect-provider-outlook");
  await app.waitFor(
    "text:Outlook connects through Microsoft OAuth. The cloud stores the refresh token and streams mail to every linked device.",
  );
  await app.press("id:dialog-close");
  expect(app.shows("id:channel-connect-dialog")).toBe(false);
});

test("filters the inbox", async () => {
  const app = await openDesktop();
  await app.press("label:Filter inbox");
  await app.waitFor("id:inbox-filter-popover");
  await app.press("id:apply-inbox-filter");
  await app.waitFor("text:10 conversations");
  expect(app.texts()).toContain("Org-wide · read access");
});

test("starts a new conversation from the new message form", async () => {
  const app = await openDesktop();
  await app.press("id:chrome-new-message");
  await app.waitFor("id:new-message-dialog");
  await app.type("id:new-message-body", "Hi Sarah — sharing the revised delivery schedule.");
  await app.press("id:send-new-message");
  await app.waitFor("text:Conversation opened with Sarah Wanjiku.");
  await app.waitFor("id:conversation-conversation-1");
  await app.waitFor("text:11");
});

test("acts on a linked opportunity from the conversation", async () => {
  const app = await openDesktop();
  await app.press("id:opportunity-switcher");
  await app.waitFor("id:menu-switch-OPP-2025-0131");
  await app.press("id:menu-switch-OPP-2025-0131");
  await app.press("id:opportunity-stage-menu");
  await app.waitFor("id:menu-stage-qualified");
  await app.press("id:menu-stage-qualified");
  await app.waitFor("text:Opportunity moved to Qualified.");
  await app.press("id:opportunity-create-quote");
  await app.waitFor("id:quote-builder-dialog");
  expect(app.value("id:quote-customer")).toBe("ABC Enterprises");
  expect(app.value("id:quote-opportunity")).toBe("Acme Kenya — accessory bundle");
  await app.press("id:dialog-close");
  await app.press("id:nav-inbox");
  await app.wait(350);
  await app.press("id:link-opportunity");
  await app.waitFor("id:link-opportunity-dialog");
  await app.waitFor("text:All opportunities linked");
});

test("edits an opportunity value from the conversation strip", async () => {
  const app = await openDesktop();
  await app.press("id:opportunity-more");
  await app.waitFor("id:menu-edit");
  await app.press("id:menu-edit");
  await app.waitFor("id:opportunity-edit-dialog");
  await app.press("id:opportunity-value");
  await app.keyboard.press("mod+a");
  await app.type("id:opportunity-value", "KES 275,000");
  await app.press("id:save-opportunity");
  await app.waitFor("text:Opportunity value updated.");
});

test("links a matching opportunity to a conversation", async () => {
  const app = await openDesktop();
  await app.press("id:conversation-david");
  await app.press("id:link-opportunity");
  await app.waitFor("id:link-opportunity-dialog");
  await app.press("id:link-opportunity-OPP-2025-0110");
  await app.waitFor("text:Nairobi Office — bulk order linked to this conversation.");
  await app.press("id:link-opportunity");
  await app.waitFor("id:link-opportunity-dialog");
  await app.waitFor("text:All opportunities linked");
});

test("attaches a document from the WhatsApp attachment menu", async () => {
  const app = await openDesktop();
  await app.press("label:Add attachment");
  await app.waitFor("id:wa-attachment-menu");
  await app.press("id:wa-attach-document");
  await app.waitFor("id:attachment-dialog");
  await app.press("id:confirm-attachment");
  await app.waitFor("text:Document attached");
});

test("works offline through the outbox", async () => {
  const app = await openDesktop();
  await app.press("id:sync-status");
  await app.waitFor("id:sync-dialog");
  await app.press("id:toggle-online");
  await app.waitFor("text:Offline mode");
  await app.press("id:dialog-close");
  await app.waitFor("text:Offline mode — reads, drafts, quotes, and the outbox stay local.");
  await app.press("id:sync-status");
  await app.press("id:toggle-online");
  await app.waitFor("text:Cloud synced");
  await app.press("id:dialog-close");
});

test("inserts a WhatsApp template and sends it", async () => {
  const app = await openDesktop();
  await app.press("label:Add attachment");
  await app.waitFor("id:wa-attachment-menu");
  await app.press("id:wa-attach-quick-replies");
  await app.waitFor("id:template-picker");
  await app.press("id:use-template-in-composer");
  await app.press("id:composer-send");
  await app.waitFor(
    "text:Hi Sarah, your order QT-2025-0045 is confirmed. Expected delivery: 22 Nov. Reply if you need to change anything.",
  );
});

test("reassigns a conversation and preserves manager override", async () => {
  const app = await openDesktop();
  await app.press("id:conversation-globalretail");
  await app.waitFor("text:Unassigned");
  await app.press("id:conversation-assignment");
  await app.waitFor("id:assignment-dialog");
  await app.press("id:assign-user-u-amina");
  await app.waitFor("text:Assigned to Amina Kimani");
  await app.waitFor("text:Manager override — owned by Amina Kimani.");
  await app.waitFor("id:choose-window-template");
});

test("requires an approved template when the window is closed", async () => {
  const app = await openDesktop();
  await app.press("id:conversation-globalretail");
  await app.waitFor("id:choose-window-template");
  await app.press("id:choose-window-template");
  await app.waitFor("id:template-picker");
  await app.type("id:template-search", "order");
  await app.press("text:order_update");
  await app.press("id:use-template-in-composer");
  await app.waitFor("text:APPROVED TEMPLATE");
  await app.press("id:composer-send");
  await app.waitFor("text:Template queued through cloud egress.");
});

test("adds a tag and an internal note", async () => {
  const app = await openDesktop();
  await app.press("id:conversation-tags");
  await app.waitFor("id:tag-dialog");
  await app.press("label:Add VIP tag");
  await app.waitFor("text:#VIP");
  await app.press("text:Done");
  await app.press("id:composer-note-mode");
  await app.type("id:composer-input", "Team: confirm the packaging artwork before noon.");
  await app.press("id:composer-send");
  await app.waitFor("text:INTERNAL NOTE · TEAM-VISIBLE");
  await app.waitFor("text:Team: confirm the packaging artwork before noon.");
});

test("opens an email from the inbox in the reader", async () => {
  const app = await openDesktop();
  await app.press("id:filter-email");
  await app.waitFor("id:mail-inbox-summit");
  await app.press("id:mail-inbox-summit");
  await app.waitFor("id:mail-page");
  await app.waitFor("text:Catalogue and distributor terms");
});

test("replies all with a saved draft and switches mail accounts", async () => {
  const app = await openDesktop();
  await app.press("id:filter-email");
  await app.press("label:Mail folder Sent");
  await app.waitFor("text:Revised quotation QT-2025-0045");
  await app.press("text:Revised quotation QT-2025-0045");
  await app.waitFor("id:mail-page");
  await app.press("id:mail-reply-all");
  await app.waitFor("id:mail-composer");
  expect(app.shows("id:mail-page")).toBe(true);
  expect(app.value("id:mail-to")).toContain("sarah@abc.co.ke");
  expect(app.value("id:mail-cc")).toContain("david@acmetrading.co.ke");
  await app.type("id:mail-body", "Adding the packaging team to the thread.");
  await app.press("text:Close");
  await app.press("id:mail-reply-all");
  await app.waitFor("id:mail-composer");
  expect(app.texts()).toContain("Adding the packaging team to the thread.");
  await app.press("text:Close");
  await app.press("id:mail-account-trigger");
  await app.press("id:mail-account-support");
  await app.waitFor("text:No sent mail for this account");
});

test("composes a new email with CC, BCC, subject, and attachment", async () => {
  const app = await openDesktop();
  await app.press("id:filter-email");
  await app.press("id:mail-compose");
  await app.waitFor("id:mail-composer");
  await app.type("id:mail-to", "grace@example.com");
  await app.type("id:mail-cc", "manager@acmetrading.co.ke");
  await app.type("id:mail-bcc", "audit@acmetrading.co.ke");
  await app.type("id:mail-subject", "Updated pricing for December");
  await app.type("id:mail-body", "Hi Grace, sharing the December pricing and the quote PDF.");
  await app.press("text:Attach from quote");
  await app.press("id:send-email");
  await app.waitFor("text:Email queued through cloud egress.");
  await app.waitFor("text:Updated pricing for December");
});

test("dismisses a derived signal with a reason", async () => {
  const app = await openDesktop();
  await app.press("id:details-insights");
  await app.waitFor("text:OPEN SIGNALS");
  await app.press("label:Dismiss signal");
  await app.waitFor("id:dismiss-reason");
  await app.type("id:dismiss-reason", "Reviewed with the customer and agreed a callback.");
  await app.press("id:confirm-dismiss");
  await app.waitFor("text:No open signals");
});

test("creates a follow-up reminder from a signal", async () => {
  const app = await openDesktop();
  await app.press("id:details-insights");
  await app.waitFor("text:OPEN SIGNALS");
  await app.press("label:Create follow-up");
  await app.waitFor("id:reminder-dialog");
  await app.press("id:save-reminder");
  await app.waitFor("text:Reminder: Tomorrow 09:00");
});

test("shows failed delivery and presence states", async () => {
  const app = await openDesktop();
  await app.press("id:conversation-david");
  await app.waitFor("text:Failed");
  expect(app.texts()).toContain("· Idle");
  await app.press("id:conversation-mary");
  await app.waitFor("text:typing…");
});

test("searches mail subjects, participants, and bodies", async () => {
  const app = await openDesktop();
  await app.press("id:filter-email");
  await app.press("label:Mail folder Archive");
  await app.type("id:global-search", "remittance");
  await app.waitFor("text:Payment confirmation");
  expect(app.texts()).not.toContain("Q3 supply agreement");
});

test("opens a mail folder and email account health", async () => {
  const app = await openDesktop();
  await app.press("id:filter-email");
  await app.waitFor("label:Mail folder Sent");
  await app.press("label:Mail folder Sent");
  await app.waitFor("text:Revised quotation QT-2025-0045");
  await app.press("text:Revised quotation QT-2025-0045");
  await app.waitFor("id:mail-page");
  await app.press("text:Reply");
  await app.waitFor("id:mail-composer");
  expect(app.shows("id:mail-page")).toBe(true);
  await app.type("id:mail-body", "Thanks — confirming the delivery window now.");
  await app.press("id:mail-reply-send");
  await app.waitFor("text:Reply sent through cloud egress.");
  expect(app.shows("id:mail-page")).toBe(true);
  await app.press("id:mail-account-trigger");
  await app.press("text:Account health");
  await app.waitFor("id:mail-account-dialog");
});
