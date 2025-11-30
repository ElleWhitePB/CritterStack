// src/routes/creatures.js
import express from "express";
import { CreateCreatureSchema } from "../schemas/creature.js";
import { getAllCreatures, createCreature, getCreatureById } from "../services/creatureService.js";

const router = express.Router();

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
