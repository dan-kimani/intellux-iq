import { Hono } from "hono";

export const health = new Hono();

health.get("/", (c) =>
  c.json({
    ok: true,
    service: "api",
    version: "0.1.0",
  }),
);
