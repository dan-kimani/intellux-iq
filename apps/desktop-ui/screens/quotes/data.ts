export type QuoteStatus = "draft" | "sent" | "accepted" | "expired";

export interface QuoteRow {
  id: string;
  customer: string;
  opportunity: string;
  value: string;
  owner: string;
  validUntil: string;
  status: QuoteStatus;
  issued: string;
  version: number;
  items: { name: string; qty: number; price: string; total: string }[];
  subtotal: string;
  tax: string;
  total: string;
  notes: string;
  acceptedAt: string;
  viewed: string;
  approvalStatus?: "not_required" | "pending" | "approved";
}

export const quotes: QuoteRow[] = [
  {
    id: "QT-2025-0045",
    customer: "Atlas Enterprises",
    opportunity: "Acme Inc. — Q4 packaging",
    value: "$248,500",
    owner: "Alex Morgan",
    validUntil: "22 Nov",
    status: "sent",
    issued: "12 Nov 2025",
    version: 2,
    items: [{ name: "ProMax headset", qty: 50, price: "$4,970", total: "$248,500" }],
    subtotal: "$248,500",
    tax: "$0",
    total: "$248,500",
    notes: "Net 14 · Delivery included",
    acceptedAt: "—",
    viewed: "Viewed 2× today",
  },
  {
    id: "QT-2025-0044",
    customer: "Harbor & Co.",
    opportunity: "New York Office — bulk order",
    value: "$96,750",
    owner: "Alex Morgan",
    validUntil: "20 Nov",
    status: "accepted",
    issued: "09 Nov 2025",
    version: 1,
    items: [{ name: "Office audio pack", qty: 5, price: "$19,350", total: "$96,750" }],
    subtotal: "$96,750",
    tax: "$0",
    total: "$96,750",
    notes: "Annual office rollout",
    acceptedAt: "11 Nov 2025",
    viewed: "—",
  },
  {
    id: "QT-2025-0043",
    customer: "TechWorld Ltd",
    opportunity: "TechWorld — accessory bundle",
    value: "$84,000",
    owner: "Aiko Tanaka",
    validUntil: "24 Nov",
    status: "draft",
    issued: "12 Nov 2025",
    version: 1,
    items: [{ name: "Accessory bundle", qty: 20, price: "$4,200", total: "$84,000" }],
    subtotal: "$84,000",
    tax: "$0",
    total: "$84,000",
    notes: "Draft — awaiting product image",
    acceptedAt: "—",
    viewed: "—",
    approvalStatus: "pending",
  },
  {
    id: "QT-2025-0042",
    customer: "Global Retail Co.",
    opportunity: "Global Retail — 200 units",
    value: "$412,000",
    owner: "Priya Shah",
    validUntil: "19 Nov",
    status: "expired",
    issued: "10 Nov 2025",
    version: 3,
    items: [{ name: "Retail starter pack", qty: 17, price: "$24,235", total: "$412,000" }],
    subtotal: "$412,000",
    tax: "$0",
    total: "$412,000",
    notes: "Expired; repricing required",
    acceptedAt: "—",
    viewed: "Viewed 5×",
  },
  {
    id: "QT-2025-0041",
    customer: "Northwind Retail",
    opportunity: "Northwind Retail — POS refresh",
    value: "$189,900",
    owner: "Leo Brandt",
    validUntil: "28 Nov",
    status: "sent",
    issued: "08 Nov 2025",
    version: 1,
    items: [{ name: "POS refresh bundle", qty: 25, price: "$7,596", total: "$189,900" }],
    subtotal: "$189,900",
    tax: "$0",
    total: "$189,900",
    notes: "Net 30 · installation included",
    acceptedAt: "—",
    viewed: "Viewed 1×",
  },
  {
    id: "QT-2025-0040",
    customer: "Lumen Interiors",
    opportunity: "Vance — room set",
    value: "$72,400",
    owner: "Sam Okafor",
    validUntil: "18 Nov",
    status: "accepted",
    issued: "05 Nov 2025",
    version: 1,
    items: [{ name: "Vance room set", qty: 1, price: "$72,400", total: "$72,400" }],
    subtotal: "$72,400",
    tax: "$0",
    total: "$72,400",
    notes: "Design package included",
    acceptedAt: "07 Nov 2025",
    viewed: "—",
  },
];

export const quoteMetrics = [
  { label: "Issued this month", value: "12", note: "$1.28M total", tone: "chart-2" as const },
  { label: "Accepted", value: "7", note: "58% win rate", tone: "chart-3" as const },
  { label: "Awaiting reply", value: "3", note: "2 expire this week", tone: "chart-4" as const },
  { label: "Expired", value: "2", note: "Review pricing", tone: "chart-5" as const },
];

export const quoteStatusStyles: Record<
  QuoteStatus,
  { label: string; variant: "default" | "primary" | "success" | "warning" | "outline" }
> = {
  draft: { label: "Draft", variant: "outline" },
  sent: { label: "Sent", variant: "primary" },
  accepted: { label: "Accepted", variant: "success" },
  expired: { label: "Expired", variant: "warning" },
};
