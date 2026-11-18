export const quoteStatusStyles = {
  approved: "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  review: "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  sent: "border-sky-600/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  draft: "border-border bg-muted text-muted-foreground",
} as const;

export type QuoteStatus = keyof typeof quoteStatusStyles;

export const quotes: Array<{
  number: string;
  customer: string;
  value: string;
  status: QuoteStatus;
  updated: string;
}> = [
  {
    number: "QT-2026-0184",
    customer: "Acme Kenya",
    value: "KES 248,500",
    status: "approved",
    updated: "2m ago",
  },
  {
    number: "QT-2026-0183",
    customer: "Mwangaza Retail",
    value: "KES 184,200",
    status: "review",
    updated: "18m ago",
  },
  {
    number: "QT-2026-0182",
    customer: "Nairobi Office Co.",
    value: "KES 96,750",
    status: "sent",
    updated: "1h ago",
  },
  {
    number: "QT-2026-0181",
    customer: "Kijani Foods",
    value: "KES 412,000",
    status: "draft",
    updated: "3h ago",
  },
  {
    number: "QT-2026-0180",
    customer: "Rift Valley Traders",
    value: "KES 338,900",
    status: "approved",
    updated: "Yesterday",
  },
];
