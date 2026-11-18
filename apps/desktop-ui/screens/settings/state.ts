import { signal } from "nsh";

export const deviceLinkOpen = signal(false);
export const onboardingOpen = signal(false);
export const accessSettingsOpen = signal(false);
export const workspaceEditOpen = signal(false);
export const thresholdsEditOpen = signal(false);
export const workspace = signal({
  name: "Acme Trading Ltd",
  currency: "KES",
  timezone: "Africa/Nairobi",
  digest: true,
});
export const thresholds = signal({
  responseSla: "30 minutes",
  silentCustomer: "3 business days",
  opportunityInactivity: "7 days",
});
