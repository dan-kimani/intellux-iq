export interface SegmentRule {
  field: string;
  op: string;
  value: string;
}

export interface SegmentRow {
  id: string;
  name: string;
  description: string;
  members: number;
  tone: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";
  updated: string;
  memberIds: string[];
  rules: SegmentRule[];
}

export const segmentRows: SegmentRow[] = [
  {
    id: "high-intent",
    name: "High intent",
    description: "Engaged buyers with an open opportunity and recent replies.",
    members: 38,
    tone: "chart-1",
    updated: "Updated 12m ago",
    memberIds: ["c1", "c2", "c3", "c4"],
    rules: [
      { field: "Engagement score", op: "is greater than", value: "80" },
      { field: "Open deals", op: "is at least", value: "1" },
      { field: "Last touch", op: "is within", value: "7 days" },
    ],
  },
  {
    id: "repeat-buyers",
    name: "Repeat buyers",
    description: "Customers with two or more accepted quotations.",
    members: 24,
    tone: "chart-3",
    updated: "Updated 1h ago",
    memberIds: ["c2", "c5", "c6"],
    rules: [
      { field: "Accepted quotes", op: "is at least", value: "2" },
      { field: "Customer since", op: "is before", value: "2026" },
    ],
  },
  {
    id: "new-this-month",
    name: "New this month",
    description: "Contacts created in the current calendar month.",
    members: 16,
    tone: "chart-4",
    updated: "Updated 3h ago",
    memberIds: ["c3", "c7", "c8"],
    rules: [{ field: "Created at", op: "is within", value: "This month" }],
  },
  {
    id: "needs-recovery",
    name: "Needs recovery",
    description: "Silent accounts with an open quote or opportunity.",
    members: 7,
    tone: "chart-5",
    updated: "Updated 4h ago",
    memberIds: ["c4", "c6", "c8"],
    rules: [
      { field: "Last touch", op: "is older than", value: "3 days" },
      { field: "Open quotes", op: "is at least", value: "1" },
    ],
  },
];
