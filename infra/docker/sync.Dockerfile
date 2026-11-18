FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install
WORKDIR /app/apps/sync
EXPOSE 3002
CMD ["bun", "src/index.ts"]
