// src/schemas/creature.js
import { z } from "zod";

export const CreateCreatureSchema = z.object({
    name: z.string(),
    speciesName: z.string(),
});
