# 🧬 Prisma & Database Guide

This document explains how Prisma and the database work in this repo so you don’t have to rediscover it later.

---

## Overview

- **ORM:** Prisma
- **Database:** PostgreSQL
- **Main schema:** defined in `creature-service/prisma/schema.prisma`
- **Client:** generated into `node_modules/.prisma` and consumed via `src/db/client.js`

Each backend service that needs a database should have its **own Prisma schema and migration history**, even if they all talk to the same Postgres instance.

---

## Migrations in This Repo

Inside `creature-service/`:

- `prisma/schema.prisma` defines models such as `Species` and `Creature`.
- `prisma/migrations/` contains migration history.

Common commands:

```bash
# Create and apply a new migration
npx prisma migrate dev --name meaningful-change

# Apply existing migrations to the dev database
npx prisma migrate dev

# Reset the DB and reapply everything
npx prisma migrate reset
```

> Tip: run migrations from the service directory that owns the schema (e.g. `creature-service/`).

---

## Adding a New Model

1. Edit `prisma/schema.prisma` in the appropriate service.
2. Add or update a model (example):

```prisma
model Biome {
  id    Int    @id @default(autoincrement())
  name  String @unique
}
```

3. Run a migration:

```bash
npx prisma migrate dev --name add-biome-model
```

4. Regenerate the client (usually done automatically by `migrate dev`, but safe to run):

```bash
npx prisma generate
```

5. Update service code to use the new model via the Prisma client.

---

## Seeding with Prisma 7

`creature-service` uses a seed script (see `package.json`) that populates initial species and creatures.

Typical flow:

```bash
npm run seed
```

The seed script uses the Prisma client under the hood and expects:
- `DATABASE_URL` to be set correctly
- migrations to have been applied beforehand

If you change models that affect seeded data, update the seed script to match.

---

## Resetting the Database Safely

When in doubt and in **local dev only**:

```bash
npx prisma migrate reset
```

This will:
- Drop the database
- Recreate it
- Apply all migrations
- Optionally run the seed script

Use this when things feel out of sync (e.g. tables don’t match schema, or seeds failed partway through).

---

## Gotchas & Notes

- **Protocol matters:** use `postgresql://` in `DATABASE_URL`.
- **Multiple services:** if/when biome-service or evolution-engine get their own databases, each should have **its own Prisma schema and migration history**.
- **ESM setup:** the Prisma client is imported from a small `src/db/client.js` helper; mirror this pattern in new services instead of importing directly everywhere.
- **Don’t edit generated client files:** always change the schema + run migrations instead.

