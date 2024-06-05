/*
  Warnings:

  - Added the required column `maxVolunteers` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Ong` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Ong` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Ong` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Ong` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Ong` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ActionCategory" AS ENUM ('EDUCATION', 'HEALTH', 'ENVIRONMENT', 'ANIMAL_WELFARE', 'ARTS_AND_CULTURE', 'HUMAN_RIGHTS', 'COMMUNITY_DEVELOPMENT', 'SCIENCE_AND_TECHNOLOGY', 'DISASTER_RELIEF', 'SPORTS', 'YOUTH', 'SENIORS');

-- CreateEnum
CREATE TYPE "OngCategory" AS ENUM ('EDUCATION', 'HEALTH', 'ENVIRONMENT', 'ANIMAL_WELFARE', 'ARTS_AND_CULTURE', 'HUMAN_RIGHTS', 'COMMUNITY_DEVELOPMENT', 'SCIENCE_AND_TECHNOLOGY', 'DISASTER_RELIEF', 'SPORTS', 'YOUTH', 'SENIORS');

-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "category" "ActionCategory"[],
ADD COLUMN     "maxVolunteers" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Ong" ADD COLUMN     "categories" "OngCategory"[],
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "url" TEXT,
ALTER COLUMN "name" SET NOT NULL;
