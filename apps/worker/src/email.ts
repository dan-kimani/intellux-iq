import { log } from "@intelluxiq/telemetry";

log("worker.email.started", { queue: "email_jobs" });

// Cloud-only email protocol work. TODO: provider HTTP inbound/outbound;
// direct SMTP/IMAP only after a Bun compatibility spike.
setInterval(() => {}, 1 << 30);
