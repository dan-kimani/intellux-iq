import { signal } from "nsh";
import type { WorkDialogState } from "./types";

export const workDialog = signal<WorkDialogState | null>(null);
export const workDialogOpen = signal(false);
let closeTimer: ReturnType<typeof setTimeout> | null = null;
let openTimer: ReturnType<typeof setTimeout> | null = null;

export function openWorkDialog(state: WorkDialogState): void {
  if (closeTimer) clearTimeout(closeTimer);
  if (openTimer) clearTimeout(openTimer);
  closeTimer = null;
  workDialogOpen.set(false);
  workDialog.set({ ...state, openedAt: Date.now() });
  openTimer = setTimeout(() => workDialogOpen.set(true), 10);
}

export function closeWorkDialog(): void {
  if (!workDialog() || !workDialogOpen()) return;
  workDialogOpen.set(false);
  closeTimer = setTimeout(() => {
    workDialog.set(null);
    closeTimer = null;
  }, 220);
}
