import type { AvatarTone } from "../../data";

export type ContactStatus = "active" | "new" | "silent";

export interface ContactRow {
  id: string;
  name: string;
  initials: string;
  tone: AvatarTone;
  company: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  owner: string;
  channel: "WhatsApp" | "Email";
  lastTouch: string;
  status: ContactStatus;
  value: string;
  deals: number;
  conversations: number;
  since: string;
  score: number;
  outcome: string;
  tags: string[];
}

export const contacts: ContactRow[] = [
  {
    id: "c1",
    name: "Maya Lin",
    initials: "ML",
    tone: "violet",
    company: "Atlas Enterprises",
    role: "Procurement lead",
    email: "maya@abc.com",
    phone: "+1 415 555 0132",
    location: "New York, US",
    value: "$1.24M",
    deals: 4,
    conversations: 12,
    since: "Jan 2025",
    score: 92,
    outcome: "Quote accepted 3d ago",
    tags: ["VIP", "Procurement", "High intent"],
    owner: "Alex Morgan",
    channel: "WhatsApp",
    lastTouch: "2m ago",
    status: "active",
  },
  {
    id: "c2",
    name: "Jonah Reyes",
    initials: "JR",
    tone: "green",
    company: "Harbor & Co.",
    role: "Founder",
    email: "jonah@harborco.com",
    phone: "+44 20 7946 0184",
    location: "London, UK",
    value: "$486K",
    deals: 2,
    conversations: 6,
    since: "Mar 2025",
    score: 78,
    outcome: "Follow-up due tomorrow",
    tags: ["Repeat buyer", "Wholesale"],
    owner: "Alex Morgan",
    channel: "WhatsApp",
    lastTouch: "18m ago",
    status: "active",
  },
  {
    id: "c3",
    name: "Grace Chen",
    initials: "GC",
    tone: "amber",
    company: "Acme Inc.",
    role: "Operations",
    email: "grace@acme.com",
    phone: "+1 212 555 0199",
    location: "New York, US",
    value: "$96K",
    deals: 1,
    conversations: 2,
    since: "Nov 2025",
    score: 64,
    outcome: "New enquiry from CSV",
    tags: ["New lead", "Email"],
    owner: "Priya Shah",
    channel: "Email",
    lastTouch: "42m ago",
    status: "new",
  },
  {
    id: "c4",
    name: "James Carter",
    initials: "JC",
    tone: "blue",
    company: "Northwind Retail",
    role: "Buyer",
    email: "james@northwindretail.com",
    phone: "+1 312 555 0110",
    location: "Chicago, US",
    value: "$312K",
    deals: 3,
    conversations: 8,
    since: "Aug 2024",
    score: 71,
    outcome: "Quotation viewed 2x",
    tags: ["Retail", "POS refresh"],
    owner: "Aiko Tanaka",
    channel: "Email",
    lastTouch: "1h ago",
    status: "active",
  },
  {
    id: "c5",
    name: "Nora Vance",
    initials: "NV",
    tone: "rose",
    company: "Lumen Interiors",
    role: "Director",
    email: "nora@lumeninteriors.com",
    phone: "+1 646 555 0224",
    location: "New York, US",
    value: "$158K",
    deals: 1,
    conversations: 4,
    since: "Feb 2025",
    score: 42,
    outcome: "Silent for 5 days",
    tags: ["At risk", "Interiors"],
    owner: "Sam Okafor",
    channel: "WhatsApp",
    lastTouch: "3h ago",
    status: "silent",
  },
  {
    id: "c6",
    name: "Theo Marsh",
    initials: "TM",
    tone: "amber",
    company: "Morgan Hardware",
    role: "Owner",
    email: "theo@morganhardware.com",
    phone: "+1 617 555 0907",
    location: "Boston, US",
    value: "$205K",
    deals: 2,
    conversations: 5,
    since: "Jun 2025",
    score: 69,
    outcome: "Restock enquiry",
    tags: ["Hardware", "Repeat buyer"],
    owner: "Leo Brandt",
    channel: "WhatsApp",
    lastTouch: "4h ago",
    status: "active",
  },
  {
    id: "c7",
    name: "Aiko Tanaka",
    initials: "AT",
    tone: "violet",
    company: "Brightline Retail",
    role: "Category lead",
    email: "aiko@brightlineretail.com",
    phone: "+1 206 555 0618",
    location: "Seattle, US",
    value: "$84K",
    deals: 1,
    conversations: 1,
    since: "Nov 2025",
    score: 57,
    outcome: "Awaiting first reply",
    tags: ["New lead", "Category lead"],
    owner: "Aiko Tanaka",
    channel: "Email",
    lastTouch: "Yesterday",
    status: "new",
  },
  {
    id: "c8",
    name: "Sam Okafor",
    initials: "SO",
    tone: "green",
    company: "Verdant Foods",
    role: "Supply chain",
    email: "sam@verdantfoods.com",
    phone: "+1 646 555 0446",
    location: "New York, US",
    value: "$442K",
    deals: 2,
    conversations: 9,
    since: "Sep 2024",
    score: 38,
    outcome: "No activity for 7 days",
    tags: ["At risk", "Food service"],
    owner: "Sam Okafor",
    channel: "WhatsApp",
    lastTouch: "2d ago",
    status: "silent",
  },
];

export const segments = [
  { label: "High intent", value: 38, tone: "chart-1" as const },
  { label: "Repeat buyers", value: 24, tone: "chart-3" as const },
  { label: "New this month", value: 16, tone: "chart-4" as const },
  { label: "Needs recovery", value: 7, tone: "chart-5" as const },
];

export const statusStyles: Record<ContactStatus, string> = {
  active: "text-success",
  new: "text-info",
  silent: "text-warning",
};
