import { signal } from "nsh";
import { automationRules, type AutomationRule } from "./data";

export const automationRows = signal<AutomationRule[]>(automationRules);
export const newRuleOpen = signal(false);
export const runLogOpen = signal(false);
