import { Storage } from "nsh";
import {
  activeNav,
  activeNavChild,
  channelFilter,
  emailFolder,
  mailAccount,
  mailCompose,
  mailDetail,
  selectConversation,
  showToast,
} from "../state";
import { mailRows } from "../screens/inbox/mail";
import { mailReadingOpen, openMailItem } from "../screens/inbox/mailState";
import { taskEntityFilter, taskOwner, taskQuery, taskScope } from "../screens/tasks/view";
import { selectedTaskId, tasksTab } from "../screens/work/state";
import {
  isSnoozed,
  watchDockOpen,
  watchEntries,
  watchKey,
  watchId,
  watchPosition,
  type WatchEntry,
  type WatchKind,
  type WatchPosition,
  type WatchRow,
} from "./data";
import { watchSignature, watchThreadMessages } from "./rows";

export type { WatchEntry, WatchFilter, WatchKind, WatchPosition, WatchRow } from "./data";
export { watchDockOpen, watchEntries, watchFilter, watchId, watchKey, watchPosition } from "./data";
export { attentionCount, filteredWatchRows, watchedCount, watchRows } from "./rows";

const STORAGE_KEY = "intellux.watchlist";
const POSITION_KEY = "intellux.watch.position";
const SNOOZE_MS = 4 * 60 * 60 * 1000;

const snoozeTimers = new Map<string, ReturnType<typeof setTimeout>>();
let mutated = false;

function isKind(value: unknown): value is WatchKind {
  return value === "conversation" || value === "email" || value === "task";
}

function toEntry(value: unknown): WatchEntry | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (!isKind(row.kind) || typeof row.refId !== "string") return null;
  return {
    kind: row.kind,
    refId: row.refId,
    ...(typeof row.account === "string" ? { account: row.account } : {}),
    watchedAt: typeof row.watchedAt === "number" ? row.watchedAt : 0,
    ...(typeof row.snoozedUntil === "number" ? { snoozedUntil: row.snoozedUntil } : {}),
    ...(typeof row.seenSignature === "string" ? { seenSignature: row.seenSignature } : {}),
    ...(typeof row.seenAt === "number" ? { seenAt: row.seenAt } : {}),
  };
}

function parseEntries(raw: string): WatchEntry[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const seen = new Set<string>();
    const entries: WatchEntry[] = [];
    for (const value of parsed) {
      const entry = toEntry(value);
      const key = entry ? watchKey(entry) : "";
      if (!entry || seen.has(key)) continue;
      seen.add(key);
      entries.push(entry);
    }
    return entries;
  } catch {
    return null;
  }
}

function persist(): void {
  mutated = true;
  void Storage.setItem(STORAGE_KEY, JSON.stringify(watchEntries())).catch(() => {});
}

let positionMutated = false;

function toPosition(value: unknown): WatchPosition | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.x !== "number" || typeof row.y !== "number") return null;
  if (!Number.isFinite(row.x) || !Number.isFinite(row.y)) return null;
  return { x: row.x, y: row.y };
}

export function setWatchPosition(position: WatchPosition): void {
  positionMutated = true;
  watchPosition.set(position);
  void Storage.setItem(POSITION_KEY, JSON.stringify(position)).catch(() => {});
}

export function resetWatchPosition(): void {
  positionMutated = true;
  watchPosition.set(null);
  void Storage.removeItem(POSITION_KEY).catch(() => {});
}

void (async () => {
  try {
    const raw = await Storage.getItem(POSITION_KEY);
    if (!raw || positionMutated) return;
    const stored = toPosition(JSON.parse(raw));
    if (stored) watchPosition.set(stored);
  } catch {
    // The default bottom-right position applies without a stored position.
  }
})();

function scheduleWake(entry: WatchEntry): void {
  const key = watchKey(entry);
  const pending = snoozeTimers.get(key);
  if (pending) clearTimeout(pending);
  if (!entry.snoozedUntil) {
    snoozeTimers.delete(key);
    return;
  }
  const delay = Math.max(0, entry.snoozedUntil - Date.now());
  snoozeTimers.set(
    key,
    setTimeout(() => {
      watchEntries.set(
        watchEntries().map((row) =>
          watchKey(row) === key ? { ...row, snoozedUntil: undefined } : row,
        ),
      );
      persist();
      snoozeTimers.delete(key);
    }, delay),
  );
}

void (async () => {
  try {
    const raw = await Storage.getItem(STORAGE_KEY);
    if (!raw || mutated) return;
    const stored = parseEntries(raw);
    if (!stored) return;
    watchEntries.set(stored);
    for (const entry of stored) scheduleWake(entry);
  } catch {
    // Stored watches are optional; the seeded list still works without them.
  }
})();

function noun(kind: WatchKind): string {
  return kind === "email" ? "email thread" : kind;
}

function addWatch(kind: WatchKind, refId: string, account?: string): void {
  const entry: WatchEntry = {
    kind,
    refId,
    ...(account ? { account } : {}),
    watchedAt: Date.now(),
  };
  const signature = watchSignature(entry);
  if (signature) entry.seenSignature = signature;
  watchEntries.set([entry, ...watchEntries()]);
  persist();
  showToast(`Watching this ${noun(kind)}.`);
}

function removeWatch(kind: WatchKind, refId: string): void {
  const key = watchId(kind, refId);
  const timer = snoozeTimers.get(key);
  if (timer) clearTimeout(timer);
  snoozeTimers.delete(key);
  watchEntries.set(watchEntries().filter((entry) => watchKey(entry) !== key));
  persist();
  showToast("Stopped watching.");
}

export function isWatched(kind: WatchKind, refId: string): boolean {
  const key = watchId(kind, refId);
  return watchEntries().some((entry) => watchKey(entry) === key);
}

export function toggleWatch(kind: WatchKind, refId: string, account?: string): void {
  if (isWatched(kind, refId)) {
    removeWatch(kind, refId);
    return;
  }
  addWatch(kind, refId, account);
}

export function unwatch(kind: WatchKind, refId: string): void {
  removeWatch(kind, refId);
}

function markSeen(entry: WatchEntry, announce: boolean): void {
  const signature = watchSignature(entry);
  if (!signature) return;
  const key = watchKey(entry);
  const current = watchEntries().find((row) => watchKey(row) === key);
  if (!current || current.seenSignature === signature) return;
  watchEntries.set(
    watchEntries().map((row) =>
      watchKey(row) === key ? { ...row, seenSignature: signature, seenAt: Date.now() } : row,
    ),
  );
  persist();
  if (announce) showToast("Marked seen.");
}

export function markWatchSeen(entry: WatchEntry): void {
  markSeen(entry, true);
}

export function toggleSnooze(entry: WatchEntry): void {
  const key = watchKey(entry);
  const current = watchEntries().find((row) => watchKey(row) === key);
  if (!current) return;
  const snoozed = isSnoozed(current, Date.now());
  const next: WatchEntry = {
    ...current,
    snoozedUntil: snoozed ? undefined : Date.now() + SNOOZE_MS,
  };
  watchEntries.set(watchEntries().map((row) => (watchKey(row) === key ? next : row)));
  scheduleWake(next);
  persist();
  showToast(snoozed ? "Watching again." : "Snoozed for 4 hours.");
}

/** Lifts the dock above the conversation composer instead of covering Send. */
export function watchDockOffset(): number {
  return activeNav() === "Inbox" && channelFilter() !== "email" ? 112 : 0;
}

export function openWatchRow(row: WatchRow): void {
  markSeen(row.entry, false);
  watchDockOpen.set(false);
  if (row.kind === "conversation") {
    activeNavChild.set("inbox");
    activeNav.set("Inbox");
    channelFilter.set("all");
    mailDetail.set(null);
    mailCompose.set(null);
    selectConversation(row.entry.refId);
    return;
  }
  if (row.kind === "email") {
    const messages = watchThreadMessages(row.entry);
    const latest = messages[0];
    if (!latest) return;
    const ids = messages.map((item) => item.id);
    mailRows.set(
      mailRows().map((item) => (ids.includes(item.id) ? { ...item, read: true } : item)),
    );
    activeNavChild.set("inbox");
    activeNav.set("Inbox");
    channelFilter.set("email");
    mailAccount.set(latest.account);
    emailFolder.set(latest.folder);
    mailReadingOpen.set(true);
    openMailItem({ ...latest, read: true });
    return;
  }
  taskScope.set("all");
  taskEntityFilter.set(null);
  taskQuery.set("");
  taskOwner.set("all");
  tasksTab.set("tasks");
  selectedTaskId.set(row.entry.refId);
  activeNavChild.set("tasks");
  activeNav.set("Tasks");
}
