import pkg from "@prisma/client";
const { PrismaClient } = pkg;

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...");

    const speciesData = [
        {
            name: "Gleeble",
            lore: "Tiny gelatinous chaos-beings that emit musical chirps when startled."
        },
        {
            name: "Moon-Pip",
            lore: "Shy, bioluminescent nocturnal creatures whose freckles pulse in soft patterns."
        },
        {
            name: "Thornbellow",
            lore: "Walking cactus-like creatures with rumbling dispositions and moon-timed blooms."
        },
        {
            name: "Sootling",
            lore: "Fire-dwelling sprites born from burnt wood, prone to mischief and smudging."
        },
        {
            name: "Eye-Sprite",
            lore: "Floating orbs that observe everything and remember more than you'd like."
        },
        {
            name: "Hearthmare",
            lore: "Smoke-and-ember horses that appear to lonely travelers and devour nightmares."
        },
        {
            name: "Wandergrub",
            lore: "Plump caterpillar-like creatures with bioluminescent antennae and endless appetites."
        },
        {
            name: "Lanternback",
            lore: "Large glowing beetles used as gentle, if clumsy, living lanterns."
        },
        {
            name: "Marrowfin",
            lore: "Skeletal-looking river fish with glowing ridges and spiral swimming patterns."
        },
        {
            name: "FrostNib",
            lore: "Tiny frost elementals that enjoy adjusting temperatures to annoy humans."
        },
        {
            name: "Star-Moth",
            lore: "Celestial moths that shimmer like stardust and follow quiet wishes."
        }
    ];

    // Insert species data
    for (const s of speciesData) {
        console.log(`Inserting species: ${s.name}`);
        const result = await prisma.species.upsert({
            where: { name: s.name },
            update: {},
            create: s,
        });
        console.log(`✓ Created/updated: ${result.name}`);
    }

    console.log("✅ Seed complete!");
}

main()
    .catch((err) => {
        console.error("❌ Seed error:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
