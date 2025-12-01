/*
  Warnings:

  - You are about to drop the column `species` on the `Creature` table. All the data in the column will be lost.
  - Added the required column `speciesName` to the `Creature` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Creature" DROP COLUMN "species",
ADD COLUMN     "speciesName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Species" (
    "name" TEXT NOT NULL,
    "lore" TEXT,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("name")
);

-- AddForeignKey
ALTER TABLE "Creature" ADD CONSTRAINT "Creature_speciesName_fkey" FOREIGN KEY ("speciesName") REFERENCES "Species"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
