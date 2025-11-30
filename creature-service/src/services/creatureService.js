// src/services/creatureService.js
import { prisma } from "../db/client.js";

export async function getAllCreatures() {
    return prisma.creature.findMany();
}

export async function getCreatureById(id) {
    return prisma.creature.findUnique({
        where: { id },
    });
}

export async function createCreature(data) {
    return prisma.creature.create({
        data,
    });
}
