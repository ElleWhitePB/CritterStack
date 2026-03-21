# Biome Service

The Biome Service manages ecosystems, environments, and the strange habitats under the care of the Department of Peculiar Creatures. Every creature needs somewhere to live — this service makes sure that somewhere is properly catalogued, rated for danger, and appropriately labeled by magical content.

## Overview

This service provides a RESTful API for creating, retrieving, updating, and managing biomes in the CritterStack ecosystem. Each biome has a name, climate, peril rating, and magic level. Biomes can be active or inactive, allowing the department to retire environments without permanently erasing them from the record.

## Tech Stack

- **Runtime**: Python 3.10+
- **Framework**: Django 4.2 + Django REST Framework
- **Database**: PostgreSQL (shared `critterstack` database)
- **Config**: python-dotenv
- **CORS**: django-cors-headers
- **Testing**: Django's built-in test runner with APITestCase

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health/` | Service health check |
| GET | `/biomes/` | List all active biomes |
| GET | `/biomes/?include_inactive=true` | List all biomes including inactive |
| GET | `/biomes/{id}/` | Get a single biome by ID |
| POST | `/biomes/` | Create a new biome |
| PATCH | `/biomes/{id}/` | Partially update a biome (including toggling active status) |
| DELETE | `/biomes/{id}/` | Delete a biome |

### Health Check

```
GET /health/
```

Returns service health status.

**Response:**

```json
{
  "status": "ok"
}
```

### List Biomes

```
GET /biomes/
GET /biomes/?include_inactive=true
```

By default, only active biomes are returned. Pass `?include_inactive=true` to include inactive ones as well.

### Get Biome by ID

```
GET /biomes/{id}/
```

**Error Responses:**

- `404` - Biome not found

### Create Biome

```
POST /biomes/
```

**Request Body:**

```json
{
  "name": "Emberfen Marsh",
  "description": "A slow-burning wetland that smells faintly of brimstone and regret.",
  "climate": "humid",
  "peril_rating": "moderate",
  "magic_level": "elevated"
}
```

**Required fields:** `name`, `description`

**Optional fields:** `climate`, `peril_rating`, `magic_level` (all default to `"unknown"` if omitted)

**Response:** `201 Created`

**Error Response:** `400 Bad Request`

```json
{
  "name": ["This field is required."]
}
```

### Partial Update

```
PATCH /biomes/{id}/
```

Update any subset of fields, including toggling `is_active`. Useful for filling in missing data inline or retiring a biome from active rotation.

**Example — deactivate a biome:**

```json
{
  "is_active": false
}
```

**Response:** `200 OK`

### Delete Biome

```
DELETE /biomes/{id}/
```

Permanently removes the biome from the database.

**Query Parameter:** `?unlink_creatures=true` — accepted but currently a no-op. Creature unlinking will be implemented in M3 when the Event Service is live.

**Response:** `204 No Content`

---

## Model Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | BigAutoField | Auto-generated primary key |
| `name` | CharField (max 50) | Unique; must start with a letter |
| `description` | TextField | Free-form description of the biome |
| `climate` | CharField | Defaults to `"unknown"` |
| `peril_rating` | CharField | Defaults to `"unknown"` |
| `magic_level` | CharField | Defaults to `"unknown"` |
| `is_active` | BooleanField | Defaults to `True`; toggle via PATCH |
| `created_at` | DateTimeField | Auto-set on creation |

---

## Validation Rules

The serializer enforces the following on `name`:

- Minimum 3 characters
- Maximum 50 characters
- Must start with a letter (not a digit or special character)
- Case-insensitive uniqueness — "emberfen marsh" and "Emberfen Marsh" are considered the same name
- On PATCH, uniqueness check excludes the biome being updated (so you can PATCH a biome without renaming it)

---

## Seed Data

The Department's field researchers have already catalogued five biomes to get you started:

- The Whispering Wood
- Emberfen Marsh
- The Hollow Peaks
- Gloomfall Caverns
- The Lumenwild Expanse

---

## Setup & Installation

### Prerequisites

- Python 3.10+
- PostgreSQL database (the shared `critterstack` DB)
- Docker (optional, for containerized database)

### Environment Variables

Create a `.env` file in the `biome-service/` directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/critterstack
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Installation

```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Seed the database with starter biomes
python manage.py seed_biomes

# Start the service
python manage.py runserver 8000
```

The service will be available at `http://localhost:8000`.

---

## Testing

The service includes unit tests covering both serializer validation and view behaviour.

```bash
python manage.py test biomes
```

**Test counts:**

- 9 serializer unit tests
- 16 view unit tests (using Django REST Framework's `APITestCase`)

---

## Project Structure

```
biome-service/
├── biome_service/
│   ├── settings.py          # Django settings
│   ├── urls.py              # Root URL config
│   └── wsgi.py
├── biomes/
│   ├── migrations/          # Database migrations
│   ├── management/
│   │   └── commands/
│   │       └── seed_biomes.py
│   ├── models.py            # Biome model
│   ├── serializers.py       # DRF serializer + validation
│   ├── views.py             # API views
│   ├── urls.py              # Biome URL config
│   └── tests/
│       ├── test_serializers.py
│       └── test_views.py
├── requirements.txt
└── README.md
```

---

## Notes on M3 Hook

The `DELETE /biomes/{id}/?unlink_creatures=true` query parameter is wired up and accepted by the endpoint but does nothing yet. When the Event Service (M3) is implemented, this hook will be used to cleanly disassociate any creatures linked to the deleted biome before removal. For now, deletion is unconditional.

---

## License

Part of the CritterStack project.
