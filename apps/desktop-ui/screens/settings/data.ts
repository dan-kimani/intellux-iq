import type { AvatarTone } from "../../data";

export type SettingsTab =
  | "Workspace"
  | "Devices"
  | "Access"
  | "Intelligence"
  | "Shortcuts"
  | "Security";

export const settingsTabs: SettingsTab[] = [
  "Workspace",
  "Devices",
  "Access",
  "Intelligence",
  "Shortcuts",
  "Security",
];

export const devices = [
  {
    name: "Alex's MacBook Pro",
    platform: "macOS 15.6",
    status: "This device",
    tone: "chart-3" as const,
  },
  { name: "Alex's iPhone", platform: "iOS 26.1", status: "Linked", tone: "chart-2" as const },
  {
    name: "Finance workstation",
    platform: "Ubuntu 24.04",
    status: "Last seen 1h ago",
    tone: "chart-4" as const,
  },
];

export const accessRows = [
  { name: "Alex Morgan", role: "Sales Manager", devices: 2, tone: "violet" as AvatarTone },
  { name: "Priya Shah", role: "Sales", devices: 1, tone: "blue" as AvatarTone },
  { name: "Aiko Tanaka", role: "Sales", devices: 1, tone: "green" as AvatarTone },
  { name: "Sam Okafor", role: "Sales", devices: 1, tone: "amber" as AvatarTone },
];
