export type OutboundJob = {
  jobId: string;
  orgId: string;
  channel: "whatsapp" | "email" | "voice";
  idempotencyKey: string;
  payload: unknown;
};

export interface OutboundQueue {
  enqueue(job: OutboundJob): Promise<void>;
  claim(limit: number): Promise<OutboundJob[]>;
  ack(jobId: string): Promise<void>;
  fail(jobId: string, error: string): Promise<void>;
}
