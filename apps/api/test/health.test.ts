import { describe, expect, it } from "bun:test";
import { app } from "../src/app";

describe("health", () => {
  it("returns ok", async () => {
    const response = await app.request("/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, service: "api" });
  });
});
