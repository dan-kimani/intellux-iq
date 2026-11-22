import { type DealStage, type Stage, openStages, stageLabel } from "../../domain/stages";

export type { DealStage };

export interface Deal {
  id: string;
  name: string;
  company: string;
  value: string;
  owner: string;
  age: string;
  stage: Stage;
  product: string;
  contact: string;
  email: string;
  phone: string;
  probability: number;
  expectedClose: string;
  quoteId: string;
  lastActivity: string;
  nextStep: string;
  notes: string;
}

type StageTone = "chart-2" | "chart-1" | "chart-4" | "chart-5" | "chart-3";

const stageTones: Record<DealStage, StageTone> = {
  enquiry: "chart-2",
  qualified: "chart-1",
  quotation: "chart-4",
  negotiation: "chart-5",
  won: "chart-3",
};

export const dealStages: { id: DealStage; label: string; tone: StageTone }[] = openStages.map(
  (id) => ({ id, label: stageLabel(id), tone: stageTones[id] }),
);

export const deals: Deal[] = [
  {
    id: "OPP-2025-0123",
    name: "Acme Inc. — Q4 packaging",
    company: "Acme Inc.",
    value: "$248,500",
    owner: "Priya Shah",
    age: "12m ago",
    stage: "quotation",
    product: "50 units · ProMax",
    contact: "Maya Lin",
    email: "maya@abc.com",
    phone: "+1 415 555 0132",
    probability: 70,
    expectedClose: "22 Nov",
    quoteId: "QT-2025-0045",
    lastActivity: "18m ago",
    nextStep: "Confirm packaging artwork",
    notes: "Customer asked for a revised delivery schedule.",
  },
  {
    id: "OPP-2025-0118",
    name: "Brightline — retail display",
    company: "Brightline Retail",
    value: "$184,200",
    owner: "Aiko Tanaka",
    age: "1h ago",
    stage: "qualified",
    product: "24 units · Display kit",
    contact: "Aiko Tanaka",
    email: "aiko@brightlineretail.com",
    phone: "+1 206 555 0618",
    probability: 40,
    expectedClose: "28 Nov",
    quoteId: "—",
    lastActivity: "1h ago",
    nextStep: "Send display spec sheet",
    notes: "Retail display rollout for two new branches.",
  },
  {
    id: "OPP-2025-0110",
    name: "New York Office — bulk order",
    company: "Meridian Offices",
    value: "$96,750",
    owner: "Alex Morgan",
    age: "3h ago",
    stage: "negotiation",
    product: "12 units · Office",
    contact: "Jonah Reyes",
    email: "jonah@harborco.com",
    phone: "+44 20 7946 0184",
    probability: 55,
    expectedClose: "25 Nov",
    quoteId: "QT-2025-0044",
    lastActivity: "3h ago",
    nextStep: "Align on office install date",
    notes: "Bulk office order; install window is the blocker.",
  },
  {
    id: "OPP-2025-0130",
    name: "Verdant — new product line",
    company: "Verdant Foods",
    value: "$412,000",
    owner: "Sam Okafor",
    age: "Yesterday",
    stage: "enquiry",
    product: "100 units · Retail",
    contact: "Sam Okafor",
    email: "sam@verdantfoods.com",
    phone: "+1 646 555 0446",
    probability: 20,
    expectedClose: "05 Dec",
    quoteId: "—",
    lastActivity: "Yesterday",
    nextStep: "Qualify product mix",
    notes: "New line enquiry from a food-service distributor.",
  },
  {
    id: "OPP-2025-0099",
    name: "Continental — annual supply",
    company: "Continental Traders",
    value: "$338,900",
    owner: "Leo Brandt",
    age: "2d ago",
    stage: "won",
    product: "80 units · Annual",
    contact: "Leo Brandt",
    email: "james@riftvalley.com",
    phone: "+1 312 555 0110",
    probability: 100,
    expectedClose: "Won",
    quoteId: "QT-2025-0038",
    lastActivity: "2d ago",
    nextStep: "Schedule annual review",
    notes: "Annual supply agreement closed.",
  },
  {
    id: "OPP-2025-0127",
    name: "TechWorld — accessory bundle",
    company: "TechWorld Ltd",
    value: "$84,000",
    owner: "Aiko Tanaka",
    age: "4h ago",
    stage: "quotation",
    product: "40 units · Accessories",
    contact: "Grace Chen",
    email: "grace@techworld.com",
    phone: "+1 212 555 0199",
    probability: 65,
    expectedClose: "24 Nov",
    quoteId: "QT-2025-0043",
    lastActivity: "4h ago",
    nextStep: "Confirm accessory quantities",
    notes: "Accessory bundle quote is with the buyer.",
  },
  {
    id: "OPP-2025-0107",
    name: "Summit — distributor terms",
    company: "Summit Traders",
    value: "$420,000",
    owner: "Leo Brandt",
    age: "5h ago",
    stage: "qualified",
    product: "100 units · Distributor",
    contact: "Theo Marsh",
    email: "peter@summit.com",
    phone: "+1 617 555 0907",
    probability: 45,
    expectedClose: "30 Nov",
    quoteId: "—",
    lastActivity: "5h ago",
    nextStep: "Review distributor terms",
    notes: "Distributor terms need manager approval.",
  },
  {
    id: "OPP-2025-0125",
    name: "GreenMart — restock",
    company: "GreenMart Supplies",
    value: "$72,000",
    owner: "Sam Okafor",
    age: "6h ago",
    stage: "enquiry",
    product: "20 units · Restock",
    contact: "Sam Okafor",
    email: "moses@greenmart.com",
    phone: "+1 646 555 0002",
    probability: 30,
    expectedClose: "02 Dec",
    quoteId: "—",
    lastActivity: "6h ago",
    nextStep: "Check restock timing",
    notes: "Restock enquiry; next order likely next month.",
  },
  {
    id: "OPP-2025-0131",
    name: "Acme Inc. — accessory bundle",
    company: "Acme Inc.",
    value: "$52,000",
    owner: "Alex Morgan",
    age: "Today",
    stage: "enquiry",
    product: "20 units · Accessories",
    contact: "Maya Lin",
    email: "maya@abc.com",
    phone: "+1 415 555 0132",
    probability: 20,
    expectedClose: "05 Dec",
    quoteId: "—",
    lastActivity: "12m ago",
    nextStep: "Confirm accessory quantities",
    notes: "Secondary accessory enquiry alongside the Q4 packaging opportunity.",
  },
];

export const stageSummary = [
  { label: "Open pipeline", value: "$1.91M", note: "9 opportunities", tone: "chart-2" as const },
  { label: "Weighted value", value: "$860K", note: "45% probability", tone: "chart-1" as const },
  { label: "Won this month", value: "$338,900", note: "1 deal", tone: "chart-3" as const },
  { label: "Slipping", value: "2", note: "No activity 7d+", tone: "chart-4" as const },
];
