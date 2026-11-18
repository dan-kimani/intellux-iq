import { expect, open, test } from "nsh/test";

function openDesktop() {
  return open("./App.tsx", {
    width: 1440,
    height: 900,
    platform: "linux",
    colorScheme: "dark",
  });
}

test("previews a PDF attachment, turns its pages, and saves it", async () => {
  const app = await openDesktop();
  await app.press("id:filter-email");
  await app.waitFor("id:mail-inbox-summit");
  await app.press("id:mail-inbox-summit");
  await app.waitFor("id:mail-page");
  await app.press("id:file-catalogue-november");
  await app.waitFor("id:file-viewer");
  await app.waitFor("text:Page 1 of 8");
  await app.press("id:file-viewer-next");
  await app.waitFor("text:Page 2 of 8");
  await app.press("id:file-viewer-download");
  await app.waitFor("id:save-file-dialog");
  await app.press("id:confirm-save-file");
  await app.waitFor("text:Saved Catalogue-November.pdf to Downloads.");
});

test("previews an image attachment from the reader", async () => {
  const app = await openDesktop();
  await app.press("id:filter-email");
  await app.press("label:Mail folder Sent");
  await app.waitFor("text:Revised quotation QT-2025-0045");
  await app.press("text:Revised quotation QT-2025-0045");
  await app.waitFor("id:mail-page");
  await app.press("id:file-promax-headset");
  await app.waitFor("id:file-viewer");
  expect(app.texts()).toContain("ProMax-headset.jpg · image preview from the sanitized cloud copy");
  await app.press("id:file-viewer-close");
  expect(app.shows("id:file-viewer")).toBe(false);
});

test("previews a WhatsApp image and PDF in the same viewer", async () => {
  const app = await openDesktop();
  await app.press("label:View image");
  await app.waitFor("id:file-viewer");
  await app.waitFor("text:ProMax-headset.jpg");
  await app.press("id:file-viewer-close");
  await app.press("label:Preview Quotation_QT-2025-0045.pdf");
  await app.waitFor("id:file-viewer");
  await app.waitFor("text:Page 1 of 1");
});

test("saves a non-previewable archive to a chosen folder", async () => {
  const app = await openDesktop();
  await app.press("id:filter-email");
  await app.press("id:mail-account-trigger");
  await app.press("id:mail-account-support");
  await app.press("label:Mail folder Junk");
  await app.waitFor("id:mail-m8");
  await app.press("id:mail-m8");
  await app.waitFor("id:mail-page");
  await app.press("id:file-invoice");
  await app.waitFor("id:save-file-dialog");
  expect(app.shows("id:file-viewer")).toBe(false);
  await app.press("id:save-location-documents");
  await app.press("id:confirm-save-file");
  await app.waitFor("text:Saved invoice.zip to Documents.");
});
