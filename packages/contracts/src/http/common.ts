import { z } from "zod";

export const ErrorResponse = z.object({
  code: z.string(),
  message: z.string(),
  retryable: z.boolean().default(false),
  details: z.unknown().optional(),
  request_id: z.string().optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponse>;

export const HealthResponse = z.object({
  ok: z.boolean(),
  service: z.string(),
  version: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponse>;

export const PaginationQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type PaginationQuery = z.infer<typeof PaginationQuery>;
