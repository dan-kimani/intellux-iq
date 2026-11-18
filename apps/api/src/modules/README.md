# API modules

Each domain gets a Hono route module here. It may import its feature package but
must not import another module's internals. `identity.ts` is the first example.
