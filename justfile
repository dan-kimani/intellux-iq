default:
	@just --list

dev:
	bun run dev

desktop:
	bun run desktop

dev-desktop:
	bun run desktop

test:
	bun run test

test-desktop:
	bun run desktop:test

build:
	bun run build

check:
	bun run check

codegen:
	bun run codegen

db:
	bun run db:migrate

