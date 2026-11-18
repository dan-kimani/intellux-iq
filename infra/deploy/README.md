# Deploy

Run `web`, `api`, `sync`, and `worker` as separate Bun containers behind Caddy
or a managed edge proxy. `/api/*` goes to Hono; `/sync` to Bun WSS; media uses
signed object-storage URLs.

Do not deploy the API or WSS as serverless functions.
