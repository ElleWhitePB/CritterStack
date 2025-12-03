// src/routes/creatures.js
import express from "express";
import { CreateCreatureSchema } from "../schemas/creature.js";
import {
	getAllCreatures,
	createCreature,
	getCreatureById,
	getAllSpecies,
	createSpecies,
	updateSpecies,
} from "../services/creatureService.js";

const router = express.Router();

// GET /creatures/species
router.get("/species", async (req, res) => {
    const species = await getAllSpecies();
    res.json(species);
});

// GET /creatures
router.get("/", async (req, res) => {
    const creatures = await getAllCreatures();

    if (!creatures) {
        return res.status(404).json({ error: "No creatures no found" });
    }

    res.json(creatures);
});

// GET /creatures/:id
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    const creature = await getCreatureById(id);

    if (!creature) {
        return res.status(404).json({ error: "Creature not found" });
    }

    res.json(creature);
});

// POST /species
router.post("/species", async (req, res) => {
    try {
        const { name, lore } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Species name is required" });
        }

        const species = await createSpecies({ name, lore: lore || null });
        res.status(201).json(species);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH /creatures/species/:name
router.patch("/species/:name", async (req, res) => {
	try {
		const name = req.params.name;
		const { lore } = req.body;

		if (!name) {
			return res.status(400).json({ error: "Species name is required" });
		}

		const hasLore =
			typeof lore !== "undefined" &&
			lore !== null &&
			String(lore).trim() !== "";

		if (!hasLore) {
			return res.status(400).json({ error: "No data provided" });
		}

		const updateData = { lore };
		const species = await updateSpecies(name, updateData);

		res.json(species);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// POST /creatures
router.post("/", async (req, res) => {
    try {
        const parsed = CreateCreatureSchema.parse(req.body);

        const creature = await createCreature(parsed);

        res.status(201).json(creature);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
