import { Mail, MessageCircle, MonitorSmartphone } from "lucide-react";
import { copy } from "./copy";

export const channels = [
  {
    name: copy.channels.whatsapp,
    detail: copy.channels.whatsappDetail,
    metric: copy.channels.whatsappMetric,
    value: 99.8,
    status: copy.channels.healthy,
    tone: "healthy",
    icon: MessageCircle,
  },
  {
    name: copy.channels.email,
    detail: copy.channels.emailDetail,
    metric: copy.channels.emailMetric,
    value: 100,
    status: copy.channels.healthy,
    tone: "healthy",
    icon: Mail,
  },
  {
    name: copy.channels.devices,
    detail: copy.channels.devicesDetail,
    metric: copy.channels.devicesMetric,
    value: 90,
    status: copy.channels.attention,
    tone: "attention",
    icon: MonitorSmartphone,
  },
] as const;

export const pipelineStages = [
  { key: "enquiry", count: 18, value: "KES 2.4M" },
  { key: "qualified", count: 11, value: "KES 1.9M" },
  { key: "quotation", count: 7, value: "KES 1.28M" },
  { key: "negotiation", count: 4, value: "KES 860K" },
  { key: "won", count: 3, value: "KES 420K" },
  { key: "lost", count: 2, value: "KES 180K" },
] as const;

export const stageStyles = {
  enquiry: "border-sky-600/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  qualified: "border-violet-600/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  quotation: "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  negotiation: "border-orange-600/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  won: "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  lost: "border-border bg-muted text-muted-foreground",
} as const;

export const opportunities = [
  {
    name: "Acme Kenya — Q4 packaging",
    customer: "Acme Kenya",
    value: "KES 248,500",
    stage: "quotation",
    owner: "Yasir Noori",
    activity: "12m ago",
  },
  {
    name: "Mwangaza — retail display",
    customer: "Mwangaza Retail",
    value: "KES 184,200",
    stage: "qualified",
    owner: "Amina Kimani",
    activity: "1h ago",
  },
  {
    name: "Nairobi Office — bulk order",
    customer: "Nairobi Office Co.",
    value: "KES 96,750",
    stage: "negotiation",
    owner: "Yasir Noori",
    activity: "3h ago",
  },
  {
    name: "Kijani — new product line",
    customer: "Kijani Foods",
    value: "KES 412,000",
    stage: "enquiry",
    owner: "Moses Otieno",
    activity: "Yesterday",
  },
  {
    name: "Rift Valley — annual supply",
    customer: "Rift Valley Traders",
    value: "KES 338,900",
    stage: "won",
    owner: "James Njoroge",
    activity: "2d ago",
  },
] as const;
