-- Add startTime and endTime columns to Task table for time range functionality
ALTER TABLE `Task` ADD COLUMN `startTime` VARCHAR(5) DEFAULT '08:00';
ALTER TABLE `Task` ADD COLUMN `endTime` VARCHAR(5) DEFAULT '09:00';
