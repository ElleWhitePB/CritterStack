# Creature Service

The Creature Service manages creature identities, traits, and lifecycle data for the Department of Peculiar Creatures.

## Overview

This service provides a RESTful API for creating, retrieving, and managing peculiar creatures in the CritterStack ecosystem. Each creature has a unique identity, belongs to a specific species, and is tracked with creation timestamps.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Database**: PostgreSQL
- **ORM**: Prisma with pg adapter
- **Validation**: Zod
- **Testing**: Jest
- **CORS**: Enabled for frontend integration

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status.

**Response:**
```json
{
  "status": "ok"
}
```

### Get All Creatures
```
GET /creatures
```
Retrieves all creatures from the database.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Fluffy",
    "species": "Gleeble",
    "createdAt": "2025-11-30T12:00:00.000Z"
  }
]
```

### Get Creature by ID
```
GET /creatures/:id
```
Retrieves a specific creature by ID.

**Parameters:**
- `id` (number) - Creature ID

**Response:**
```json
{
  "id": 1,
  "name": "Fluffy",
  "species": "Gleeble",
  "createdAt": "2025-11-30T12:00:00.000Z"
}
```

**Error Responses:**
- `400` - Invalid ID format
- `404` - Creature not found

### Create Creature
```
POST /creatures
```
Creates a new creature.

**Request Body:**
```json
{
  "name": "Sparkles",
  "species": "Gleeble"
}
```

**Validation:**
- `name` (string, required) - Creature name
- `species` (string, required) - Species type

**Response:** `201 Created`
```json
{
  "id": 2,
  "name": "Sparkles",
  "species": "Gleeble",
  "createdAt": "2025-11-30T12:05:00.000Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "Validation error message"
}
```

## Available Species

The following species are recognized by the Department:
- Gleeble
- Mossclaw Newt
- Starback Shrew
- Fluffernox
- Grumblethorn
- Shimmerwisp
- Puddlejumper
- Snortleaf
- Twinklepaw
- Bumblebark

## Database Schema

```prisma
model Creature {
  id        Int      @id @default(autoincrement())
  name      String
  species   String
  createdAt DateTime @default(now())
}
```

## Setup & Installation

### Prerequisites
- Node.js (LTS version)
- PostgreSQL database
- Docker (optional, for containerized database)

### Environment Variables

Create a `.env` file in the creature-service directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/critterstack?schema=public"
```

### Installation

```bash
# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Running the Service

```bash
# Development mode
npm run dev
```

The service will start on `http://localhost:3000`

### Using Docker

Start the PostgreSQL database:

```bash
# From the project root
cd docker
docker compose up -d
```

## Testing

The service includes comprehensive unit tests for the service layer with 100% code coverage.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

- ✅ **100% Statement Coverage**
- ✅ **100% Branch Coverage**
- ✅ **100% Function Coverage**
- ✅ **100% Line Coverage**

See [tests/README.md](./tests/README.md) for detailed testing documentation.

## Project Structure

```
creature-service/
├── src/
│   ├── db/
│   │   └── client.js          # Prisma client configuration
│   ├── routes/
│   │   └── creatures.js       # Creature route handlers
│   ├── schemas/
│   │   └── creature.js        # Zod validation schemas
│   ├── services/
│   │   └── creatureService.js # Business logic layer
│   └── index.js               # Express app entry point
├── tests/
│   ├── services/
│   │   └── creatureService.test.js
│   └── README.md
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── jest.config.js             # Jest configuration
├── package.json
└── README.md
```

## Development

### Adding New Endpoints

1. Define validation schema in `src/schemas/`
2. Add business logic to `src/services/`
3. Create route handler in `src/routes/`
4. Write unit tests in `tests/`
5. Update this README

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Prisma Studio

View and edit data in a GUI:

```bash
npx prisma studio
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `docker compose ps`
- Check DATABASE_URL in `.env`
- Ensure database exists: `critterstack`

### Port Already in Use

If port 3000 is already in use, modify the port in `src/index.js`:

```javascript
app.listen(3001, () => {
    console.log("Creature Service listening on port 3001");
});
```

### Prisma Client Issues

Regenerate the Prisma client:

```bash
npx prisma generate
```

## Future Enhancements

- [ ] Creature traits and attributes
- [ ] Lifecycle events (growth, evolution)
- [ ] Biome compatibility checks
- [ ] Creature relationships
- [ ] Pagination for GET /creatures
- [ ] Filtering and search capabilities
- [ ] Update and delete endpoints
- [ ] Request logging middleware

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure tests pass: `npm test`
5. Update documentation
6. Submit a pull request

## License

Part of the CritterStack project.
