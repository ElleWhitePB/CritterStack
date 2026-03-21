const CREATURE_BASE = "http://localhost:3000";
const BIOME_BASE = "http://localhost:8000";

// ─── Creature Service ─────────────────────────────────────────

export const api = {
  async getAllCreatures() {
    const response = await fetch(`${CREATURE_BASE}/creatures`);
    if (!response.ok) throw new Error("Failed to fetch creatures");
    return response.json();
  },

  async getCreatureById(id) {
    const response = await fetch(`${CREATURE_BASE}/creatures/${id}`);
    if (!response.ok) throw new Error("Failed to fetch creature");
    return response.json();
  },

  async createCreature(data) {
    const response = await fetch(`${CREATURE_BASE}/creatures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create creature");
    }
    return response.json();
  },

  async deleteCreature(id) {
    const response = await fetch(`${CREATURE_BASE}/creatures/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete creature");
    }
  },

  async getAllSpecies() {
    const response = await fetch(`${CREATURE_BASE}/creatures/species`);
    if (!response.ok) throw new Error("Failed to fetch species");
    return response.json();
  },

  async createSpecies(data) {
    const response = await fetch(`${CREATURE_BASE}/creatures/species`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create species");
    }
    return response.json();
  },

  async updateSpecies(data) {
    const response = await fetch(
      `${CREATURE_BASE}/creatures/species/${data.name}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update species");
    }
    return response.json();
  },
};

// ─── Biome Service ────────────────────────────────────────────

const biomeError = async (response, fallback) => {
  try {
    const error = await response.json();
    const first = Object.values(error)[0];
    return Array.isArray(first) ? first[0] : fallback;
  } catch {
    return fallback;
  }
};

export const biomeApi = {
  async getAllBiomes({ includeInactive = false } = {}) {
    const params = includeInactive ? "?include_inactive=true" : "";
    const response = await fetch(`${BIOME_BASE}/biomes/${params}`);
    if (!response.ok) throw new Error("Failed to fetch biomes");
    return response.json();
  },

  async getBiomeById(id) {
    const response = await fetch(`${BIOME_BASE}/biomes/${id}/`);
    if (!response.ok) throw new Error("Failed to fetch biome");
    return response.json();
  },

  async createBiome(data) {
    const response = await fetch(`${BIOME_BASE}/biomes/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await biomeError(response, "Failed to create biome"));
    return response.json();
  },

  async updateBiome(id, data) {
    const response = await fetch(`${BIOME_BASE}/biomes/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await biomeError(response, "Failed to update biome"));
    return response.json();
  },

  async deleteBiome(id) {
    const response = await fetch(`${BIOME_BASE}/biomes/${id}/`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete biome");
  },
};
