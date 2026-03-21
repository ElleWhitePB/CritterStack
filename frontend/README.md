# CritterStack Frontend

The React interface for the Department of Peculiar Creatures. Lets field researchers browse creatures and biomes, file new records, and occasionally press buttons they probably shouldn't.

## Overview

This is the frontend for CritterStack — a whimsical web UI that talks to the creature-service and biome-service APIs. It is built with React 18 and Vite and communicates with the backends entirely over the Fetch API.

## Tech Stack

- **Framework**: React 18
- **Build tool**: Vite
- **Styling**: Custom CSS with gradients and animations
- **Data fetching**: Fetch API (no external HTTP library)
- **State management**: React Hooks (useState, useEffect)

## Running the Frontend

### Prerequisites

- Node.js (LTS version)
- creature-service running on port 3000
- biome-service running on port 8000

### Install and start

```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

If you change a backend's port, update the corresponding base URL in `src/services/api.js`.

## Sections

### Creatures tab

- View all creatures in a paginated card layout (6 per page)
- Click a card to jump to the creature detail view
- Search for a creature by ID
- Create a new creature with name and species selection
- Species dropdown includes lore for each option
- Report a new species to the database
- Random name generator for creatures and species (the 🎲 button)
- Delete a creature from its detail card
- Toast notifications for success and error feedback

### Biomes tab

- View all active biomes in a paginated grid
- Paginated biome cards with active/inactive visual distinction
- Click a card to scroll to the biome detail view
- Register a new biome with the form (random name generator included)
- Inline field editing in the detail card for missing values (climate, peril_rating, magic_level)
- Toggle a biome's active/inactive status via PATCH
- Delete a biome with a confirmation step
- Sky-blue color palette to distinguish the biome sections from the creature sections

### Chronicle tab

Reserved for future use — the department's append-only event log will live here once the Event Service (M3) is implemented.

## Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app component; tab navigation and top-level state |
| `src/App.css` | All styling, including the creature (green) and biome (sky-blue) color palettes |
| `src/services/api.js` | Fetch API wrappers for creature-service and biome-service |
| `src/utils/nameGenerator.js` | Random name generator logic used by both creature and biome forms |

## Backend Services

| Service | Port | What the frontend uses it for |
|---------|------|-------------------------------|
| creature-service | 3000 | Creature and species CRUD |
| biome-service | 8000 | Biome CRUD, active/inactive toggling |

## License

Part of the CritterStack project.
