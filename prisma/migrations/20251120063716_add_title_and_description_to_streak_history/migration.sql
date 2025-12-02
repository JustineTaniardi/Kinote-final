/*
  Warnings:

  - Added the required column `title` to the `StreakHistory` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `StreakHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `StreakHistory` ADD COLUMN `title` VARCHAR(191) NOT NULL DEFAULT 'Session',
    MODIFY `description` VARCHAR(191) NOT NULL DEFAULT '';

-- Update existing rows with empty descriptions
UPDATE `StreakHistory` SET `description` = '' WHERE `description` IS NULL;
