import { z } from "zod";

export const EventActor = z.object({
  user_id: z.string().nullable(),
  device_id: z.string().nullable(),
});

export const EventEnvelope = z.object({
  event_id: z.string(),
  org_id: z.string(),
  seq: z.number().int().nonnegative(),
  type: z.string(),
  entity_type: z.string(),
  entity_id: z.string().nullable(),
  schema_version: z.number().int().positive(),
  payload: z.unknown(),
  correlation_id: z.string(),
  causation_id: z.string(),
  producer: z.string(),
  actor: EventActor,
  created_at: z.string(),
});
export type EventEnvelope = z.infer<typeof EventEnvelope>;

export const CommandEnvelope = z.object({
  command_id: z.string(),
  org_id: z.string(),
  device_id: z.string(),
  type: z.string(),
  expected_version: z.number().int().nullable().optional(),
  idempotency_key: z.string(),
  trace_id: z.string(),
  sent_at: z.string(),
  payload: z.unknown(),
});
export type CommandEnvelope = z.infer<typeof CommandEnvelope>;
