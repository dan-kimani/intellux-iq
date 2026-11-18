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
    customer: "ABC Enterprises",
    opportunity: "Acme Kenya — Q4 packaging",
    value: "KES 248,500",
    owner: "David Mwangi",
    validUntil: "22 Nov",
    status: "sent",
    issued: "12 Nov 2025",
    version: 2,
    items: [{ name: "ProMax headset", qty: 50, price: "KES 4,970", total: "KES 248,500" }],
    subtotal: "KES 248,500",
    tax: "KES 0",
    total: "KES 248,500",
    notes: "Net 14 · Delivery included",
    acceptedAt: "—",
    viewed: "Viewed 2× today",
  },
  {
    id: "QT-2025-0044",
    customer: "Ochieng & Sons",
    opportunity: "Nairobi Office — bulk order",
    value: "KES 96,750",
    owner: "David Mwangi",
    validUntil: "20 Nov",
    status: "accepted",
    issued: "09 Nov 2025",
    version: 1,
    items: [{ name: "Office audio pack", qty: 5, price: "KES 19,350", total: "KES 96,750" }],
    subtotal: "KES 96,750",
    tax: "KES 0",
    total: "KES 96,750",
    notes: "Annual office rollout",
    acceptedAt: "11 Nov 2025",
    viewed: "—",
  },
  {
    id: "QT-2025-0043",
    customer: "TechWorld Ltd",
    opportunity: "TechWorld — accessory bundle",
    value: "KES 84,000",
    owner: "Amina Kimani",
    validUntil: "24 Nov",
    status: "draft",
    issued: "12 Nov 2025",
    version: 1,
    items: [{ name: "Accessory bundle", qty: 20, price: "KES 4,200", total: "KES 84,000" }],
    subtotal: "KES 84,000",
    tax: "KES 0",
    total: "KES 84,000",
    notes: "Draft — awaiting product image",
    acceptedAt: "—",
    viewed: "—",
    approvalStatus: "pending",
  },
  {
    id: "QT-2025-0042",
    customer: "Global Retail KE",
    opportunity: "Global Retail — 200 units",
    value: "KES 412,000",
    owner: "Yasir Noori",
    validUntil: "19 Nov",
    status: "expired",
    issued: "10 Nov 2025",
    version: 3,
    items: [{ name: "Retail starter pack", qty: 17, price: "KES 24,235", total: "KES 412,000" }],
    subtotal: "KES 412,000",
    tax: "KES 0",
    total: "KES 412,000",
    notes: "Expired; repricing required",
    acceptedAt: "—",
    viewed: "Viewed 5×",
  },
  {
    id: "QT-2025-0041",
    customer: "Kamau Retail",
    opportunity: "Kamau Retail — POS refresh",
    value: "KES 189,900",
    owner: "James Njoroge",
    validUntil: "28 Nov",
    status: "sent",
    issued: "08 Nov 2025",
    version: 1,
    items: [{ name: "POS refresh bundle", qty: 25, price: "KES 7,596", total: "KES 189,900" }],
    subtotal: "KES 189,900",
    tax: "KES 0",
    total: "KES 189,900",
    notes: "Net 30 · installation included",
    acceptedAt: "—",
    viewed: "Viewed 1×",
  },
  {
    id: "QT-2025-0040",
    customer: "Atieno Interiors",
    opportunity: "Atieno — room set",
    value: "KES 72,400",
    owner: "Moses Otieno",
    validUntil: "18 Nov",
    status: "accepted",
    issued: "05 Nov 2025",
    version: 1,
    items: [{ name: "Atieno room set", qty: 1, price: "KES 72,400", total: "KES 72,400" }],
    subtotal: "KES 72,400",
    tax: "KES 0",
    total: "KES 72,400",
    notes: "Design package included",
    acceptedAt: "07 Nov 2025",
    viewed: "—",
  },
];

export const quoteMetrics = [
  { label: "Issued this month", value: "12", note: "KES 1.28M total", tone: "chart-2" as const },
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
