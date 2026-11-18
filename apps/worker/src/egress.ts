import { log } from "@intelluxiq/telemetry";

log("worker.egress.started", { queue: "outbound_jobs" });

// TODO: claim outbound_jobs with FOR UPDATE SKIP LOCKED and dispatch providers.
setInterval(() => {}, 1 << 30);
