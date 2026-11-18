import { signal } from "nsh";
import { recoverySignals, type RecoverySignal } from "./data";

export const recoveryRows = signal<RecoverySignal[]>(recoverySignals);
export const recoveryDetail = signal<RecoverySignal | null>(null);
export const recoveryFilter = signal<"all" | "urgent" | "unassigned">("all");
export const recoveryResolved = signal(0);
