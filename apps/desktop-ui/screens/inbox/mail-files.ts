import headphones from "../../assets/images/headphones.jpg";
import { attachmentFile, imageAttachment, pdfAttachment } from "../../files/types";

export const quotationPdf = pdfAttachment("Quotation_QT-2025-0045.pdf", "245 KB", {
  title: "Revised quotation",
  subtitle: "Quotation QT-2025-0045 · Sarah Wanjiku, ABC Enterprises",
  lines: [
    "Prepared for Sarah Wanjiku · ABC Enterprises, Nairobi.",
    "50 × ProMax wireless headset, midnight black.",
    "Volume discount: 2% · Unit price held until 22 November 2025.",
    "Total: KES 248,500 including delivery to Nairobi.",
    "Lead time: 10 working days from purchase order.",
    "Packaging artwork is confirmed separately with the customer.",
  ],
  pages: 3,
});

export const cataloguePdf = pdfAttachment("Catalogue-November.pdf", "2.4 MB", {
  title: "Product catalogue",
  subtitle: "November 2025 · Audio and workspace essentials",
  lines: [
    "ProMax headset series · wireless, noise cancelling, 32-hour battery.",
    "Conference room audio packs for 4, 8, and 16 seats.",
    "Workspace accessories · stands, hubs, and charging docks.",
    "Distributor terms and volume pricing follow on page 6.",
    "Availability is synced from the warehouse every 15 minutes.",
    "Orders placed before 12:00 ship the same working day.",
  ],
  pages: 8,
});

export const supplyAgreement = pdfAttachment("Q3-supply-agreement.pdf", "318 KB", {
  title: "Q3 supply agreement",
  subtitle: "Rift Valley Retail · signed 12 November 2025",
  lines: [
    "This agreement covers the Q3 replenishment of audio accessories.",
    "Delivery windows are confirmed by the cloud scheduler each Friday.",
    "Payment terms: 30 days from a verified delivery note.",
    "Both parties keep the signed copy in the shared workspace.",
  ],
  pages: 6,
});

export const remittanceAdvice = pdfAttachment("remittance.pdf", "96 KB", {
  title: "Remittance advice",
  subtitle: "KES 96,750 · ABC Enterprises",
  lines: [
    "Payment of KES 96,750 has been released to your account.",
    "Reference: INV-2025-0918 · value date 05 November 2025.",
    "The amount settles the October accessories invoice in full.",
  ],
  pages: 1,
});

export const productShot = imageAttachment("ProMax-headset.jpg", "1.8 MB", headphones);

export const volumePricing = attachmentFile("Volume-pricing-Q4.xlsx", "42 KB");
export const distributorTerms = attachmentFile("Distributor-terms.docx", "184 KB");
export const launchDeck = attachmentFile("ProMax-launch.pptx", "6.1 MB");
export const deliveryNotes = attachmentFile("Nairobi-delivery-notes.txt", "12 KB");
export const supplierInvoice = attachmentFile("invoice.zip", "1.2 MB");
