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
    name: "Sarah Wanjiku",
    initials: "SW",
    tone: "violet",
    company: "ABC Enterprises",
    role: "Procurement lead",
    email: "sarah@abc.co.ke",
    phone: "+254 712 345 678",
    location: "Nairobi, Kenya",
    value: "KES 1.24M",
    deals: 4,
    conversations: 12,
    since: "Jan 2025",
    score: 92,
    outcome: "Quote accepted 3d ago",
    tags: ["VIP", "Procurement", "High intent"],
    owner: "David Mwangi",
    channel: "WhatsApp",
    lastTouch: "2m ago",
    status: "active",
  },
  {
    id: "c2",
    name: "David Ochieng",
    initials: "DO",
    tone: "green",
    company: "Ochieng & Sons",
    role: "Founder",
    email: "david@ochiengsons.co.ke",
    phone: "+254 733 201 884",
    location: "Kisumu, Kenya",
    value: "KES 486K",
    deals: 2,
    conversations: 6,
    since: "Mar 2025",
    score: 78,
    outcome: "Follow-up due tomorrow",
    tags: ["Repeat buyer", "Wholesale"],
    owner: "David Mwangi",
    channel: "WhatsApp",
    lastTouch: "18m ago",
    status: "active",
  },
  {
    id: "c3",
    name: "Grace Wanjiku",
    initials: "GW",
    tone: "amber",
    company: "Acme Kenya",
    role: "Operations",
    email: "grace@acme.co.ke",
    phone: "+254 701 552 019",
    location: "Nairobi, Kenya",
    value: "KES 96K",
    deals: 1,
    conversations: 2,
    since: "Nov 2025",
    score: 64,
    outcome: "New enquiry from CSV",
    tags: ["New lead", "Email"],
    owner: "Yasir Noori",
    channel: "Email",
    lastTouch: "42m ago",
    status: "new",
  },
  {
    id: "c4",
    name: "James Kamau",
    initials: "JK",
    tone: "blue",
    company: "Kamau Retail",
    role: "Buyer",
    email: "james@kamauretail.co.ke",
    phone: "+254 722 848 110",
    location: "Nakuru, Kenya",
    value: "KES 312K",
    deals: 3,
    conversations: 8,
    since: "Aug 2024",
    score: 71,
    outcome: "Quotation viewed 2x",
    tags: ["Retail", "POS refresh"],
    owner: "Amina Kimani",
    channel: "Email",
    lastTouch: "1h ago",
    status: "active",
  },
  {
    id: "c5",
    name: "Mary Atieno",
    initials: "MA",
    tone: "rose",
    company: "Atieno Interiors",
    role: "Director",
    email: "mary@atienointeriors.co.ke",
    phone: "+254 799 310 224",
    location: "Nairobi, Kenya",
    value: "KES 158K",
    deals: 1,
    conversations: 4,
    since: "Feb 2025",
    score: 42,
    outcome: "Silent for 5 days",
    tags: ["At risk", "Interiors"],
    owner: "Moses Otieno",
    channel: "WhatsApp",
    lastTouch: "3h ago",
    status: "silent",
  },
  {
    id: "c6",
    name: "Peter Mwangi",
    initials: "PM",
    tone: "amber",
    company: "Mwangi Hardware",
    role: "Owner",
    email: "peter@mwangihardware.co.ke",
    phone: "+254 710 442 907",
    location: "Thika, Kenya",
    value: "KES 205K",
    deals: 2,
    conversations: 5,
    since: "Jun 2025",
    score: 69,
    outcome: "Restock enquiry",
    tags: ["Hardware", "Repeat buyer"],
    owner: "James Njoroge",
    channel: "WhatsApp",
    lastTouch: "4h ago",
    status: "active",
  },
  {
    id: "c7",
    name: "Amina Kimani",
    initials: "AK",
    tone: "violet",
    company: "Mwangaza Retail",
    role: "Category lead",
    email: "amina@mwangaza.co.ke",
    phone: "+254 745 220 618",
    location: "Machakos, Kenya",
    value: "KES 84K",
    deals: 1,
    conversations: 1,
    since: "Nov 2025",
    score: 57,
    outcome: "Awaiting first reply",
    tags: ["New lead", "Category lead"],
    owner: "Amina Kimani",
    channel: "Email",
    lastTouch: "Yesterday",
    status: "new",
  },
  {
    id: "c8",
    name: "Moses Otieno",
    initials: "MO",
    tone: "green",
    company: "Kijani Foods",
    role: "Supply chain",
    email: "moses@kijani.co.ke",
    phone: "+254 788 013 446",
    location: "Nairobi, Kenya",
    value: "KES 442K",
    deals: 2,
    conversations: 9,
    since: "Sep 2024",
    score: 38,
    outcome: "No activity for 7 days",
    tags: ["At risk", "Food service"],
    owner: "Moses Otieno",
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
