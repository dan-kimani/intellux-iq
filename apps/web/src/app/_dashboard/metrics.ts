import { FileText, MessageSquare, MonitorSmartphone, Timer } from "lucide-react";
import { copy } from "./copy";

export const metrics = [
  {
    label: copy.metrics.conversations,
    value: copy.metrics.conversationsValue,
    note: copy.metrics.conversationsNote,
    tone: "up",
    icon: MessageSquare,
    tile: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    label: copy.metrics.quotations,
    value: copy.metrics.quotationsValue,
    note: copy.metrics.quotationsNote,
    tone: "up",
    icon: FileText,
    tile: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  {
    label: copy.metrics.response,
    value: copy.metrics.responseValue,
    note: copy.metrics.responseNote,
    tone: "up",
    icon: Timer,
    tile: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
  {
    label: copy.metrics.devices,
    value: copy.metrics.devicesValue,
    note: copy.metrics.devicesNote,
    tone: "attention",
    icon: MonitorSmartphone,
    tile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
] as const;

export const noteTone = {
  up: "text-emerald-700 dark:text-emerald-400",
  attention: "text-amber-700 dark:text-amber-400",
  down: "text-red-700 dark:text-red-400",
} as const;
