export const activity = [
  { initials: "GW", name: "Grace Wanjiku", action: "approved QT-2026-0184", time: "2m ago" },
  { initials: "MO", name: "Moses Otieno", action: "reassigned a WhatsApp thread", time: "14m ago" },
  { initials: "AK", name: "Amina Kimani", action: "linked a new desktop device", time: "38m ago" },
  { initials: "JN", name: "James Njoroge", action: "sent QT-2026-0183 for review", time: "1h ago" },
];

export const conversations = [
  {
    contact: "Grace Wanjiku",
    channel: "WhatsApp",
    assignee: "Yasir Noori",
    waiting: "2m",
    status: "open",
  },
  {
    contact: "Mwangaza Retail",
    channel: "Email",
    assignee: "Amina Kimani",
    waiting: "8m",
    status: "open",
  },
  {
    contact: "Kijani Foods",
    channel: "WhatsApp",
    assignee: "Moses Otieno",
    waiting: "21m",
    status: "waiting",
  },
  {
    contact: "Nairobi Office Co.",
    channel: "Email",
    assignee: "James Njoroge",
    waiting: "43m",
    status: "waiting",
  },
  {
    contact: "Rift Valley Traders",
    channel: "WhatsApp",
    assignee: "Unassigned",
    waiting: "1h",
    status: "waiting",
  },
] as const;

export const devices = [
  { name: "Yasir's MacBook Pro", platform: "macOS 15.6", lastSeen: "Now", status: "online" },
  { name: "Amina's ThinkPad X1", platform: "Windows 11", lastSeen: "3m ago", status: "online" },
  { name: "Moses's MacBook Air", platform: "macOS 15.4", lastSeen: "12m ago", status: "online" },
  { name: "Finance workstation", platform: "Ubuntu 24.04", lastSeen: "1h ago", status: "offline" },
  {
    name: "James's Surface Laptop",
    platform: "Windows 11",
    lastSeen: "Yesterday",
    status: "offline",
  },
] as const;
