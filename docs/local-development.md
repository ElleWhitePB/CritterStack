# 🛠️ Local Development

This document captures the hard-won knowledge of getting CritterStack running locally.

---

## Prerequisites

- **OS:** macOS, Linux, or Windows with WSL2
- **Node.js:** LTS version (via nvm or similar)
- **Docker:** for running Postgres locally
- **npm:** comes with Node

Optional but helpful:
- **nodemon** for auto-reloading services
- A REST client (VS Code REST, Insomnia, Postman) for poking at APIs

---

## Repositories & Layout

From the project root:
- `creature-service/` – backend for creatures & species
- `frontend/` – React/Vite frontend
- `docs/` – project documentation (this file lives here)

Other services (biome-service, evolution-engine, gateway) will live in sibling folders.

---

## Environment Variables

In `creature-service/`, create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/critterstack?schema=public"
```

Make sure the protocol is **`postgresql://`** (not `postgres://`). The wrong scheme can connect but behave strangely.

---

## Running Postgres with Docker

From the project root:

```bash
docker compose up -d
```

or, if you are using a standalone container:

```bash
docker run --name critterstack-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

Verify it’s up:

```bash
docker ps
```

---

## Setting Up creature-service

From the `creature-service/` directory:

```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run seed
```

If the seed script fails, double-check:
- `DATABASE_URL` in `.env`
- that Postgres is running

### Running the service

```bash
npm run dev
```

The API will be available at: `http://localhost:3000`.

Key endpoints:
- `GET /creatures`
- `GET /creatures/:id`
- `POST /creatures`
- `GET /creatures/species`
- `POST /creatures/species`
- `PATCH /creatures/species/:name`

---

## Running the Frontend

From the `frontend/` directory:

```bash
npm install
npm run dev
```

By default Vite will start on `http://localhost:5173`.

The frontend talks to `creature-service` over HTTP. If you change ports, update the frontend’s API base URL accordingly.

---

## Resetting the Database

Sometimes you just want a clean slate.

From `creature-service/`:

```bash
npx prisma migrate reset
```

Follow the prompts; this will:
- Drop and recreate the database
- Re-apply all migrations
- Optionally re-run the seed script

You can always rerun the seed:

```bash
npm run seed
```

---

## Running Tests

From `creature-service/`:

```bash
npm test
```

This runs Jest tests for the service layer and helps ensure changes don’t break core behavior.

From `frontend/`, you can add component and integration tests over time; for now, manual testing in the browser is the main loop.

