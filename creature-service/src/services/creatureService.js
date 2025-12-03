// src/services/creatureService.js
import { prisma } from "../db/client.js";

export async function getAllCreatures() {
    return prisma.creature.findMany({
        include: { species: true },
    });
}

export async function getCreatureById(id) {
    return prisma.creature.findUnique({
        where: { id },
        include: { species: true },
    });
}

export function getAllSpecies() {
    return prisma.species.findMany();
}

export async function createSpecies(data) {
    return prisma.species.create({
        data,
    });
}

export async function createCreature(data) {
    return prisma.creature.create({
        data,
    });
}

export async function updateSpecies(name, data) {
	return prisma.species.update({
		where: { name: name },
		data,
	});
}
