# 🧱 Architecture Overview

This document answers the question: **“What even is this project?”** It describes the main services, how they talk to each other, and where data lives.

---

## High-Level System

CritterStack is a small distributed system for tracking peculiar creatures and their world.

Planned/core services:
- **creature-service** – CRUD for creatures and species.
- **biome-service** – Describes locations/biomes where creatures live.
- **evolution-engine** – Runs background processes that evolve creatures over time.
- **API gateway / edge** – A single public entrypoint for frontends and third parties.

At the moment, **creature-service + frontend** are the parts that actually exist; the other services are planned and should follow the same patterns.

---

## Service Responsibilities

### creature-service
- **Domain:** Creatures, species, and their core metadata.
- **Endpoints:**
  - `GET /creatures` – list creatures
  - `GET /creatures/:id` – creature detail (with species)
  - `POST /creatures` – create creature
  - `GET /creatures/species` – list species
  - `POST /creatures/species` – create species
  - `PATCH /creatures/species/:name` – update species lore only
- **Database:** PostgreSQL via Prisma; owns the `Creature` and `Species` tables.
- **Clients:** React frontend for now; future services should call via HTTP.

### biome-service (planned)
- **Domain:** Biomes / locations, environmental tags, and what species prefer which areas.
- **Responsibilities:**
  - Define biomes (e.g. Emberwood, Hollow Fen, Luminous Thicket).
  - Track which species are observed in which biomes.
  - Provide read APIs for “where does this creature belong?” views.
- **Database:** Its own Postgres schema or database; never writes directly into creature-service tables.

### evolution-engine (planned)
- **Domain:** Time-based changes and simulations (aging, evolving, migrating).
- **Responsibilities:**
  - Consume events from other services (creature created, moved, observed).
  - Periodically update traits or derived state.
- **Database:** Owns its own persistence for runs, jobs, and derived stats.

### API Gateway (planned)
- **Domain:** Single front-door.
- **Responsibilities:**
  - Route `/api/creatures/*` requests to creature-service.
  - Route `/api/biomes/*` requests to biome-service.
  - Centralize CORS, auth, and rate limiting when those are introduced.

---

## Communication Patterns

- **Current state:** frontend → creature-service over HTTP (JSON), no gateway yet.
- **Future:**
  - Frontends and third parties call **API gateway**.
  - Gateway forwards to services over HTTP.
  - Services communicate with each other via HTTP or lightweight events (e.g. a queue or simple outbox table) when needed.

Services do **not** reach into each other’s databases directly; they use APIs.

---

## Data Ownership

- **creature-service** owns:
  - `Species` (canonical list of species + lore)
  - `Creature` (instances tied to species)
- **biome-service** will own:
  - `Biome` and any join tables that relate species/creatures to locations.
- **evolution-engine** will own:
  - Simulation runs, queued jobs, and derived/evolution state.

If another service needs species or creature data, it should **call creature-service**, not copy or mutate that data directly.

---

## Tech Stack by Service

- **creature-service**
  - Node.js, Express 5
  - Prisma ORM, PostgreSQL
  - Zod for request validation
  - Jest for tests

- **biome-service** (proposed)
  - Mirror creature-service stack for consistency: Node.js + Express + Prisma + Postgres.

- **evolution-engine** (proposed)
  - Node.js worker or simple queue processor.
  - Can also use Prisma + Postgres, but with its own schema.

- **API gateway** (proposed)
  - Lightweight Node.js/Express or edge function fronting the other services.

Keeping stacks aligned lowers cognitive load and makes patterns reusable across the project.

