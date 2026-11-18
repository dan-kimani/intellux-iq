import { Hono } from "hono";
import { health } from "./modules/health";
import { identity } from "./modules/identity";

export const app = new Hono();

app.route("/health", health);
app.route("/v1/identity", identity);
