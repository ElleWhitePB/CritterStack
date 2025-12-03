const API_BASE_URL = "http://localhost:3000";

export const api = {
  async getAllCreatures() {
    const response = await fetch(`${API_BASE_URL}/creatures`);
    if (!response.ok) {
      throw new Error("Failed to fetch creatures");
    }
    return response.json();
  },

  async getCreatureById(id) {
    const response = await fetch(`${API_BASE_URL}/creatures/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch creature");
    }
    return response.json();
  },

  async createCreature(data) {
    const response = await fetch(`${API_BASE_URL}/creatures`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create creature");
    }
    return response.json();
  },

  async getAllSpecies() {
    const response = await fetch(`${API_BASE_URL}/creatures/species`);
    if (!response.ok) {
      throw new Error("Failed to fetch species");
    }
    return response.json();
  },

  async createSpecies(data) {
    const response = await fetch(`${API_BASE_URL}/creatures/species`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create species");
    }
    return response.json();
  },

  async updateSpecies(data) {
    const response = await fetch(`${API_BASE_URL}/creatures/species/${data.name}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update species");
    }
    return response.json();
  },
};
