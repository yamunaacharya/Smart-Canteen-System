/*
  Warnings:

  - Added the required column `category` to the `FoodItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `fooditem` ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    MODIFY `qty` INTEGER NOT NULL DEFAULT 1;
