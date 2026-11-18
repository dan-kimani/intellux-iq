import { FEATURE_ID } from "@intelluxiq/feature-identity";
import { Hono } from "hono";

export const identity = new Hono();

identity.get("/", (c) =>
  c.json({
    feature: FEATURE_ID,
    status: "scaffold",
    resources: ["orgs", "users", "memberships", "devices", "sessions"],
  }),
);
