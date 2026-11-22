import { signal } from "nsh";

export type WatchKind = "conversation" | "email" | "task";
export type WatchFilter = "all" | "attention";
export type WatchSeverity = "critical" | "attention" | "quiet";

export interface WatchEntry {
  kind: WatchKind;
  refId: string;
  account?: string;
  watchedAt: number;
  snoozedUntil?: number;
  seenSignature?: string;
  seenAt?: number;
}

export interface WatchRow {
  entry: WatchEntry;
  kind: WatchKind;
  title: string;
  context: string;
  event: string;
  meta: string;
  severity: WatchSeverity;
  attention: boolean;
  attentionLabel?: string;
  newActivity: boolean;
  unread: number;
  snoozed: boolean;
  done?: boolean;
}

/** Seeded so the dock is populated when the prototype launches. */
const seedEntries: WatchEntry[] = [
  { kind: "task", refId: "task-1", watchedAt: 4 },
  { kind: "email", refId: "thread-pricing-q4", account: "sales", watchedAt: 3 },
  { kind: "conversation", refId: "david", watchedAt: 2 },
  { kind: "task", refId: "task-6", watchedAt: 1 },
];

export interface WatchPosition {
  x: number;
  y: number;
}

export const watchEntries = signal<WatchEntry[]>(seedEntries);
export const watchPosition = signal<WatchPosition | null>(null);
export const watchDockOpen = signal(false);
export const watchFilter = signal<WatchFilter>("all");

export function watchKey(entry: WatchEntry): string {
  return `${entry.kind}:${entry.refId}`;
}

export function watchId(kind: WatchKind, refId: string): string {
  return `${kind}:${refId}`;
}

export function isSnoozed(entry: WatchEntry, now: number): boolean {
  return (entry.snoozedUntil ?? 0) > now;
}
