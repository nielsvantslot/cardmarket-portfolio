# CardVault

CardVault is a Pokemon card portfolio tracker built with Next.js.

## What changed

- Filters out TCG Pocket cards from search and hydrated card results.
- Added account-based authentication (register/login/logout).
- Migrated portfolio + sealed products from localStorage to Postgres-backed persistence.
- Added portfolio value snapshots and value-history graph on the portfolio page.
- Added Dockerized Postgres and Prisma ORM setup for development.

## Stack

- Next.js 16
- React 19
- Prisma ORM
- PostgreSQL (Docker)
- Recharts (portfolio history graph)

## Development setup

1. Install dependencies:

```bash
npm install
```

2. Start Postgres:

```bash
npm run db:up
```

3. Confirm `.env` values (already scaffolded for local dev):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/card_portfolio?schema=public"
AUTH_SECRET="dev-only-change-me-before-production"
```

4. Run Prisma migration + client generation:

```bash
npm run prisma:migrate
npm run prisma:generate
```

5. Start the app:

```bash
npm run dev
```

## Useful commands

- `npm run db:up` - start local Postgres
- `npm run db:down` - stop local Postgres
- `npm run prisma:migrate` - create/apply schema migrations
- `npm run prisma:generate` - regenerate Prisma client
- `npm run prisma:studio` - open Prisma Studio

## Notes

- Session auth uses an httpOnly cookie signed with `AUTH_SECRET`.
- Portfolio history snapshots are throttled server-side (6-hour cooldown) to avoid duplicate points.
- For production, rotate `AUTH_SECRET` and use a managed Postgres instance.

## Vercel deployment

1. Provision a hosted Postgres database (Neon, Supabase, Railway, etc.).
2. In Vercel project settings, set environment variables:
	- `DATABASE_URL`
	- `AUTH_SECRET`
3. Set Build Command to:

```bash
npm run vercel-build
```

This project also runs `prisma generate` automatically on `postinstall` to make sure the Prisma client is available in Vercel builds.
