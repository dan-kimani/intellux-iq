import { signal } from "nsh";

export type ActivityKind = "note" | "task";

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  text: string;
  meta: string;
  at: string;
}

export const contactActivities = signal<Record<string, ActivityEntry[]>>({});
export const dealActivities = signal<Record<string, ActivityEntry[]>>({});

export function addContactActivity(contactId: string, entry: ActivityEntry): void {
  contactActivities.set({
    ...contactActivities(),
    [contactId]: [entry, ...(contactActivities()[contactId] ?? [])],
  });
}

export function addDealActivity(dealId: string, entry: ActivityEntry): void {
  dealActivities.set({
    ...dealActivities(),
    [dealId]: [entry, ...(dealActivities()[dealId] ?? [])],
  });
}
