FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["bun", "src/index.ts"]
