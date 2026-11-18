import { signal } from "nsh";
import { segmentRows, type SegmentRow, type SegmentRule } from "./data";

export const segmentList = signal<SegmentRow[]>(segmentRows);
export const selectedSegmentId = signal("high-intent");

export function selectedSegment(): SegmentRow {
  return segmentList().find((segment) => segment.id === selectedSegmentId()) ?? segmentList()[0]!;
}

export function updateSegment(id: string, patch: Partial<SegmentRow>): void {
  segmentList.set(
    segmentList().map((segment) => (segment.id === id ? { ...segment, ...patch } : segment)),
  );
}

export function addRule(id: string, rule: SegmentRule): void {
  const segment = segmentList().find((row) => row.id === id);
  if (!segment) return;
  updateSegment(id, { rules: [...segment.rules, rule], updated: "Draft" });
}

export function removeRule(id: string, index: number): void {
  const segment = segmentList().find((row) => row.id === id);
  if (!segment) return;
  updateSegment(id, {
    rules: segment.rules.filter((_, ruleIndex) => ruleIndex !== index),
    updated: "Draft",
  });
}
