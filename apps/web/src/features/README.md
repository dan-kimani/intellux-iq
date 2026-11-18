# Web features

Thin web-console feature folders. They call Hono through `/api/v1` and compose
the shadcn components in `src/components/ui`; they never import cloud feature
packages or Postgres. There is no custom design-system package.
