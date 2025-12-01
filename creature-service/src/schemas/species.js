// src/schemas/creature.js
import { z } from "zod";

export const SpeciesSchema = z.object({
    species: z.string(),
    lore: z.string(),
});
