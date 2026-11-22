import { signal } from "nsh";
import type { IconName } from "../../components/icon";

export type SeriesTone =
  | "series-1"
  | "series-2"
  | "series-3"
  | "series-4"
  | "series-5"
  | "series-6";

export const periods = ["7D", "30D", "90D", "Custom"] as const;
export type Period = (typeof periods)[number];
export const analyticsPeriod = signal<Period>("30D");

export const kpis: {
  label: string;
  value: string;
  delta: string;
  note: string;
  icon: IconName;
  tone: SeriesTone;
  spark: number[];
}[] = [
  {
    label: "Total Conversations",
    value: "3,248",
    delta: "+12%",
    note: "vs previous period",
    icon: "messageCircle",
    tone: "series-1",
    spark: [20, 28, 24, 35, 30, 42, 38, 48, 44, 52],
  },
  {
    label: "Qualified Leads",
    value: "684",
    delta: "+18%",
    note: "21% qualification rate",
    icon: "users",
    tone: "series-2",
    spark: [18, 20, 24, 22, 30, 28, 34, 32, 40, 46],
  },
  {
    label: "Quotes Sent",
    value: "562",
    delta: "+15%",
    note: "$1.9M pipeline",
    icon: "fileText",
    tone: "series-4",
    spark: [12, 18, 16, 22, 20, 26, 24, 30, 34, 32],
  },
  {
    label: "Deals Won",
    value: "347",
    delta: "+20%",
    note: "11.2% conversion",
    icon: "briefcase",
    tone: "series-2",
    spark: [22, 24, 22, 26, 30, 28, 32, 36, 34, 40],
  },
  {
    label: "Revenue",
    value: "$8.4M",
    delta: "+28%",
    note: "This period",
    icon: "package",
    tone: "series-3",
    spark: [14, 18, 16, 20, 24, 22, 28, 30, 28, 34],
  },
];

export const trendDates = [
  "Oct 19",
  "Oct 22",
  "Oct 25",
  "Oct 28",
  "Oct 31",
  "Nov 03",
  "Nov 06",
  "Nov 09",
  "Nov 12",
  "Nov 14",
  "Nov 15",
  "Nov 16",
  "Nov 17",
];

export const trend = {
  conversations: [1500, 1650, 1780, 1720, 1900, 2100, 2250, 2380, 2460, 2550, 2690, 2820, 3248],
  deals: [800, 820, 850, 830, 860, 880, 900, 870, 890, 880, 920, 900, 950],
  revenue: [2100, 2180, 2230, 2200, 2300, 2350, 2420, 2500, 2600, 2550, 2700, 2800, 3100],
};

export interface TrendPoint {
  label: string;
  conversations: number;
  deals: number;
  revenue: number;
}

export function trendPoints(period: Period): TrendPoint[] {
  const points = trendDates.map((label, index) => ({
    label,
    conversations: trend.conversations[index] ?? 0,
    deals: trend.deals[index] ?? 0,
    revenue: trend.revenue[index] ?? 0,
  }));
  return period === "7D" ? points.slice(-7) : points;
}

export type LeadTone = SeriesTone | "muted-foreground";

export interface LeadSource {
  label: string;
  value: string;
  count: string;
  countValue: number;
  tone: LeadTone;
}

export const leadSources: LeadSource[] = [
  { label: "WhatsApp", value: "52%", count: "1,689", countValue: 1689, tone: "series-3" },
  { label: "Email", value: "28%", count: "909", countValue: 909, tone: "series-1" },
  { label: "Website", value: "12%", count: "390", countValue: 390, tone: "series-4" },
  { label: "Others", value: "8%", count: "260", countValue: 260, tone: "muted-foreground" },
];

export const funnelStages = [
  { label: "Enquiry", value: "3,248", share: "100%", tone: "series-1" as const },
  { label: "Qualified", value: "684", share: "21%", tone: "series-2" as const },
  { label: "Quotation", value: "562", share: "17%", tone: "series-4" as const },
  { label: "Negotiation", value: "428", share: "13%", tone: "series-5" as const },
  { label: "Won", value: "347", share: "11%", tone: "series-3" as const },
];

export const pipelineMetrics = [
  {
    label: "Conversion rate",
    value: "11.2%",
    delta: "↑ 1.1%",
    positive: true,
    icon: "chart" as const,
  },
  {
    label: "Avg. sales cycle",
    value: "6.8 days",
    delta: "↓ 12%",
    positive: true,
    icon: "calendarClock" as const,
  },
  {
    label: "Avg. deal value",
    value: "$24,200",
    delta: "↑ 8%",
    positive: true,
    icon: "gauge" as const,
  },
];

export const team = [
  {
    name: "Maya Lin",
    initials: "SW",
    tone: "violet" as const,
    conversations: "742",
    deals: "98",
    conversion: 13.2,
    bar: "series-1" as const,
  },
  {
    name: "Jonah Reyes",
    initials: "DO",
    tone: "blue" as const,
    conversations: "685",
    deals: "87",
    conversion: 12.7,
    bar: "series-2" as const,
  },
  {
    name: "Nora Vance",
    initials: "MA",
    tone: "rose" as const,
    conversations: "623",
    deals: "65",
    conversion: 10.4,
    bar: "series-4" as const,
  },
  {
    name: "James Carter",
    initials: "JK",
    tone: "amber" as const,
    conversations: "598",
    deals: "54",
    conversion: 9.0,
    bar: "series-5" as const,
  },
  {
    name: "Theo Marsh",
    initials: "PM",
    tone: "green" as const,
    conversations: "540",
    deals: "43",
    conversion: 8.0,
    bar: "series-6" as const,
  },
];

export const recentActivity = [
  {
    title: "New deal won: 50 units — $1.2M",
    meta: "2m ago",
    icon: "briefcase" as const,
    tone: "series-3" as const,
  },
  {
    title: "Quotation QTN-2026-0117 viewed by Atlas Enterprises",
    meta: "5m ago",
    icon: "fileText" as const,
    tone: "series-1" as const,
  },
  {
    title: "Follow-up reminder: TechWorld Ltd",
    meta: "8m ago",
    icon: "bell" as const,
    tone: "series-4" as const,
  },
  {
    title: "New contact added: Grace Chen",
    meta: "14m ago",
    icon: "users" as const,
    tone: "series-2" as const,
  },
];

export const topProducts = [
  { name: 'Frame 27" 4K Monitor', units: "1,248 units", share: 82, tone: "series-1" as const },
  { name: "Langu Mechanical Keyboard", units: "842 units", share: 58, tone: "series-2" as const },
  { name: "NaoEvo LED Bulbs", units: "731 units", share: 48, tone: "series-3" as const },
];
