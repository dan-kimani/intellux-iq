import { signal } from "nsh";
import headphones from "../../assets/images/headphones.jpg";
import type { AttachmentFile } from "../../files/types";
import {
  cataloguePdf,
  deliveryNotes,
  distributorTerms,
  launchDeck,
  productShot,
  quotationPdf,
  remittanceAdvice,
  supplierInvoice,
  supplyAgreement,
  volumePricing,
} from "./mail-files";

export type MailFolder = "Inbox" | "Sent" | "Drafts" | "Archive" | "Junk";
export type MailStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "failed"
  | "bounced"
  | "draft";

export const mailAccounts = [
  {
    id: "sales",
    email: "sales@acmetrading.co.ke",
    label: "Sales",
    tone: "chart-3" as const,
    status: "Healthy",
    sent: "1,248",
    quota: "2.4 / 10 GB",
  },
  {
    id: "support",
    email: "support@acmetrading.co.ke",
    label: "Support",
    tone: "chart-2" as const,
    status: "Healthy",
    sent: "842",
    quota: "1.1 / 10 GB",
  },
] as const;

export interface MailItem {
  id: string;
  folder: MailFolder;
  account: string;
  subject: string;
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  date: string;
  preview: string;
  body: string[];
  bodyHtml?: string;
  attachments: AttachmentFile[];
  status?: MailStatus;
  read: boolean;
  inlineImage?: { src: typeof headphones; caption: string };
  quoted?: string[];
  diagnostic?: string;
}

export const mailRows = signal<MailItem[]>([
  {
    id: "inbox-james",
    folder: "Inbox",
    account: "sales",
    subject: "Re: Pricing for the Q4 fit-out",
    from: "james@kamauretail.co.ke",
    to: "sales@acmetrading.co.ke",
    date: "1h ago",
    preview: "Thanks for the revised quote — finance is reviewing it now…",
    body: [
      "Hi David,",
      "Thanks for the revised quote. Finance is reviewing it now and I should have a decision by Thursday.",
      "Could you hold the 50-unit pricing until then?",
      "Best,\nJames",
    ],
    bodyHtml:
      "<p>Hi David,</p><p>Thanks for the revised quote. Finance is reviewing it now and I should have a decision by <strong>Thursday</strong>.</p><p>Could you hold the 50-unit pricing until then?</p><p>Best,<br/>James</p>",
    attachments: [],
    status: "delivered",
    read: true,
  },
  {
    id: "inbox-summit",
    folder: "Inbox",
    account: "sales",
    subject: "Catalogue and distributor terms",
    from: "info@summittraders.co.ke",
    to: "sales@acmetrading.co.ke",
    date: "3h ago",
    preview: "Interested in 100 units. Could you send the catalogue and terms?",
    body: [
      "Hello,",
      "We are interested in 100 units for our Thika branch. Could you send the catalogue and your distributor terms?",
      "Regards,\nSummit Traders",
    ],
    bodyHtml:
      "<p>Hello,</p><p>We are interested in <strong>100 units</strong> for our Thika branch. Could you send the catalogue and your distributor terms?</p><p>Regards,<br/>Summit Traders</p>",
    attachments: [cataloguePdf, distributorTerms],
    status: "delivered",
    read: false,
  },
  {
    id: "m1",
    folder: "Sent",
    account: "sales",
    subject: "Revised quotation QT-2025-0045",
    from: "sales@acmetrading.co.ke",
    to: "sarah@abc.co.ke",
    cc: "david@acmetrading.co.ke",
    date: "Today",
    preview: "Attached is the revised quotation with the volume discount…",
    body: [
      "Hi Sarah,",
      "Attached is the revised quotation with the 2% volume discount we discussed. Pricing is held until 22 November.",
      "Please confirm the delivery window and the packaging artwork.",
      "Best,\nDavid",
    ],
    attachments: [quotationPdf, volumePricing, productShot],
    status: "delivered",
    read: true,
    inlineImage: { src: headphones, caption: "ProMax headset — included in the quotation." },
    quoted: [
      "On 12 Nov, Sarah Wanjiku wrote:",
      "Could you hold the pricing for the 50-unit order and confirm the delivery window?",
    ],
  },
  {
    id: "m2",
    folder: "Sent",
    account: "sales",
    subject: "Delivery schedule for Nairobi Office",
    from: "sales@acmetrading.co.ke",
    to: "david@ochiengsons.co.ke",
    date: "Yesterday",
    preview: "The installation window is confirmed for Tuesday…",
    body: [
      "Hi David,",
      "The installation window is confirmed for Tuesday between 09:00 and 11:00. The crew will bring the full office audio pack.",
      "Please have the service lift available.",
      "Best,\nDavid",
    ],
    attachments: [deliveryNotes],
    status: "sent",
    read: true,
  },
  {
    id: "m3",
    folder: "Sent",
    account: "sales",
    subject: "Catalogue and accessory list",
    from: "sales@acmetrading.co.ke",
    to: "peter@mwangihardware.co.ke",
    date: "2d ago",
    preview: "Sharing the latest catalogue and the accessory bundle pricing…",
    body: [
      "Hi Peter,",
      "Sharing the latest catalogue and the accessory bundle pricing. Let me know which items you want us to hold.",
      "Best,\nDavid",
    ],
    attachments: [cataloguePdf, launchDeck],
    status: "failed",
    read: true,
    diagnostic: "SMTP 550: recipient mailbox unavailable. The cloud will retry with backoff.",
  },
  {
    id: "m4",
    folder: "Drafts",
    account: "sales",
    subject: "Re: tender quantities for Kijani",
    from: "sales@acmetrading.co.ke",
    to: "moses@kijani.co.ke",
    date: "18m ago",
    preview: "Moses — checking the final quantities with the warehouse…",
    body: [
      "Moses,",
      "Checking the final quantities with the warehouse before I send the tender response. I’ll confirm today.",
    ],
    attachments: [],
    status: "draft",
    read: false,
  },
  {
    id: "m5",
    folder: "Drafts",
    account: "support",
    subject: "Follow-up on Summit distributor terms",
    from: "support@acmetrading.co.ke",
    to: "peter@summit.co.ke",
    date: "1h ago",
    preview: "Hi Peter — following up on the distributor terms…",
    body: [
      "Hi Peter,",
      "Following up on the distributor terms. I have included the updated margin schedule for review.",
    ],
    attachments: [],
    status: "draft",
    read: false,
  },
  {
    id: "m6",
    folder: "Archive",
    account: "sales",
    subject: "Q3 supply agreement",
    from: "james@riftvalley.co.ke",
    to: "sales@acmetrading.co.ke",
    date: "12 Nov",
    preview: "Signed agreement attached for your records…",
    body: ["David,", "Signed agreement attached for your records. Thanks for the smooth renewal."],
    attachments: [supplyAgreement],
    status: "delivered",
    read: true,
    quoted: ["On 10 Nov, David Mwangi wrote:", "Attached is the renewal draft for review."],
  },
  {
    id: "m7",
    folder: "Archive",
    account: "sales",
    subject: "Payment confirmation",
    from: "finance@abc.co.ke",
    to: "sales@acmetrading.co.ke",
    date: "05 Nov",
    preview: "Payment of KES 96,750 has been released…",
    body: [
      "Payment of KES 96,750 has been released to your account. The remittance advice is attached.",
    ],
    attachments: [remittanceAdvice],
    status: "delivered",
    read: true,
  },
  {
    id: "m8",
    folder: "Junk",
    account: "support",
    subject: "Unverified supplier invoice",
    from: "billing@unknown-supplier.example",
    to: "support@acmetrading.co.ke",
    date: "1h ago",
    preview: "Please review the attached invoice urgently…",
    body: ["Please review the attached invoice urgently."],
    attachments: [supplierInvoice],
    status: "bounced",
    read: false,
    diagnostic: "Hard bounce: recipient address rejected by the provider.",
  },
]);

export function mailCountLabel(count: number): string {
  return `${count} ${count === 1 ? "message" : "messages"}`;
}

export function mailFolderCount(folder: MailFolder, accountId?: string): number {
  return mailRows().filter(
    (item) => item.folder === folder && (!accountId || item.account === accountId),
  ).length;
}

export function mailUnreadCount(): number {
  return mailRows().filter((item) => item.folder === "Inbox" && !item.read).length;
}

export function mailAccountEmail(accountId: string): string {
  return mailAccounts.find((account) => account.id === accountId)?.email ?? mailAccounts[0].email;
}
