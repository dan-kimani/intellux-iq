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
    name: "David's MacBook Pro",
    platform: "macOS 15.6",
    status: "This device",
    tone: "chart-3" as const,
  },
  { name: "David's iPhone", platform: "iOS 26.1", status: "Linked", tone: "chart-2" as const },
  {
    name: "Finance workstation",
    platform: "Ubuntu 24.04",
    status: "Last seen 1h ago",
    tone: "chart-4" as const,
  },
];

export const accessRows = [
  { name: "David Mwangi", role: "Sales Manager", devices: 2, tone: "violet" as AvatarTone },
  { name: "Yasir Noori", role: "Sales", devices: 1, tone: "blue" as AvatarTone },
  { name: "Amina Kimani", role: "Sales", devices: 1, tone: "green" as AvatarTone },
  { name: "Moses Otieno", role: "Sales", devices: 1, tone: "amber" as AvatarTone },
];
