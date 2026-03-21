# 🛠️ Local Development

This document captures the hard-won knowledge of getting CritterStack running locally. It covers creature-service (Node.js), biome-service (Django), and the React frontend.

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

- `creature-service/` – backend for creatures & species (Node.js + Express)
- `biome-service/` – backend for biomes and environments (Django + DRF)
- `frontend/` – React/Vite frontend
- `docs/` – project documentation (this file lives here)

Other services (evolution-engine, gateway) will live in sibling folders.

---

## Environment Variables

### creature-service

In `creature-service/`, create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/critterstack?schema=public"
```

Make sure the protocol is **`postgresql://`** (not `postgres://`). The wrong scheme can connect but behave strangely.

### biome-service

In `biome-service/`, create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/critterstack
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

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

## Setting Up biome-service

From the `biome-service/` directory:

```bash
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_biomes
```

If the seed command fails, double-check:

- `.env` is present and `DATABASE_URL` is correct
- Postgres is running and the `critterstack` database exists

### Running the service

```bash
python manage.py runserver 8000
```

The API will be available at: `http://localhost:8000`.

Key endpoints:

- `GET /health/`
- `GET /biomes/`
- `GET /biomes/{id}/`
- `POST /biomes/`
- `PATCH /biomes/{id}/`
- `DELETE /biomes/{id}/`

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

### creature-service

From `creature-service/`:

```bash
npm test
```

This runs Jest tests for the service layer and helps ensure changes don’t break core behavior.

### biome-service

From `biome-service/` (with the venv active):

```bash
python manage.py test biomes
```

This runs 25 unit tests: 9 covering serializer validation and 16 covering API view behaviour.

### frontend

From `frontend/`, you can add component and integration tests over time; for now, manual testing in the browser is the main loop.
