export const signals = [
  {
    subject: "Grace Wanjiku",
    signal: "lead",
    severity: "urgent",
    owner: "Yasir Noori",
    age: "42m",
  },
  { subject: "Acme Kenya", signal: "quote", severity: "high", owner: "Yasir Noori", age: "3d" },
  {
    subject: "Kijani Foods",
    signal: "inactive",
    severity: "medium",
    owner: "Moses Otieno",
    age: "8d",
  },
  {
    subject: "Rift Valley Traders",
    signal: "due",
    severity: "high",
    owner: "James Njoroge",
    age: "1d late",
  },
] as const;

export const severityStyles = {
  urgent: "border-red-600/20 bg-red-500/10 text-red-700 dark:text-red-300",
  high: "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  medium: "border-sky-600/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  low: "border-border bg-muted text-muted-foreground",
} as const;

export const outcomes = [
  { key: "enquiries", value: "42" },
  { key: "qualified", value: "18" },
  { key: "quotes", value: "12" },
  { key: "accepted", value: "7" },
  { key: "won", value: "5" },
  { key: "revenue", value: "KES 1.28M" },
  { key: "recovered", value: "9" },
  { key: "followUps", value: "86%" },
] as const;
