# 🧩 Service Patterns

This document captures the patterns you’re using across backend services so new code feels consistent.

---

## Layering

Each service follows a simple layering approach:

- **Routes / Controllers** (`src/routes/*.js`)
  - Define HTTP routes and wire them to handlers.
  - Parse route params and basic query parameters.
  - Call into service functions.

- **Services** (`src/services/*.js`)
  - Implement business logic.
  - Talk to Prisma / the database.
  - Never touch Express request/response objects.

- **Schemas / Validation** (`src/schemas/*.js`)
  - Zod schemas for request bodies.
  - Central place to define validation rules.

This separation makes it easy to test service logic without spinning up Express.

---

## Routing Conventions

- Base path per resource, e.g. `/creatures`, `/creatures/species`.
- More specific routes (like `/creatures/species`) are defined **before** catch-all routes like `/creatures/:id` to avoid routing conflicts.
- Routes are grouped by resource in a single file (e.g. `creatures.js`).

Example patterns:
- `GET /creatures` – list
- `GET /creatures/:id` – detail
- `POST /creatures` – create
- `GET /creatures/species` – related collection
- `POST /creatures/species` – create related entity
- `PATCH /creatures/species/:name` – partial update of related entity

---

## Validation Patterns

- Use Zod schemas in `src/schemas` (e.g. `CreateCreatureSchema`).
- Validate request bodies at the **route level** before calling service functions.

Example:
- Parse `req.body` with a Zod schema.
- Return `400` with a simple `{ error: message }` payload if validation fails.

This keeps services focused on domain logic and makes validation rules easy to find.

---

## Services & Database Access

- All direct database access happens in `src/services/*` via Prisma.
- Services export plain async functions, e.g. `getAllCreatures`, `createCreature`, `updateSpecies`.
- Routes call these functions and translate results into HTTP responses.

Benefits:
- Service functions are easy to unit test.
- If you ever move away from Prisma, you only need to change the service layer.

---

## Error Handling Style

- Route handlers use `try/catch` and respond with JSON errors:

```js
res.status(400).json({ error: err.message });
```

- Validation errors and “bad input” are `400`.
- Missing resources are `404` with a simple message.
- Unexpected exceptions are currently treated as `400` as well; over time you can introduce a `500`/logging pattern if needed.

---

## Adding a New Endpoint

1. **Define a schema** (if needed) in `src/schemas`.
2. **Add a service function** in `src/services` that does the data work.
3. **Add a route** in `src/routes` that:
   - Validates input.
   - Calls the service.
   - Translates the result into an HTTP response.
4. **Add tests** for the service function (and route if you later add integration tests).

Follow the existing `creature-service` patterns as a reference implementation.

---

## Frontend Integration Notes

- Services return JSON with simple, flat error structures:
  - `{ "error": "message" }` for failures.
- This keeps frontend error handling straightforward.

When you add new services (biome, evolution), aim to:
- Mirror these patterns.
- Reuse naming and structure (e.g. `/biomes`, `/biomes/:id`).

That way the whole stack feels like one coherent world, not a collection of unrelated micro-APIs.

