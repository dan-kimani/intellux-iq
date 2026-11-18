export type DeviceCursor = {
  deviceId: string;
  lastSeq: number;
};

export function nextSeq(lastSeq: number): number {
  return lastSeq + 1;
}

export function needsSnapshot(lastSeq: number, oldestRetainedSeq: number): boolean {
  return lastSeq + 1 < oldestRetainedSeq;
}
