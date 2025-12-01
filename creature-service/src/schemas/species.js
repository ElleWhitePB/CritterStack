// src/schemas/creature.js
import { z } from "zod";

export const SpeciesSchema = z.object({
    name: z.string(),
    lore: z.string(),
});
