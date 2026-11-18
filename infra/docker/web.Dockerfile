FROM oven/bun:1 AS build
WORKDIR /app
COPY . .
RUN bun install
WORKDIR /app/apps/web
RUN bun run build

FROM oven/bun:1
WORKDIR /app
COPY --from=build /app /app
WORKDIR /app/apps/web
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "start"]
