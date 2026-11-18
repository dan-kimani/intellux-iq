FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install
WORKDIR /app/apps/worker
CMD ["bun", "src/egress.ts"]
