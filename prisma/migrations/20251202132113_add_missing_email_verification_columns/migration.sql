/*
  Warnings:

  - A unique constraint covering the columns `[emailVerificationToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `startTime` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endTime` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `StreakHistory` DROP FOREIGN KEY `StreakHistory_streakId_fkey`;

-- DropForeignKey
ALTER TABLE `StreakHistory` DROP FOREIGN KEY `StreakHistory_userId_fkey`;

-- DropIndex
DROP INDEX `StreakHistory_streakId_userId_idx` ON `StreakHistory`;

-- AlterTable
ALTER TABLE `Streak` MODIFY `photoUrl` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `StreakHistory` ALTER COLUMN `userId` DROP DEFAULT,
    ALTER COLUMN `description` DROP DEFAULT,
    MODIFY `photoUrl` LONGTEXT NULL,
    ALTER COLUMN `title` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Task` MODIFY `startTime` VARCHAR(191) NOT NULL DEFAULT '08:00',
    MODIFY `endTime` VARCHAR(191) NOT NULL DEFAULT '09:00';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `emailVerificationToken` VARCHAR(191) NULL,
    ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `StreakHistory_streakId_fkey` ON `StreakHistory`(`streakId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_emailVerificationToken_key` ON `User`(`emailVerificationToken`);

-- AddForeignKey
ALTER TABLE `StreakHistory` ADD CONSTRAINT `StreakHistory_streakId_fkey` FOREIGN KEY (`streakId`) REFERENCES `Streak`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StreakHistory` ADD CONSTRAINT `StreakHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `StreakHistory` RENAME INDEX `StreakHistory_userId_idx` TO `StreakHistory_userId_fkey`;
