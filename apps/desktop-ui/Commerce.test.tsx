import { expect, open, test } from "nsh/test";

function openDesktop() {
  return open("./App.tsx", {
    width: 1440,
    height: 900,
    platform: "linux",
    colorScheme: "dark",
  });
}

test("opens a contact record and creates a contact", async () => {
  const app = await openDesktop();
  await app.press("id:nav-contacts");
  await app.waitFor("text:Directory");
  await app.press("text:Sarah Wanjiku");
  await app.waitFor("id:contact-page");
  await app.press("label:Back to contacts");
  await app.press("text:New contact");
  await app.waitFor("text:One directory, many contexts");
  await app.type("id:contact-name", "Faith Njeri");
  await app.type("id:contact-company", "Mwangaza Retail");
  await app.press("id:create-contact");
  await app.waitFor("text:9 of 248");
});

test("raises a quote from a contact page", async () => {
  const app = await openDesktop();
  await app.press("id:nav-contacts");
  await app.waitFor("text:Directory");
  await app.press("text:Sarah Wanjiku");
  await app.waitFor("id:contact-page");
  await app.press("id:contact-new-quote");
  await app.waitFor("id:quote-builder-dialog");
  expect(app.value("id:quote-customer")).toBe("ABC Enterprises");
  expect(app.texts()).toContain("Acme Kenya — Q4 packaging");
  await app.press("id:dialog-close");
});

test("opens a deal, filters the board, and advances a stage", async () => {
  const app = await openDesktop();
  await app.press("id:nav-deals");
  await app.waitFor("text:Enquiry");
  await app.press("id:deal-OPP-2025-0123");
  await app.waitFor("text:STAGE PATH");
  await app.press("id:dialog-close");
  await app.press("text:Filter");
  await app.waitFor("id:deal-filter-popover");
  await app.press("label:Filter Quotation");
  await app.press("id:apply-deal-filter");
  await app.waitFor("text:Acme Kenya — Q4 packaging");
});

test("filters the pipeline by owner scope", async () => {
  const app = await openDesktop();
  await app.press("id:nav-deals");
  await app.waitFor("id:tab-pipeline-my");
  await app.press("id:tab-pipeline-my");
  await app.waitFor("text:Nairobi Office — bulk order");
  expect(app.texts()).not.toContain("Acme Kenya — Q4 packaging");
});

test("opens a quote, creates one, and opens a product", async () => {
  const app = await openDesktop();
  await app.press("id:nav-quotes");
  await app.waitFor("id:quote-mini-list");
  await app.waitFor("text:Prepared for");
  await app.press("id:quote-new");
  await app.waitFor("id:quote-builder-dialog");
  await app.type("id:quote-customer", "Faith Njeri");
  await app.press("id:create-quote");
  await app.waitFor("text:Faith Njeri");
  await app.press("id:nav-catalog");
  await app.waitFor("text:ProMax headset");
  await app.press("text:ProMax headset");
  await app.waitFor("text:ON HAND");
});

test("approves a quote and previews its PDF", async () => {
  const app = await openDesktop();
  await app.press("id:nav-quotes");
  await app.waitFor("id:quote-mini-list");
  await app.press("id:quote-mini-QT-2025-0043");
  await app.waitFor("text:Manager approval required");
  await app.press("id:approve-quote");
  await app.waitFor("text:Approved");
  expect(app.texts()).not.toContain("Manager approval required");
  await app.press("id:quote-mini-QT-2025-0045");
  await app.waitFor("text:PDF preview");
  await app.press("id:quote-preview-pdf");
  await app.waitFor("id:quote-pdf-page");
  await app.press("id:download-quote-pdf");
  await app.press("id:quote-pdf-back");
  await app.waitFor("text:Prepared for");
});

test("searches the catalog and dispatches product media", async () => {
  const app = await openDesktop();
  await app.press("id:nav-catalog");
  await app.waitFor("text:ProMax headset");
  await app.type("id:catalog-search", "IQ-DIS");
  await app.waitFor("text:Retail display kit");
  expect(app.texts()).not.toContain("ProMax headset");
  await app.press("text:Retail display kit");
  await app.waitFor("text:ON HAND");
  await app.press("text:Send to conversation");
  await app.waitFor("id:dispatch-product-dialog");
  await app.press("id:confirm-dispatch");
  await app.waitFor("text:Catalog media queued through cloud egress.");
});

test("opens quotes directly in a persistent 20/80 split", async () => {
  const app = await openDesktop();
  await app.press("id:nav-quotes");
  await app.waitFor("id:quote-mini-list");
  await app.waitFor("text:Prepared for");
  await app.press("id:quote-mini-QT-2025-0044");
  await app.waitFor("text:Ochieng & Sons");
  await app.press("id:quote-preview-pdf");
  await app.waitFor("id:quote-pdf-page");
  await app.waitFor("id:quote-mini-list");
  await app.press("id:quote-pdf-back");
  await app.waitFor("text:Prepared for");
});

test("duplicates a quote from its row actions", async () => {
  const app = await openDesktop();
  await app.press("id:nav-quotes");
  await app.waitFor("id:quote-mini-QT-2025-0043");
  await app.rightClick("id:quote-mini-QT-2025-0043");
  await app.waitFor("text:Duplicate quote");
  await app.press("id:context-duplicate");
  await app.waitFor("text:QT-2025-0046");
  await app.waitFor("text:QT-2025-0046 drafted from QT-2025-0043.");
});

test("advances a deal from its row actions", async () => {
  const app = await openDesktop();
  await app.press("id:nav-deals");
  await app.waitFor("id:deal-OPP-2025-0123");
  await app.rightClick("id:deal-OPP-2025-0123");
  await app.waitFor("text:Advance stage");
  await app.press("id:context-advance");
  await app.waitFor("text:OPP-2025-0123 moved to Negotiation.");
});

test("filters quote views with the status tabs", async () => {
  const app = await openDesktop();
  await app.press("id:nav-quotes");
  await app.waitFor("id:tab-quotes-drafts");
  await app.press("id:tab-quotes-drafts");
  await app.waitFor("text:TechWorld Ltd");
  expect(app.texts()).not.toContain("Ochieng & Sons");
  await app.press("id:tab-quotes-accepted");
  await app.waitFor("text:Ochieng & Sons");
});

test("records a deliberate audited quote acceptance", async () => {
  const app = await openDesktop();
  await app.press("id:nav-quotes");
  await app.waitFor("id:quote-mini-list");
  await app.press("id:quote-accept");
  await app.waitFor("id:quote-acceptance-dialog");
  await app.type("id:acceptance-reference", "PO-2025-0117");
  await app.press("label:Confirm customer acceptance");
  await app.press("id:confirm-quote-acceptance");
  await app.waitFor("text:Acceptance recorded");
  await app.waitFor("text:Customer acceptance recorded");
});
