import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Create mock functions for creature operations
const mockCreatureFindMany = jest.fn();
const mockCreatureFindUnique = jest.fn();
const mockCreatureCreate = jest.fn();

// Create mock functions for species operations
const mockSpeciesFindMany = jest.fn();
const mockSpeciesCreate = jest.fn();

// Mock the Prisma client module before importing anything else
jest.unstable_mockModule("../../src/db/client.js", () => ({
  prisma: {
    creature: {
      findMany: mockCreatureFindMany,
      findUnique: mockCreatureFindUnique,
      create: mockCreatureCreate,
    },
    species: {
      findMany: mockSpeciesFindMany,
      create: mockSpeciesCreate,
    },
  },
}));

// Import after mocking
const { getAllCreatures, getCreatureById, createCreature, getAllSpecies, createSpecies } = await import("../../src/services/creatureService.js");

describe("Creature Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllCreatures", () => {
    it("should return all creatures with species information", async () => {
      const mockCreatures = [
        {
          id: 1,
          name: "Fluffy",
          speciesName: "Gleeble",
          createdAt: new Date(),
          species: { name: "Gleeble", lore: "Tiny gelatinous chaos-beings" },
        },
        {
          id: 2,
          name: "Spike",
          speciesName: "Moon-Pip",
          createdAt: new Date(),
          species: { name: "Moon-Pip", lore: "Shy, bioluminescent nocturnal creatures" },
        },
      ];

      mockCreatureFindMany.mockResolvedValue(mockCreatures);

      const result = await getAllCreatures();

      expect(result).toEqual(mockCreatures);
      expect(mockCreatureFindMany).toHaveBeenCalledTimes(1);
      expect(mockCreatureFindMany).toHaveBeenCalledWith({ include: { species: true } });
    });

    it("should return empty array when no creatures exist", async () => {
      mockCreatureFindMany.mockResolvedValue([]);

      const result = await getAllCreatures();

      expect(result).toEqual([]);
      expect(mockCreatureFindMany).toHaveBeenCalledTimes(1);
    });

    it("should throw error when database query fails", async () => {
      const dbError = new Error("Database connection failed");
      mockCreatureFindMany.mockRejectedValue(dbError);

      await expect(getAllCreatures()).rejects.toThrow("Database connection failed");
      expect(mockCreatureFindMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCreatureById", () => {
    it("should return a creature by id with species information", async () => {
      const mockCreature = {
        id: 1,
        name: "Fluffy",
        speciesName: "Gleeble",
        createdAt: new Date(),
        species: { name: "Gleeble", lore: "Tiny gelatinous chaos-beings" },
      };

      mockCreatureFindUnique.mockResolvedValue(mockCreature);

      const result = await getCreatureById(1);

      expect(result).toEqual(mockCreature);
      expect(mockCreatureFindUnique).toHaveBeenCalledTimes(1);
      expect(mockCreatureFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { species: true },
      });
    });

    it("should return null when creature does not exist", async () => {
      mockCreatureFindUnique.mockResolvedValue(null);

      const result = await getCreatureById(999);

      expect(result).toBeNull();
      expect(mockCreatureFindUnique).toHaveBeenCalledTimes(1);
      expect(mockCreatureFindUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: { species: true },
      });
    });

    it("should throw error when database query fails", async () => {
      const dbError = new Error("Database connection failed");
      mockCreatureFindUnique.mockRejectedValue(dbError);

      await expect(getCreatureById(1)).rejects.toThrow("Database connection failed");
      expect(mockCreatureFindUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe("createCreature", () => {
    it("should create a new creature with speciesName", async () => {
      const newCreatureData = {
        name: "Sparkles",
        speciesName: "Gleeble",
      };

      const mockCreatedCreature = {
        id: 3,
        ...newCreatureData,
        createdAt: new Date(),
      };

      mockCreatureCreate.mockResolvedValue(mockCreatedCreature);

      const result = await createCreature(newCreatureData);

      expect(result).toEqual(mockCreatedCreature);
      expect(mockCreatureCreate).toHaveBeenCalledTimes(1);
      expect(mockCreatureCreate).toHaveBeenCalledWith({
        data: newCreatureData,
      });
    });

    it("should create creature with all valid species", async () => {
      const validSpecies = ["Gleeble", "Moon-Pip", "Thornbellow"];

      for (const speciesName of validSpecies) {
        const newCreatureData = {
          name: `Test ${speciesName}`,
          speciesName: speciesName,
        };

        const mockCreatedCreature = {
          id: 1,
          ...newCreatureData,
          createdAt: new Date(),
        };

        mockCreatureCreate.mockResolvedValue(mockCreatedCreature);

        const result = await createCreature(newCreatureData);

        expect(result.speciesName).toBe(speciesName);
      }
    });

    it("should throw error when database insert fails", async () => {
      const newCreatureData = {
        name: "Sparkles",
        speciesName: "Gleeble",
      };

      const dbError = new Error("Database insert failed");
      mockCreatureCreate.mockRejectedValue(dbError);

      await expect(createCreature(newCreatureData)).rejects.toThrow("Database insert failed");
      expect(mockCreatureCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllSpecies", () => {
    it("should return all species", async () => {
      const mockSpecies = [
        { name: "Gleeble", lore: "Tiny gelatinous chaos-beings that emit musical chirps when startled." },
        { name: "Moon-Pip", lore: "Shy, bioluminescent nocturnal creatures whose freckles pulse in soft patterns." },
        { name: "Thornbellow", lore: "Thorny creatures with deep, resonant calls." },
      ];

      mockSpeciesFindMany.mockResolvedValue(mockSpecies);

      const result = await getAllSpecies();

      expect(result).toEqual(mockSpecies);
      expect(mockSpeciesFindMany).toHaveBeenCalledTimes(1);
      expect(mockSpeciesFindMany).toHaveBeenCalledWith();
    });

    it("should return empty array when no species exist", async () => {
      mockSpeciesFindMany.mockResolvedValue([]);

      const result = await getAllSpecies();

      expect(result).toEqual([]);
      expect(mockSpeciesFindMany).toHaveBeenCalledTimes(1);
    });

    it("should throw error when database query fails", async () => {
      const dbError = new Error("Database connection failed");
      mockSpeciesFindMany.mockRejectedValue(dbError);

      await expect(getAllSpecies()).rejects.toThrow("Database connection failed");
      expect(mockSpeciesFindMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("createSpecies", () => {
    it("should create a new species with name and lore", async () => {
      const newSpeciesData = {
        name: "Sparklebeast",
        lore: "A rare creature that shimmers with inner light.",
      };

      const mockCreatedSpecies = {
        ...newSpeciesData,
      };

      mockSpeciesCreate.mockResolvedValue(mockCreatedSpecies);

      const result = await createSpecies(newSpeciesData);

      expect(result).toEqual(mockCreatedSpecies);
      expect(mockSpeciesCreate).toHaveBeenCalledTimes(1);
      expect(mockSpeciesCreate).toHaveBeenCalledWith({
        data: newSpeciesData,
      });
    });

    it("should create a new species with name only (lore optional)", async () => {
      const newSpeciesData = {
        name: "Shimmerwisp",
      };

      const mockCreatedSpecies = {
        ...newSpeciesData,
        lore: null,
      };

      mockSpeciesCreate.mockResolvedValue(mockCreatedSpecies);

      const result = await createSpecies(newSpeciesData);

      expect(result.name).toBe("Shimmerwisp");
      expect(result.lore).toBeNull();
      expect(mockSpeciesCreate).toHaveBeenCalledTimes(1);
    });

    it("should throw error when database insert fails", async () => {
      const newSpeciesData = {
        name: "Sparklebeast",
        lore: "A rare creature that shimmers with inner light.",
      };

      const dbError = new Error("Unique constraint failed: Species.name");
      mockSpeciesCreate.mockRejectedValue(dbError);

      await expect(createSpecies(newSpeciesData)).rejects.toThrow("Unique constraint failed: Species.name");
      expect(mockSpeciesCreate).toHaveBeenCalledTimes(1);
    });
  });
});
