import { signal, Storage } from "nsh";
import type { CurrencyCode } from "../../lib/money";

export const deviceLinkOpen = signal(false);
export const onboardingOpen = signal(false);
export const accessSettingsOpen = signal(false);
export const workspaceEditOpen = signal(false);
export const thresholdsEditOpen = signal(false);
export const workspace = signal({
  name: "Acme Trading Inc.",
  currency: "USD" as CurrencyCode,
  timezone: "America/New_York",
  digest: true,
});
export const thresholds = signal({
  responseSla: "30 minutes",
  silentCustomer: "3 business days",
  opportunityInactivity: "7 days",
});

export function setCurrency(currency: CurrencyCode): void {
  workspace.set({ ...workspace(), currency });
  void Storage.setItem("intellux.currency", currency);
}
