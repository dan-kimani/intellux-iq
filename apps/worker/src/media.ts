import { log } from "@intelluxiq/telemetry";

log("worker.media.started", { queue: "media_jobs" });

// TODO: claim media jobs and run FFmpeg child processes.
setInterval(() => {}, 1 << 30);
