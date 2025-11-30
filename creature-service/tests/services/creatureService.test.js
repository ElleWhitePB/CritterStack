import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Create mock functions
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();

// Mock the Prisma client module before importing anything else
jest.unstable_mockModule("../../src/db/client.js", () => ({
  prisma: {
    creature: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  },
}));

// Import after mocking
const { getAllCreatures, getCreatureById, createCreature } = await import("../../src/services/creatureService.js");

describe("Creature Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllCreatures", () => {
    it("should return all creatures", async () => {
      const mockCreatures = [
        { id: 1, name: "Fluffy", species: "Gleeble", createdAt: new Date() },
        { id: 2, name: "Spike", species: "Mossclaw Newt", createdAt: new Date() },
      ];

      mockFindMany.mockResolvedValue(mockCreatures);

      const result = await getAllCreatures();

      expect(result).toEqual(mockCreatures);
      expect(mockFindMany).toHaveBeenCalledTimes(1);
      expect(mockFindMany).toHaveBeenCalledWith();
    });

    it("should return empty array when no creatures exist", async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await getAllCreatures();

      expect(result).toEqual([]);
      expect(mockFindMany).toHaveBeenCalledTimes(1);
    });

    it("should throw error when database query fails", async () => {
      const dbError = new Error("Database connection failed");
      mockFindMany.mockRejectedValue(dbError);

      await expect(getAllCreatures()).rejects.toThrow("Database connection failed");
      expect(mockFindMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCreatureById", () => {
    it("should return a creature by id", async () => {
      const mockCreature = {
        id: 1,
        name: "Fluffy",
        species: "Gleeble",
        createdAt: new Date(),
      };

      mockFindUnique.mockResolvedValue(mockCreature);

      const result = await getCreatureById(1);

      expect(result).toEqual(mockCreature);
      expect(mockFindUnique).toHaveBeenCalledTimes(1);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return null when creature does not exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getCreatureById(999);

      expect(result).toBeNull();
      expect(mockFindUnique).toHaveBeenCalledTimes(1);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it("should throw error when database query fails", async () => {
      const dbError = new Error("Database connection failed");
      mockFindUnique.mockRejectedValue(dbError);

      await expect(getCreatureById(1)).rejects.toThrow("Database connection failed");
      expect(mockFindUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe("createCreature", () => {
    it("should create a new creature", async () => {
      const newCreatureData = {
        name: "Sparkles",
        species: "Gleeble",
      };

      const mockCreatedCreature = {
        id: 3,
        ...newCreatureData,
        createdAt: new Date(),
      };

      mockCreate.mockResolvedValue(mockCreatedCreature);

      const result = await createCreature(newCreatureData);

      expect(result).toEqual(mockCreatedCreature);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        data: newCreatureData,
      });
    });

    it("should create creature with all valid species", async () => {
      const validSpecies = ["Gleeble", "Mossclaw Newt", "Starback Shrew"];

      for (const species of validSpecies) {
        const newCreatureData = {
          name: `Test ${species}`,
          species: species,
        };

        const mockCreatedCreature = {
          id: 1,
          ...newCreatureData,
          createdAt: new Date(),
        };

        mockCreate.mockResolvedValue(mockCreatedCreature);

        const result = await createCreature(newCreatureData);

        expect(result.species).toBe(species);
      }
    });

    it("should throw error when database insert fails", async () => {
      const newCreatureData = {
        name: "Sparkles",
        species: "Gleeble",
      };

      const dbError = new Error("Database insert failed");
      mockCreate.mockRejectedValue(dbError);

      await expect(createCreature(newCreatureData)).rejects.toThrow("Database insert failed");
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });
});
