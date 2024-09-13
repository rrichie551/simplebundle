/*
  Warnings:

  - Added the required column `bundleType` to the `Bundle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bundle" ADD COLUMN     "bundleType" TEXT NOT NULL;
