# Worker jobs

Each feature's background jobs live in `jobs/<feature>/`. Egress, media, and
email workers claim from the Postgres `outbound_jobs`/media queues and call
providers; API modules never call providers directly.
